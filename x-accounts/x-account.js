import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address.js';

export default class XAccount extends XElement {
    html() {
        return `
            <x-identicon></x-identicon>
            <div class="x-account-info">
                <span class="x-account-title"></span>
                <x-address></x-address>
                <span class="x-account-balance"></span>
            </div>
        `
    }
    children() { return [XIdenticon, XAddress] }

    onCreate() {
        this.$title = this.$('.x-account-title')
        this.$balance = this.$('.x-account-balance');
        this.$el.addEventListener('click', e => this._onAccountSelected())
    }

    // 'name' is a reserved property of XElement
    set title(title) {
        this.$title.textContent = title;
    }

    set address(address) {
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
    }

    set balance(balance) {
        this.$balance.textContent = this._formatBalance(balance);
    }

    _onAccountSelected() {
        this.fire('x-accounts-selected', this._address);
    }

    _formatBalance(balance) {
        return balance.toString() + ' NIM';
    }
}
