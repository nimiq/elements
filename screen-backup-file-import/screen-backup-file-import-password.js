import XPasswordInput from '../x-password-input/x-password-input.js';
import XScreenFit from '../x-screen/x-screen-fit.js';

export default class ScreenBackupFileImportPassword extends XScreenFit {
    html() {
        const isTestImport = this.$el.hasAttribute('test-import');
        return `
            <h2 secondary>Enter the password to unlock this Access File:</h2>
            <x-password-input></x-password-input>
            <p id="screen-backup-file-import-password-error" class="hidden">
                That password was incorrect.
                ${ isTestImport && `<br>Try again or <a href="javascript:void(0)">set a new password</a>` }
            </p>
            <button disabled="yes">Unlock</button>
        `
    }

    get route() { return 'password' }

    children() { return [XPasswordInput] }

    onCreate() {
        this.addEventListener('x-password-input-valid', e => this._validityChanged(e.detail));
        this.$passwordError = this.$('#screen-backup-file-import-password-error');
        this.$a = this.$('a');
        if (this.$a) this.$a.addEventListener('click', e => this._onRetryClicked());
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

    _onRetryClicked(e) {
        this.fire('x-password-input-retry');
        this.$passwordError.classList.add('hidden');
    }

    _onPasswordInput(e) {
        const value = this.$passwordInput.value;
        this.$passwordInput.value = '';
        this.fire('x-password-input', value);
        this.$passwordError.classList.add('hidden');
    }

    onPasswordIncorrect() {
        this.$passwordError.classList.remove('hidden');
    }
}
