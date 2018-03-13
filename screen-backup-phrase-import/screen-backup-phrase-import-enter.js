import XScreenFit from '../x-screen/x-screen-fit.js';
import XMnemonicInput from '../x-mnemonic-input/x-mnemonic-input.js';

export default class ScreenBackupPhraseImportEnter extends XScreenFit {
    html() {
        return `
            <h2 secondary>Enter the 24 words of your Recovery Word List to recover your account</h2>
            <x-mnemonic-input></x-mnemonic-input>
            <small>You can press <kbd>SPACE</kbd>, <kbd>ENTER</kbd> or <kbd>TAB</kbd> at the end of each word.</small>
            <x-grow></x-grow>
        `
    }

    types() {
        /** @type {XMnemonicInput} */
        this.$mnemonicInput = null;
    }

    children() { return [XMnemonicInput] }

    get route() { return 'enter' }

    _onEntry() {
        this.$mnemonicInput.focus();
        // this.$mnemonicInput.animateEntry(); // currently not functional
    }
}