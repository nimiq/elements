import XPasswordSetter from '../x-password-setter/x-password-setter.js';
import XScreenFit from '../x-screen/x-screen-fit.js';

export default class ScreenCreatePassword extends XScreenFit {
    html() {
        return `
          <h2 secondary>Create a password to encrypt your account access information. Make sure you memorize it well because there is no way to recover it.</h2>
          <x-password-setter></x-password-setter>
          <x-grow></x-grow>
          <button disabled="1">Next</button>
          <a secondary>Continue without password</button>
      `
    }

    types() {
        /** @type {XPasswordSetter} */
        this.$passwordSetter = null;
    }

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

// Todo: Make visible hover eye for password?