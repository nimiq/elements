import XElement from '/library/x-element/x-element.js';

export default class XAccount extends XElement {
    html() {
        return `
            <x-identicon></x-identicon>
            <x-address></x-address>
            <x-balance></x-balance>
        `
    }
    children() { return [XIdenticon, XAddress] }

    onCreate() {
        this.$el.addEventListener('click', e => this._onAccountSelected())
    }

    set address(address) {
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
    }

    set balance(balance) {
        this.$('x-balance').innerHTML = balance;
    }

    _onAccountSelected() {
        this.fire('x-account-selected', this._address);
    }
}