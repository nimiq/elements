import XElement from '/libraries/x-element/x-element.js';
import LazyLoading from '/libraries/nimiq-utils/lazy-loading/lazy-loading.js';

// The following flows should be tested if changing this code:
// - ledger not connected yet
// - ledger connected
// - ledger was connected but relocked
// - ledger connected but in another app
// - connect timed out
// - request timed out
// - user approved action
// - user denied action
// - user cancel
// - user cancel and immediately make another request
// - ledger already handling another request (from another tab)

// Some notes about the behaviour of the ledger:
// - The ledger only supports one call at a time.
// - If the browser doesn't support U2F, an exception gets thrown ("U2F browser support is needed for Ledger")
// - Firefox' implementation of U2F (when enabled in about:config) does not seem to be compatible with ledger and
//   throws "U2F DEVICE_INELIGIBLE"
// - The browsers U2F API has a timeout after which the call fails in the browser. The timeout is about 30s
// - For requests with display on the ledger, the ledger keeps displaying the request even if it timed out. When the
//   user confirms or declines that request after the timeout the ledger ignores that and freezes on second press.
// - After a request timed out, it is possible to send a new request to the ledger essentially replacing the old
//   request. If the ledger is still displaying the UI from the previous timed out request and the new request also has
//   a UI, the old UI also gets replaced. The animation of the new request starts at the beginning.
// - Although a previous request can be replaced immediately after the timeout exception (no device busy exception gets
//   thrown and the UI gets replaced), the buttons still seem to be assigned to the previous request if there is no
//   wait time between the requests. Wait time <1s is too short. Wait times between 1s and 1.5s behave strange as the
//   old request doesn't get replaced at all. 1.5s seems to be reliable. At that time, the signTransaction UI also
//   forms a nice loop with the replaced UI.
// - If the user confirms or declines during the wait time nothing happens (or freeze at second button press) which
//   is a bad user experience but there is nothing we can do about it.
// - If the ledger froze, it gets unfrozen by sending a new request. If the request has a UI, the UI gets displayed,
//   otherwise the Nimiq app gets displayed. If the user confirms the new request, the app afterwards behaves normal.
//   If he declines the request though, any request afterwards seems to time out and the nimiq ledger app needs to be
//   restarted. This is a corner case that is not covered in XLedgerUi.
// - If the ledger is busy with another call it throws an exception that it is busy. The ledger API however only knows,
//   if the ledger is busy by another call from this same page. It doesn't know about requests from other tabs and also
//   doesn't recognize that the device is busy if we make the exact same api call.
// - Requests that were cancelled in XLedgerUi are not actually cancelled on the ledger and keep the ledger busy until
//   the request times out or the user confirms/declines. This is the only case where we can actually get the busy
//   busy exception in XLedgerUi.

export default class XLedgerUi extends XElement {
    html() {
        return `
            <div ledger-device-container>
                <div ledger-cable></div>
                <div ledger-device></div>
                <div ledger-screen-pin class="ledger-screen">
                    <div ledger-pin-dot></div>
                    <div ledger-pin-dot></div>
                    <div ledger-pin-dot></div>
                    <div ledger-pin-dot></div>
                    <div ledger-pin-dot></div>
                    <div ledger-pin-dot></div>
                    <div ledger-pin-dot></div>
                    <div ledger-pin-dot></div>
                </div>
                <div ledger-screen-home class="ledger-screen"></div>
                <div ledger-screen-app class="ledger-screen"></div>
                <div ledger-screen-confirm-address class="ledger-screen"></div>
                <div ledger-screen-confirm-transaction class="ledger-screen"></div>
            </div>
            <h3 instructions-title></h3>
            <h4 instructions-text></h4>
        `;
    }

    styles() {
        return [ ...super.styles(), 'x-ledger-ui' ];
    }

    onCreate() {
        this.$instructionsTitle = this.$('[instructions-title]');
        this.$instructionsText = this.$('[instructions-text]');
        this._cancelRequest = null;
    }

    cancelRequest() {
        if (this._cancelRequest) this._cancelRequest();
    }

