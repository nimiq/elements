import XScreen from '../x-screen/x-screen.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';
import XWalletBackup from '../x-wallet-backup/x-wallet-backup.js';
import XPasswordSetter from '../x-password-setter/x-password-setter.js';
import XScreenFit from '../x-screen/x-screen-fit.js';
import ScreenSuccess from '../screen-success/screen-success.js';
import ScreenLoading from '../screen-loading/screen-loading.js';
import ScreenNoPasswordWarning from '../screen-no-password-warning/screen-no-password-warning.js';

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

    async reset() { }

    async backup(address, privateKey) {
        await this.$screenDownloadRecovery.$walletBackup.backup(address, privateKey);
        this.goTo('download')
    }
}

class ScreenCreatePassword extends XScreenFit {
    html() {
        return `
          <h2 secondary>Create a password to encrypt your backup file. Make sure you memorize it well because there is no way to recover it.</h2>
          <x-password-setter></x-password-setter>
          <x-grow></x-grow>
          <button disabled="1">Next</button>
          <a secondary>Continue without password</button>
      `
    }

    get route() { return 'password' }

    children() { return [XPasswordSetter] }

    onCreate() {
        this.$nextButton = this.$('button');
        this.$noPasswordLink = this.$('a');
        this.$nextButton.addEventListener('click', e => this._onPasswordInput());
        this.$noPasswordLink.addEventListener('click', e => this.goTo('no-password'));
        this.addEventListener('x-password-input', e => this._onPasswordInput());
        this.addEventListener('x-password-setter-valid', e => this._validityChanged(e.detail));
    }

    _onBeforeEntry() {
        this.$passwordSetter.value = '';
    }

    _onEntry() {
        this.$passwordSetter.focus();
    }

    _onPasswordInput() {
        const password = this.$passwordSetter.value;
        this.fire('x-encrypt-backup', password);
        this.goTo('loading');
    }

    _validityChanged(valid) {
        if (valid) {
            this.$nextButton.removeAttribute('disabled');
        } else {
            this.$nextButton.setAttribute('disabled', true);
        }
    }
}


class ScreenDownloadRecovery extends XScreenFit {
    html() {
        return `
          <h2 secondary>Download your Recovery File to later recover your account</h2>
          <x-wallet-backup></x-wallet-backup>
          <x-grow></x-grow>
      `
    }

    get route() { return 'download' }

    children() { return [XWalletBackup] }

    onCreate() {
        this.addEventListener('x-wallet-backup-complete', e => this._onWalletBackupComplete());
    }

    async _onWalletBackupComplete() {
        await this.goTo('success');
        this.fire('x-backup-file-complete');
    }
}

// Todo: Bug: x-slides dots missing
// Todo: Bug: Mobile layout problems with open keyboard (next overlapping)