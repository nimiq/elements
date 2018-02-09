import XScreen from '../x-screen/x-screen.js';
import ScreenSuccess from '../screen-success/screen-success.js';
import ScreenLoading from '../screen-loading/screen-loading.js';
import ScreenBackupFileImportIntro from './screen-backup-file-import-intro/screen-backup-file-import-intro.js';
import ScreenBackupFileImportPassword from './screen-backup-file-import-password/screen-backup-file-import-password.js';

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

// Todo: warn user upfront that importing a different account deletes the current account
// Todo: [low priority] support multiple accounts at once