    get busy() {
        return !!this._cancelRequest;
    }

    async getPublicKey() {
        return this._callLedger(async api => {
            const result = await api.getPublicKey(XLedgerUi.BIP32_PATH, /*validate*/ true, /*display*/ false);
            return result.publicKey;
        });
    }

    async getAddress() {
        return this._callLedger(async api => {
            const result = await api.getAddress(XLedgerUi.BIP32_PATH, /*validate*/ true, /*display*/ false);
            return result.address;
        });
    }

    async confirmAddress(userFriendlyAddress) {
        const confirmedAddress = await this._callLedger(async api => {
            this._showInstructions('confirm-address', 'Confirm Address', [
                'Confirm that the address on your Ledger matches',
                userFriendlyAddress
            ]);
            const result = await api.getAddress(XLedgerUi.BIP32_PATH, /*validate*/ true, /*display*/ true);
            return result.address;
        });
        if (userFriendlyAddress !== confirmedAddress) throw Error('Address mismatch');
        return confirmedAddress;
    }

    async getConfirmedAddress() {
        const address = await this.getAddress();
        return await this.confirmAddress(address);
    }

    async signTransaction(transaction) {
        if (!transaction) throw Error('Invalid transaction');
        if (typeof transaction.value !== 'number') throw Error('Invalid transaction value');
        if (typeof transaction.fee !== 'number') throw Error('Invalid transaction fee');
        if (typeof transaction.validityStartHeight !== 'number'
            || Math.round(transaction.validityStartHeight) !== transaction.validityStartHeight)
            throw Error('Invalid validity start height');
        const senderPubKeyBytes = await this.getPublicKey(); // also loads Nimiq as a side effect
        const senderPubKey = Nimiq.PublicKey.unserialize(new Nimiq.SerialBuffer(senderPubKeyBytes));
        const senderAddress = senderPubKey.toAddress().toUserFriendlyAddress();
        if (transaction.sender.replace(/ /g, '') !== senderAddress.replace(/ /g, ''))
            throw Error('Sender Address doesn\'t match this ledger account');
        const genesisConfig = Nimiq.GenesisConfig.CONFIGS[transaction.network];
        if (!genesisConfig) throw Error('Invalid network');
        const networkId = genesisConfig.NETWORK_ID;
        const recipient = Nimiq.Address.fromUserFriendlyAddress(transaction.recipient);
        const value = Nimiq.Policy.coinsToSatoshis(transaction.value);
        const fee = Nimiq.Policy.coinsToSatoshis(transaction.fee);
        // for now only basic transactions allowed
        const nimiqTx = new Nimiq.BasicTransaction(senderPubKey, recipient, value, fee, transaction.validityStartHeight,
            undefined, networkId);

        return this._callLedger(async api => {
            this._showInstructions('confirm-transaction', 'Confirm transaction', [
                'Confirm on your Ledger if you want to send the following transaction:',
                `From: ${transaction.sender}`,
                `To: ${transaction.recipient}`,
                `Value: ${transaction.value}`,
                `Fee: ${transaction.fee}`
            ]);
            const signature = (await api.signTransaction(XLedgerUi.BIP32_PATH, nimiqTx.serializeContent())).signature;
            transaction.signature = signature;
            transaction.senderPubKey = senderPubKeyBytes;
            transaction.hash = nimiqTx.hash().toBase64();
            return transaction;
        });
    }

    _showInstructions(type, title=null, text=null) {
        this.$el.setAttribute('instructions', type || 'none');
        this.$instructionsTitle.textContent = title? title : '';
        if (Array.isArray(text)) {
            this.$instructionsText.textContent = ''; // clear
            text.forEach(line => {
                const el = document.createElement('div');
                el.textContent = line;
                this.$instructionsText.appendChild(el);
            });
        } else {
            this.$instructionsText.textContent = text? text : '';
        }
    }

