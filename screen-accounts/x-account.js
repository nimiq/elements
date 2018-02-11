import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address.js';

export default class XAccount extends XElement {
    html() {
        return `
            <x-identicon></x-identicon>
            <x-address></x-address>
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

    _onAccountSelected() {
        this.fire('x-account-selected', this._address);
    }
}