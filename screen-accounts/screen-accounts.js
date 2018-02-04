import XScreen from '../x-screen/x-screen.js';
export default class ScreenAccounts extends Screen {
    html() {
        return `
			<x-accounts-list></x-accounts-list>
			<button>Create Account</button>
		`
    }

    onCreate() {
        this.$button = this.$('button');
        this.$accountsList = this.$('x-accounts-list');
    }

    set accounts(accounts) {
        accounts.forEach(account => this._createAccount(account));
    }

    _createAccount(account) {
        const xAccount = XAccount.createElement();
        xAccount.address = account.address;
        this.$accountsList.appendChild(xAccount.$el);
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
}