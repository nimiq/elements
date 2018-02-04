import XScreenFit from '../x-screen/x-screen-fit.js';
import XElement from '/library/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address.js';
export default class ScreenAccounts extends XScreenFit {
    html() {
        return `
            <x-accounts-list></x-accounts-list>
            <button>Create Account</button>
        `
    }

    onCreate() {
        this.$accountsList = this.$('x-accounts-list');
        this.$('button').addEventListener('click', e => this._onCreateAccount());
    }

    set accounts(accounts) {
        accounts.forEach(account => this._createAccount(account));
    }

    _createAccount(account) {
        const xAccount = XAccount.createElement();
        xAccount.address = account;
        this.$accountsList.appendChild(xAccount.$el);
    }

    _onCreateAccount() {
        this.fire('x-create-account');
    }
}

class XAccount extends XElement {
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