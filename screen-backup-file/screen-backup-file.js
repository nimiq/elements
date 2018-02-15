import XSlidesScreen from '../x-slides-screen/x-slides-screen.js';
import ScreenSuccess from '../screen-success/screen-success.js';
import ScreenLoading from '../screen-loading/screen-loading.js';
import ScreenNoPasswordWarning from './screen-no-password-warning/screen-no-password-warning.js';
import ScreenCreatePassword from './screen-create-password.js';
import ScreenDownloadRecovery from './screen-download-recovery.js';
import ScreenBackupFileImport from '/elements/screen-backup-file-import/screen-backup-file-import.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class ScreenBackupFile extends XSlidesScreen {
    html() {
        return `
            <h1>Backup your Account Access</h1>
            <x-slides>
                <screen-create-password></screen-create-password>
                <screen-loading>Encrypting Backup</screen-loading>
                <screen-download-recovery></screen-download-recovery>
                <screen-backup-file-import></screen-backup-file-import>
                <screen-success>Backup Complete</screen-success>
            </x-slides>
            <a secondary class="hidden" href="#backup-file" id="x-screen-backup-file-a">I'm lost and want to try again</a>
            <screen-no-password-warning route="no-password"></screen-no-password-warning>
            `
    }

    children() {
        return [
            ScreenCreatePassword,
            ScreenLoading,
            ScreenDownloadRecovery,
            ScreenBackupFileImport,
            ScreenSuccess,
            ScreenNoPasswordWarning
        ]
    }

    /** Do not use those for slide indicator */
    get __childScreenFilter() { return ['no-password']; }

    listeners() {
        return {
            'x-wallet-download-complete': '_onWalletDownloadComplete',
            'x-encrypt-backup': '_onSetPassword',
            'x-decrypt-backup': '_onDecryptBackup',
        }
    }

    /** @param {Nimiq.KeyPair} */
    setKeyPair(keyPair) {
        this._keyPair = keyPair;
        this.$screenDownloadRecovery.$walletBackup.setKeyPair(keyPair);
    }

    async _onSetPassword(password) {
        await this.$screenDownloadRecovery.$walletBackup.createBackup(password);
        this.goTo('download')
    }

    async _onWalletDownloadComplete() {
        location.href = "#backup-file/backup-file-import";
        const $a = this.$('#x-screen-backup-file-a');
        $a.classList.remove('hidden');
        $a.addEventListener('click', () => $a.classList.add('hidden'));
    }

    async _onDecryptBackup(backup) {
        console.log(backup);
        const password = backup.password
        const encryptedKey = backup.encryptedKey;
        try {
            await NanoApi.getApi().importEncrypted(encryptedKey, password);
            await this.goTo('success');
            this.fire('x-backup-file-complete');
        } catch (e) {
            console.error(e);
            this.$screenBackupFileImport.onPasswordIncorrect();
        }
    }

    types() {
        /** @type {ScreenCreatePassword} */
        this.$screenCreatePassword = null;
        /** @type {ScreenLoading} */
        this.$screenLoading = null;
        /** @type {ScreenDownloadRecovery} */
        this.$screenDownloadRecovery = null;
        /** @type {ScreenSuccess} */
        this.$screenSuccess = null;
        /** @type {ScreenNoPasswordWarning} */
        this.$screenNoPasswordWarning = null;
        /** @type {ScreenBackupFileImport} */
        this.$screenBackupFileImport = null;
    }
}
