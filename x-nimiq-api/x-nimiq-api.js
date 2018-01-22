import XElement from "/library/x-element/x-element.js";
import NanoApi from "/library/nano-api/nano-api.js";

export default class XNimiqApi extends XElement {
    onCreate() {
        const connect = this.$el.hasAttribute('connect');
        this._api = new NimiqApi(connect, this);
    }
}

class NimiqApi extends NanoApi {
    constructor(connect, element) {
        super(connect);
        this._element = element;
    }
    onInitialized() {
        this._element.fire('x-api-ready', this);
    }

    onConsensusEstablished() {
        this._element.fire('x-consensus-establised', this.address);
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
}