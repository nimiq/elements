import XElement from "/library/x-element/x-element.js";
import NanoApi from "/library/nano-api/nano-api.js";

export default class XNimiqApi extends XElement {
    onCreate() {
        const connect = this.$el.getAttribute('connect') === 'true';
        this._api = new NimiqApi(connect, this);
    }
}

class NimiqApi extends NanoApi {
    constructor(connect, element) {
        super(connect);
        this._element = element;
    }
    onInitialized() {
        this.initialized = true;
        this._element.fire('x-api-ready', this);
    }

    onConsensusEstablished() {
        this._element.fire('x-consensus-established', this.address);
    }

    onAddressChanged(address) {
        this._element.fire('x-account', address);
    }

    onBalanceChanged(balance) {
        this._element.fire('x-balance', balance);
    }

    onTransactionReceived(sender, value, fee) {
        this._element.fire('x-transaction', { sender: sender, value: value, fee: fee });
    }

    onDifferentTabError() {
        this._element.fire('x-different-tab-error');
    }
}

// Todo: [low] Make api a singleton, so we can wait more fine-grained for api-ready, but load it right after starting the app