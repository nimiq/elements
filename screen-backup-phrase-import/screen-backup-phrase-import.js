import XScreen from '../x-screen/x-screen.js';
import XScreenFit from '../x-screen/x-screen-fit.js';
import ScreenPrivacy from '../screen-privacy/screen-privacy.js';
import XMnemonicInput from '../x-mnemonic-input/x-mnemonic-input.js';

export default class ScreenBackupPhraseImport extends XScreen {
    html() {
        return `
            <h1>Enter Recovery Phrase</h1>
            <x-slides>
                <screen-privacy></screen-privacy>
                <screen-backup-phrase-import-enter></screen-backup-phrase-import-enter>
            </x-slides>
        `
    }

    children() { return [ScreenPrivacy, ScreenBackupPhraseImportEnter] }

    onCreate() {
        this.addEventListener('x-surrounding-checked', e => this._onSurrondingChecked())
    }

    _onSurrondingChecked() {
        this.goTo('enter');
    }
}

class ScreenBackupPhraseImportEnter extends XScreenFit {
    html() {
        return `
            <h2 secondary>Enter the 24 words of your backup phrase to recover your account</h2>
            <x-mnemonic-input></x-mnemonic-input>
            <x-grow></x-grow>   
        `
    }
    children() { return [XMnemonicInput] }

    get route() { return 'enter' }

    _onEntry() {
        this.$mnemonicInput.animateEntry();
    }
}