import XScreenFit from '../x-screen/x-screen-fit.js';
import XMnemonicInput from '../x-mnemonic-input/x-mnemonic-input.js';

export default class ScreenBackupPhraseImportEnter extends XScreenFit {
    html() {
        return `
            <h2 secondary>Enter the 24 words of your backup phrase to recover your account</h2>
            <x-mnemonic-input></x-mnemonic-input>
            <x-grow></x-grow>   
        `
    }

    types() {
        /** @type {XMnemonicInput} */
        this.$mnemonicInput = null;
    }

    children() { return [XMnemonicInput] }

    get route() { return 'enter' }

    _onEntry() { this.$mnemonicInput.animateEntry(); }
}