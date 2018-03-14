import XScreenFit from '../../x-screen/x-screen-fit.js';
import XMnemonicPhrase from '../../x-mnemonic-phrase/x-mnemonic-phrase.js';

export  default class ScreenPhrase extends XScreenFit {
    html() {
        return `
            <h2 secondary>Write down and physically store safely the following 24 word list to recover this account in the future.</h2>
            <x-mnemonic-phrase></x-mnemonic-phrase>
            <x-grow></x-grow>
            <a href="#backup-phrase-validate" button>Validate</a>
            `;
    }

    children() { return [XMnemonicPhrase] }
}