import XSlidesScreen from '../x-slides-screen/x-slides-screen.js';
import ScreenSuccess from '../screen-success/screen-success.js';
import ScreenLoading from '../screen-loading/screen-loading.js';
import ScreenNoPasswordWarning from './screen-no-password-warning/screen-no-password-warning.js';
import ScreenCreatePassword from './screen-create-password.js';
import ScreenDownloadRecovery from './screen-download-recovery.js';

export default class ScreenBackupFile extends XSlidesScreen {
    html() {
        return `
            <h1>Backup your Account Access</h1>
            <x-slides>
                <screen-create-password></screen-create-password>
                <screen-loading>Encrypting Backup</screen-loading>
                <screen-download-recovery></screen-download-recovery>
                <screen-success>Backup Complete</screen-success>
            </x-slides>
            <screen-no-password-warning route="no-password"></screen-no-password-warning>
            `
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
    }

    children() {
        return [
            ScreenCreatePassword,
            ScreenLoading,
            ScreenDownloadRecovery,
            ScreenSuccess,
            ScreenNoPasswordWarning
        ]
    }

    /** Do not use those for slide indicator */
    get __childScreenFilter() { return ['no-password']; }

    async backup(address, privateKey) {
        await this.$screenDownloadRecovery.$walletBackup.backup(address, privateKey);
        this.goTo('download')
    }
}

// Todo: Test import before proceed