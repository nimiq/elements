import XScreen from '../x-screen/x-screen.js';
import XSlides from '../x-slides/x-slides.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';
import XWalletBackup from '../x-wallet-backup/x-wallet-backup.js';
import XPasswordSetter from '../x-password-setter/x-password-setter.js';
import XScreenFit from '../x-screen/x-screen-fit';
import ScreenNoPasswordWarning from '../screen-no-password-warning/screen-no-password-warning.js';

export default class ScreenBackupFile extends XScreen {
    html() {
        return `
            <h1>Backup your Recovery File</h1>
            <x-slides>
                <screen-create-password></screen-create-password>
                <screen-encrypting></screen-encrypting>
                <screen-download-recovery></screen-download-recovery>
                <screen-complete></screen-complete>
            </x-slides>
            <screen-no-password-warning></screen-no-password-warning>
            `
    }

    children() {
        return [
            XSlides,
            ScreenCreatePassword,
            ScreenEncrypting,
            ScreenDownloadRecovery,
            ScreenComplete,
            ScreenNoPasswordWarning
        ]
    }

    onCreate() {
    }

    _onBeforeEntry() {
        this.$slides._onResize();
    }

    _onEntry() {
        this.goTo('password');
    }

    async reset() { }

    

    async backup(address, privateKey) {
        await this.ScreenDownloadRecovery.$walletBackup.backup(address, privateKey);
        this.$slides.next();
    }

}

class ScreenCreatePassword extends XScreenFit {
    html() {
        return `
          <h2 secondary>Create a password to encrypt your backup file. Make sure you memorize it well because there is no way to recover it.</h2>
          <x-password-setter></x-password-setter>
          <x-grow></x-grow>
          <button disabled="1">Next</button>
          <a secondary>No password</button>
      `
    }

    get route() { return 'password' }

    children() { return [XPasswordSetter] }

    onCreate() {
        this.$nextButton = this.$('button');
        this.$noPasswordLink = this.$('a');
        this.$nextButton.addEventListener('click', e => this._onPasswordInput());
        this.$noPasswordLink.addEventListener('click', e => this.goto('no-password'));
        this.addEventListener('x-password-setter', e => this._onPasswordInput());
        this.addEventListener('x-password-setter-valid', e => this._validityChanged(e.detail));
    }

    _onEntry() {
        this.$passwordSetter.value = '';
        this.$passwordSetter.focus();
    }

    _onPasswordInput() {
        const password = this.$passwordSetter.value;
        this.fire('x-encrypt-backup', password);
        this.goTo('encrypting');
    }

    _validityChanged(valid) {
        if (valid) {
            this.$nextButton.removeAttribute('disabled');
        } else {
            this.$nextButton.setAttribute('disabled', true);
        }
    }
}

class ScreenEncrypting extends XScreenFit {
    html() {
        return `
          <x-loading-animation></x-loading-animation>
          <h2>Encrypting Backup</h2>
      `
    }

    get route() { return 'encrypting' }
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
        this.goTo('complete')
    }
}

class ScreenComplete extends XScreenFit {
    html() {
        return `
          <x-success-mark></x-success-mark>
          <h2>Backup Complete</h2>
      `
    }

    get route() { return 'complete' }

    children() { return [XSuccessMark] }

    async _onEntry() {
        await this.$successMark.animate();
    }
}

// Todo: [Max] possibility to not use a password, show heavy warning that it's not for real usage
// Todo: [Max] [low] Show encrypt screen long enoguh to be noticed.
// Todo: Bug: goTo can lead to urls such as /#/password/password/password (added e.g. after reload)
// Todo: Change location from subscreen?