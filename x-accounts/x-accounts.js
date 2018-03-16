import XElement from '/libraries/x-element/x-element.js';
import XAccount from './x-account.js';

export default class XAccounts extends XElement {
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

    /**
     * @param {array} accounts: Array of account objects
     */
    set accounts(accounts) {
        this.$accountsList.textContent = '';
        accounts.forEach(async account => await this._createAccount(account));
    }

    /**
     * @param {object} account
     */
    async addAccount(account){
        await this._createAccount(account);
    }

    async _createAccount(account) {
        const $account = XAccount.createElement();

        $account.label = account.label;
        $account.address = account.address || account.number;
        $account.balance = account.balance;
        $account.secure = account.secure;

        this.$accountsList.appendChild($account.$el);
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }
}
