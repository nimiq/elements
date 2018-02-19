import XScreenFit from '../x-screen/x-screen-fit.js';
import XAccount from './x-account.js';

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
        accounts.forEach(async account => await this._createAccount(account));
    }

    async addAccount(account){
        await this._createAccount(account);
    }

    async _createAccount(account) {
        const xAccount = XAccount.createElement();
        xAccount.address = account;
        this.$accountsList.appendChild(xAccount.$el);
    }

    _onCreateAccount() {
        this.fire('x-create-account');
    }
}