    async _callLedger(call) {
        if (this.busy) throw new Error('Only one call at a time allowed');
        try {
            return await new Promise(async (resolve, reject) => {
                let cancelled = false;
                this._cancelRequest = () => {
                    cancelled = true;
                    reject(new Error('Request cancelled'));
                };
                while (!cancelled) {
                    try {
                        const api = await this._connect();
                        if (!cancelled) resolve(await call(api));
                        return;
                    } catch(e) {
                        console.log(e);
                        const message = (e.message || e || '').toLowerCase();
                        if (message.indexOf('denied') !== -1 // user rejected confirmAddress
                            || message.indexOf('rejected') !== -1 // user rejected signTransaction
                            || message.indexOf('not supported') !== -1) { // no browser support
                            reject(e);
                            return;
                        }
                        if (message.indexOf('timeout') === -1 && message.indexOf('locked') === -1
                            && message.indexOf('busy') === -1)
                            console.warn('Unknown Ledger Error', e);
                        // Wait a little when replacing a previous request (see notes at top).
                        const waitTime = message.indexOf('timeout')!==-1 ? XLedgerUi.WAIT_TIME_BETWEEN_REQUESTS
                            // If the API tells us that the ledger is busy (see notes at top) use a longer wait time to
                            // reduce the chance that we hit unfortunate 1.5s window after timeout of cancelled call
                            : message.indexOf('busy')!==-1 ? 4 * XLedgerUi.WAIT_TIME_BETWEEN_REQUESTS
                                // For other exceptions wait a little to avoid busy endless loop for some exceptions.
                                // Note that the wait time should be longer than the connectInstructionsTimeout to
                                // avoid reshowing the instructions after _cancelRequest().
                                : 500;
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            });
        } finally {
            this._cancelRequest = null;
            this._showInstructions('none');
        }
    }

    async _connect() {
        // Resolves when connected to unlocked ledger with open Nimiq app otherwise throws an exception after timeout.
        // if the Ledger is already connected and the library already loaded, the call typically takes < 250ms.
        // If it takes longer, we ask the user to connect his ledger.
        const connectInstructionsTimeout = setTimeout(() => this._showInstructions('connect', 'Connect'), 300);
        try {
            const api = await this._getApi();
            // To check whether the connection is established. This can also unfreeze the ledger app, see notes at top.
            // Using getPublicKey and not getAppConfiguration, as other apps also respond to getAppConfiguration.
            // Set validate to false as otherwise the call is much slower.
            await api.getPublicKey(XLedgerUi.BIP32_PATH, /*validate*/ false, /*display*/ false);
            clearTimeout(connectInstructionsTimeout); // in the case of exception the connectInstructionsTimeout doesn't
            // get cleared as we interpret exceptions as "still trying to connect"
            return api;
        } catch(e) {
            const message = (e.message || e || '').toLowerCase();
            if (message.indexOf('browser support') !== -1 || message.indexOf('u2f device_ineligible') !== -1
                || message.indexOf('u2f other_error') !== -1) {
                clearTimeout(connectInstructionsTimeout);
                throw new Error('Ledger not supported by browser or support not enabled.');
            }
            if (message.indexOf('busy') !== -1) {
                clearTimeout(connectInstructionsTimeout);
                this._showInstructions(null, 'Please cancel the previous request on your ledger');
            }
            throw e;
        }
    }

    async _getApi() {
        XLedgerUi._api = XLedgerUi._api
            || this._loadLibraries().then(() => LedgerjsNimiq.Transport.create())
                .then(transport => new LedgerjsNimiq.Api(transport));
        return XLedgerUi._api;
    }

    async _loadLibraries() {
        await Promise.all([
            LazyLoading.loadScript(XLedgerUi.LIB_PATH),
            LazyLoading.loadNimiq()
        ]);
    }
}
XLedgerUi.BIP32_PATH = "44'/242'/0'/0'";
// @asset(/libraries/ledger-api/ledgerjs-nimiq.min.js)
XLedgerUi.LIB_PATH = '/libraries/ledger-api/ledgerjs-nimiq.min.js';
XLedgerUi.WAIT_TIME_BETWEEN_REQUESTS = 1500;
