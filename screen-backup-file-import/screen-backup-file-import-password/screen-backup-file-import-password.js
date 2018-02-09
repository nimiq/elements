import XPasswordInput from '/elements/x-password-input/x-password-input.js';
import XScreenFit from '/elements/x-screen/x-screen-fit.js';

export default class ScreenBackupFileImportPassword extends XScreenFit {
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
