import XScreen from '../x-screen/x-screen.js';
import XScreenFit from '../x-screen/x-screen-fit.js';
import XWalletBackupImport from '../x-wallet-backup-import/x-wallet-backup-import.js';
import XPasswordInput from '../x-password-input/x-password-input.js';
import ScreenSuccess from '../screen-success/screen-success.js';
import ScreenLoading from '../screen-loading/screen-loading.js';

export default class ScreenBackupFileImport extends XScreen {
    html() {
        return `
        <h1>Import Backup File</h1>
        <x-slides>
            <screen-backup-file-import-intro></screen-backup-file-import-intro>
            <screen-backup-file-import-password></screen-backup-file-import-password>
            <screen-loading>Unlocking the Backup</screen-loading>
            <screen-success>Account Imported</screen-success>
        </x-slides>
        `;
    }

    children() { return [ScreenBackupFileImportIntro, ScreenBackupFileImportPassword, ScreenLoading, ScreenSuccess] }

    onCreate() {
        this.addEventListener('x-success', e => _onSuccess(e));
        this.addEventListener('x-backup-import', e => this._onWalletImport(e));
        this.addEventListener('x-password-input', e => this._onPasswordInput(e));
    }

    _onWalletImport(e) {
        e.stopPropagation();
        this._encryptedKey = e.detail;
        this.goTo('password');
    }

    _onPasswordInput(e){
        const password = e.detail;
        const result = { password: password, encryptedKey: this._encryptedKey }
        this.fire('x-decrypt-backup', result);
        this.goTo('loading');
    }

    async onPasswordCorrect(){
        return this.goTo('success');
    }

    async onPasswordIncorrect() {
        await this.back();
        this.$screenBackupFileImportPassword.$passwordInput._onInvalid();
    }
}

class ScreenBackupFileImportIntro extends XScreenFit {
    html() {
        return `
            <h2 secondary>Select a backup file to import an account</h2>
            <x-wallet-backup-import></x-wallet-backup-import>
        `
    }

    children() { return [XWalletBackupImport] }

    get route() { return 'intro' }
}

class ScreenBackupFileImportPassword extends XScreenFit {
    html() {
        return `
            <h2 secondary>Enter the password to unlock this backup</h2>
            <x-password-input></x-password-input>
            <x-grow></x-grow>
            <button disabled="yes">Unlock</button>
        `
    }

    get route() { return 'password' }

    children() { return [XPasswordInput] }

    onCreate() {
        this.addEventListener('x-password-input-valid', e => this._validityChanged(e.detail));
        this.$button = this.$('button');
        this.$button.addEventListener('click', e => this._onPasswordInput(e));
    }

    _validityChanged(valid) {
        if (valid)
            this.$button.removeAttribute('disabled');
        else
            this.$button.setAttribute('disabled', true);
    }

    _onEntry() {
        this.$passwordInput.focus();
    }

    _onPasswordInput(e) {
        this.fire('x-password-input', this.$passwordInput.value);
    }
}



// Todo: warn user upfront that importing a different account deletes the current account
// Todo: [low priority] support multiple accounts at once