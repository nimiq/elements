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

export default class XLedgerUi extends XElement {
    // TODO render the pin dots as round divs
    // TODO add instructions images for get address and sign
    html() {
        return `
            <div ledger-device-container>
                <div ledger-cable></div>
                <div ledger-device></div>
                <div ledger-screen-pin class="ledger-screen">
                    <div ledger-pin-dots-container>
                        <div ledger-pin-dots></div>
                    </div>
                </div>
                <div ledger-screen-home class="ledger-screen"></div>
                <div ledger-screen-app class="ledger-screen"></div>
            </div>
            <h3 instructions-text></h3>
        `;
    }

    styles() {
        return [ ...super.styles(), 'x-ledger-ui' ];
    }

    onCreate() {
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
            const result = await api.getPublicKey(XLedgerUi.BIP32_PATH, true, false);
            return result.publicKey; // is actually a user friendly address
        });
        return this._callLedger(request);
    }


    // TODO if request times out and user confirms address after timeout (TransportError with message timeout), ledger crashes (but can be 'brought back' by new request, e.g. call getAppConfiguration)
    async confirmAddress(userFriendlyAddress) {
        const request = this._createRequest(async api => {
            const result = await api.getPublicKey(XLedgerUi.BIP32_PATH, true, true);
            return result.publicKey; // is actually a user friendly address
        }, 'confirm-address', `Confirm whether the address on your ledger matches ${userFriendlyAddress}`);
        return this._callLedger(request);
    }


    async getConfirmedAddress() {
        const address = await this.getAddress();
        return this.confirmAddress(address);
    }


    async signTransaction(transaction) {
        if (!transaction) throw Error('Invalid transaction');
        if (typeof transaction.value !== 'number') throw Error('Invalid transaction value');
        if (typeof transaction.fee !== 'number') throw Error('Invalid transaction fee');
        if (typeof transaction.validityStartHeight !== 'number'
            || Math.round(transaction.validityStartHeight) !== transaction.validityStartHeight)
            throw Error('Invalid validity start height');
        const address = await this.getAddress(); // also loads Nimiq as a side effect
        if (transaction.sender.replace(/ /g, '') !== address.replace(/ /g, ''))
            throw Error('Sender Address doesn\'t match this ledger account');
        const genesisConfig = Nimiq.GenesisConfig[transaction.network];
        if (!genesisConfig) throw Error('Invalid network');
        const networkId = genesisConfig.NETWORK_ID;
        const sender = Nimiq.Address.fromUserFriendlyAddress(transaction.sender);
        const recipient = Nimiq.Address.fromUserFriendlyAddress(transaction.recipient);
        const value = Nimiq.Policy.coinsToSatoshis(transaction.value);
        const fee = Nimiq.Policy.coinsToSatoshis(transaction.fee);
        // for now only basic transactions allowed
        const nimiqTx = new Nimiq.Transaction(Nimiq.Transaction.Format.BASIC, sender, Nimiq.Account.Type.BASIC,
            recipient, Nimiq.Account.Type.BASIC, value, fee, transaction.validityStartHeight,
            Nimiq.Transaction.Flag.NONE, /* data */ new Uint8Array(0), /* signature */ null, networkId);

        const request = this._createRequest(async api => {
            const result = await api.signTransaction(XLedgerUi.BIP32_PATH, nimiqTx.serializeContent());
            return result.signature;
        }, 'confirm-transaction', 'Confirm on your ledger whether you want to send the transaction');
        return this._callLedger(request);
    }

    _showInstructions(type, text = null) {
        this.$el.setAttribute('instructions', type || 'none');
        if (text) {
            this.$instructionsText.textContent = text;
        } else {
            this.$instructionsText.textContent = '';
        }
    }

    _createRequest(call, instructions=null, instructionsText=null) {
        const request = {
            call,
            instructions,
            instructionsText,
            cancelled: false,
            cancel: () => {
                request.cancelled=true;
                request._reject('Request cancelled');
                request.delete();
            },
            delete: () => {
                this._requests.delete(request);
            },
            setReject: reject => request._reject = reject
        };
        return request;
    }

    // TODO on error retry until user approved, denied or cancelled
    async _callLedger(request) {
        if (request.cancelled) throw Error('Request cancelled');
        return new Promise(async (resolve, reject) => {
            try {
                request.setReject(reject);
                this._showInstructions('none'); // don't show any instructions until we know we should show connect
                // instructions or the provided instructions for this call.
                const api = await this._connect(request);
                this._showInstructions(request.instructions, request.instructionsText);
                const result = await request.call(api);
                this._showInstructions('none');
                resolve(result);
            } catch(e) {
                reject(e);
            } finally {
                request.delete();
            }
        });
    }

    async _connect(request) {
        // resolves when connected to unlocked ledger with open Nimiq app
        if (request.cancelled) throw Error('Request cancelled');
        // if the Ledger is already connected and the library already loaded, the call typically takes < 200ms.
        // If it takes longer, we ask the user to connect his ledger.
        const connectInstructionsTimeout = setTimeout(() => this._showInstructions('connect'), 250);
        try {
            const api = await this._getApi();
            await api.getAppConfiguration(); // to check whether the connection is established
            return api;
        } catch(e) {
            const message = (e.message || e || '').toLowerCase();
            if (message.indexOf('cancelled') !== -1) {
                throw e;
            } else if (message.indexOf('timeout') !== -1) {
                return await this._connect(request);
            } else {
                if (message.indexOf('locked') === -1) console.warn('Unknown ledger connect error', e);
                await new Promise(resolve => setTimeout(resolve, 300));
                return await this._connect(request);
            }
        } finally {
            this._showInstructions('none');
            clearTimeout(connectInstructionsTimeout);
        }
    }

    async _getApi() {
        XLedgerUi._api = XLedgerUi._api
            || this._loadLibraries().then(() => LedgerjsNimiq.Transport.create(XLedgerUi.CONNECT_TIMEOUT))
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
XLedgerUi.BIP32_PATH = '44\'/242\'/0\'';
XLedgerUi.CONNECT_TIMEOUT = 3600000;
// @asset(/libraries/ledger-api/ledgerjs-nimiq.min.js)
XLedgerUi.LIB_PATH = '/libraries/ledger-api/ledgerjs-nimiq.min.js';
