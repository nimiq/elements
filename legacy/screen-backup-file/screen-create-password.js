import XPassphraseSetter from '../../../secure-elements/x-passphrase-setter/x-passphrase-setter.js';
import XScreenFit from '../../x-screen/x-screen-fit.js';

export default class ScreenCreatePassword extends XScreenFit {
    html() {
        return `
          <h2 secondary>Create a password to encrypt your Account Access File. Make sure you memorize the password well because there is <strong>no way</strong> to recover or change it.</h2>
          <x-passphrase-setter></x-passphrase-setter>
          <x-grow></x-grow>
          <button disabled="1">Next</button>
          <a secondary>Continue without password</button>
      `
    }

    types() {
        /** @type {XPassphraseSetter} */
        this.$passphraseSetter = null;
    }

    children() { return [XPassphraseSetter] }

    onCreate() {
        this.$nextButton = this.$('button');
        this.$noPasswordLink = this.$('a');
        this.$nextButton.addEventListener('click', e => this._onpassphraseInput());
        this.$noPasswordLink.addEventListener('click', e => this.goTo('no-password'));
        this.addEventListener('x-passphrase-input', e => this._onpassphraseInput());
        this.addEventListener('x-passphrase-setter-valid', e => this._validityChanged(e.detail));
    }

    _onBeforeEntry() {
        this.$passphraseSetter.value = '';
    }

    _onEntry() {
        this.$passphraseSetter.focus();
        this._parent._hideRetryLinks();
    }

    _onpassphraseInput() {
        const password = this.$passphraseSetter.value;
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

// Todo: Make visible hover eye for password?