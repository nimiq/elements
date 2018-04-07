import XElement from '/libraries/x-element/x-element.js';
import LazyLoading from '/libraries/nimiq-utils/lazy-loading/lazy-loading.js';

// TODO check for every API call the following flows:
// - ledger not connected yet
// - ledger connected
// - ledger connected but relocked
// - user approved action
// - user denied action
// - request timed out
// - user cancel
// - when in another app: fires unknown error

// TODO handle "device is busy" exception (appears when another request is running ?)

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
        this._requests = new Set();
    }

    cancelRequests() {
        for (const request of this._requests) {
            request.cancel();
        }
        this._showInstructions('none');
    }


    async getAddress() {
        const request = this._createRequest(async api => {
            const result = await api.getAddress(XLedgerUi.BIP32_PATH, true, false);
            return result.address;
        });
        return this._callLedger(request);
    }


    async confirmAddress(userFriendlyAddress) {
        const request = this._createRequest(async api => {
            const result = await api.getAddress(XLedgerUi.BIP32_PATH, true, true);
            return result.address;
        }, 'confirm-address', 'Confirm Address', [
            'Confirm that the address on your Ledger matches',
            userFriendlyAddress
        ]);
        return this._callLedger(request);
    }


    async getPublicKey() {
        const request = this._createRequest(async api => {
            const result = await api.getPublicKey(XLedgerUi.BIP32_PATH, true, false);
            return result.publicKey;
        });
        return this._callLedger(request);
    }


    async getConfirmedAddress() {
        const address = await this.getAddress();
        const confirmedAddress = await this.confirmAddress(address);
        if (address !== confirmedAddress) throw Error('Address missmatch');
        return confirmedAddress;
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

        const request = this._createRequest(async api => {
            const signature = (await api.signTransaction(XLedgerUi.BIP32_PATH, nimiqTx.serializeContent())).signature;
            transaction.signature = signature;
            transaction.senderPubKey = senderPubKeyBytes;
            transaction.hash = nimiqTx.hash().toBase64();
            return transaction;
        }, 'confirm-transaction', 'Confirm transaction', [
            'Confirm on your Ledger if you want to send the following transaction:',
            `From: ${transaction.sender}`,
            `To: ${transaction.recipient}`,
            `Value: ${transaction.value}`,
            `Fee: ${transaction.fee}`
        ]);
        return this._callLedger(request);
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

    _createRequest(call, instructions=null, instructionsTitle=null, instructionsText=null) {
        const request = {
            call,
            instructions,
            instructionsTitle,
            instructionsText,
            cancelled: false,
            cancel: () => {
                request.cancelled=true;
                request._reject('Request cancelled');
                this._requests.delete(request);
            },
            setReject: reject => request._reject = reject
        };
        return request;
    }


    async _callLedger(request) {
        if (request.cancelled) throw Error('Request cancelled');
        return new Promise(async (resolve, reject) => {
            try {
                request.setReject(reject);
                this._requests.add(request);
                // TODO should not set the instructions to none on retry after timeout
                this._showInstructions('none'); // don't show any instructions until we know we should show connect
                // instructions or the provided instructions for this call.
                const api = await this._connect(request);
                this._showInstructions(request.instructions, request.instructionsTitle, request.instructionsText);
                var start = Date.now();
                const result = await request.call(api);
                this._requests.delete(request);
                this._showInstructions('none');
                resolve(result);
            } catch(e) {
                console.log('Timeout after', (Date.now() - start) / 1000);
                reject(e);
            }
        }).catch(async e => {
            // catch outside of the promise to also be able to catch rejections by request.cancel
            // TODO refactor request cancellation
            console.log(e);
            const message = (e.message || e || '').toLowerCase();
            if (message.indexOf('denied') !== -1 // for confirmAddress
                || message.indexOf('rejected') !== -1 // for signTransaction
                || message.indexOf('cancelled') !== -1) { // for cancellation in the ui
                // user cancelled or denied the request
                this._requests.delete(request);
                this._showInstructions('none');
                throw e;
            } else {
                if (message.indexOf('timeout') === -1) {
                    console.warn('Unknown ledger call error', e);
                }
                // TODO experiment with lower wait times
                await new Promise(resolve => setTimeout(resolve, 3000)); // wait some time to make sure the call also
                // time outed on the ledger device before we resend the request to be able to replace the old one
                return this._callLedger(request);
            }
        });
    }

    async _connect(request) {
        // resolves when connected to unlocked ledger with open Nimiq app
        if (request.cancelled) throw Error('Request cancelled');
        // if the Ledger is already connected and the library already loaded, the call typically takes < 200ms.
        // If it takes longer, we ask the user to connect his ledger.
        const connectInstructionsTimeout = setTimeout(() => this._showInstructions('connect', 'Connect'), 250);
        try {
            const api = await this._getApi();
            // TODO check whether app configurations says that actually the nimiq app is opened
            await api.getAppConfiguration(); // to check whether the connection is established
            return api;
        } catch(e) {
            console.log(e);
            const message = (e.message || e || '').toLowerCase();
            if (message.indexOf('cancelled') !== -1) {
                throw e;
            } else if (message.indexOf('timeout') !== -1) {
                return await this._connect(request);
            } else {
                if (message.indexOf('locked') === -1) console.warn('Unknown ledger connect error', e);
                await new Promise(resolve => setTimeout(resolve, 500));
                return await this._connect(request);
            }
        } finally {
            this._showInstructions('none');
            clearTimeout(connectInstructionsTimeout);
        }
    }

    async _getApi() {
        XLedgerUi._api = XLedgerUi._api
            || this._loadLibraries().then(() => LedgerjsNimiq.Transport.create())
                .then(transport => new LedgerjsNimiq.Api(transport));
        return XLedgerUi._api;
    }

    async _loadLibraries() {
        // TODO also lazy load the illustrations
        await Promise.all([
            LazyLoading.loadScript(XLedgerUi.LIB_PATH),
            LazyLoading.loadNimiq()
        ]);
    }
}
XLedgerUi.BIP32_PATH = "44'/242'/0'/0'";
// @asset(/libraries/ledger-api/ledgerjs-nimiq.min.js)
XLedgerUi.LIB_PATH = '/libraries/ledger-api/ledgerjs-nimiq.min.js';
