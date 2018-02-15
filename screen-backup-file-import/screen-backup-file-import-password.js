import XPasswordInput from '../x-password-input/x-password-input.js';
import XScreenFit from '../x-screen/x-screen-fit.js';

export default class ScreenBackupFileImportPassword extends XScreenFit {
    html() {
        return `
            <h2 secondary>Enter the password to unlock this backup</h2>
            <x-password-input></x-password-input>
            <p id="screen-backup-file-import-password-error" class="hidden">
                That password was incorrect.<br>Try again or <a href="#backup-file">set a new password</a>.
            </p>
            <x-grow></x-grow>
            <button disabled="yes">Unlock</button>
        `
    }

    get route() { return 'password' }

    children() { return [XPasswordInput] }

    onCreate() {
        this.addEventListener('x-password-input-valid', e => this._validityChanged(e.detail));
        this.$hint = this.$('#screen-backup-file-import-password-error');
        this.$button = this.$('button');
        this.$button.addEventListener('click', e => this._onPasswordInput(e));
    }

    _onEntry() {
        this.$passwordInput.focus();
    }

    _validityChanged(valid) {
        if (valid)
            this.$button.removeAttribute('disabled');
        else
            this.$button.setAttribute('disabled', true);
    }

    _onPasswordInput(e) {
        this.fire('x-password-input', this.$passwordInput.value);
        this.$passwordInput.value = '';
        this.$hint.classList.add('hidden');
    }

    onPasswordIncorrect() {
        this.$hint.classList.remove('hidden');
    }
}
