import XScreenFit from "../../x-screen/x-screen-fit";
import XMnemonicPhrase from "../../x-mnemonic-phrase/x-mnemonic-phrase";

export  default class ScreenPhrase extends XScreenFit {
    html() {
        return `
            <h2 secondary>Write down the following 24 words to recover your account later</h2>
            <x-mnemonic-phrase></x-mnemonic-phrase>
            <x-grow></x-grow>
            <a href="#backup-phrase-validate" button>Validate</a>
            `;
    }

    types() {
        /** @type {XMnemonicPhrase} */
        this.$mnemonicPhrase = null;
    }

    children() { return [XMnemonicPhrase] }
}