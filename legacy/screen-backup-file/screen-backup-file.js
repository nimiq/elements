import XScreen from '../../x-screen/x-screen.js';
import ScreenSuccess from '../screen-success/screen-success.js';
import ScreenLoading from '../screen-loading/screen-loading.js';
import ScreenNoPasswordWarning from './screen-no-password-warning/screen-no-password-warning.js';
import ScreenCreatePassword from './screen-create-password.js';
import ScreenDownloadRecovery from './screen-download-recovery.js';
import ScreenBackupFileImport from '/elements/legacy/screen-backup-file-import/screen-backup-file-import.js';
import NanoApi from '/libraries/nano-api/nano-api.js';
import XToast from '../../x-toast/x-toast.js';

export default class ScreenBackupFile extends XScreen {
    html() {
        return `
            <h1></h1>
            <x-slides>
                <screen-create-password></screen-create-password>
                <screen-loading>Encrypting Access File</screen-loading>
                <screen-download-recovery></screen-download-recovery>
                <screen-backup-file-import test-import></screen-backup-file-import>
                <screen-success>Access Test Complete</screen-success>
            </x-slides>
            <a secondary class="hidden" id="x-screen-backup-file-a">I'm lost and want to try again</a>
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

    onCreate() {
        this.$a = this.$('#x-screen-backup-file-a');
        this.$a.addEventListener('click', e => this._onRetryClicked());
        this.$h1 = this.$('h1');
    }

    listeners() {
        return {
            'x-wallet-download-complete': '_onWalletDownloadComplete',
            'x-encrypt-backup': '_onSetPassword',
            'x-decrypt-backup': '_onDecryptBackup',
            'x-passphrase-input-retry': '_onRetryClicked',
            'x-entry': '_onChildEntry'
        }
    }

    _onChildEntry(e) {
        switch (e.detail) {
            case 'backup-file-import':
            case 'success':
                this.updateHeadline('Test your Account Access');
                break;
            case 'create-password':
            case 'loading':
            case 'download-recovery':
                this.updateHeadline('Save your Account Access');
                break;
            default:
                break;
        }
    }

    updateHeadline(headline) {
        this.$h1.textContent = headline;
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
        this.goTo('backup-file-import');
        this.$a.classList.remove('hidden');
    }

    async _onDecryptBackup(backup) {
        const password = backup.password;
        const encryptedKey = backup.encryptedKey;
        try {
            await NanoApi.getApi().importEncrypted(encryptedKey, password, false); // false = do not persist

            const decryptedAddress = await NanoApi.getApi().getAddress();

            if (decryptedAddress === this._keyPair.address) {
                await this.goTo('../success');
                this.fire('x-backup-file-complete');
            } else {
                XToast.show('You uploaded the wrong file!');
                this.goTo('intro');
            }
        } catch (e) {
            console.error(e)
            this.$screenBackupFileImport.onPasswordIncorrect();
        }
    }

    _onRetryClicked() {
        this._hideRetryLinks();
        this.goTo('../');
    }

    _hideRetryLinks() {
        this.$a.classList.add('hidden');
        this.$screenBackupFileImport.$screenBackupFileImportPassword.$passwordError.classList.add('hidden');
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

// TODO fix lost and try again