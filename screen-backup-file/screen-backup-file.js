import XScreen from '../x-screen/x-screen.js';
import ScreenSuccess from '../screen-success/screen-success.js';
import ScreenLoading from '../screen-loading/screen-loading.js';
import ScreenNoPasswordWarning from '../screen-no-password-warning/screen-no-password-warning.js';
import ScreenCreatePassword from './screen-create-password.js';
import ScreenDownloadRecovery from './screen-download-recovery.js';

export default class ScreenBackupFile extends XScreen {
    html() {
        return `
            <h1>Backup your Recovery File</h1>
            <x-slides>
                <screen-create-password></screen-create-password>
                <screen-loading>Encrypting Backup</screen-loading>
                <screen-download-recovery></screen-download-recovery>
                <screen-success>Backup Complete</screen-success>
            </x-slides>
            <x-indicator></x-indicator>
            <screen-no-password-warning></screen-no-password-warning>
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

    _onEntry() {
        this._prepareIndicators();
        this.goTo('password');
    }

    _prepareIndicators() {
        this.$indicator = this.$('x-indicator');
        this.$slides = this.$('x-slides');
        for (let i = 0; i < this.$slides.children.length; i++) {
            this.$indicator.appendChild(document.createElement('x-dot'));
        }
        this.$indicator = this.$indicator.childNodes;
    }

    async backup(address, privateKey) {
        await this.$screenDownloadRecovery.$walletBackup.backup(address, privateKey);
        this.goTo('download')
    }
}

// Todo: Bug: x-slides dots missing
