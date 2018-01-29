import XScreen from '../x-screen/x-screen.js';
import XMnemonicValidate from '../x-mnemonic-validate/x-mnemonic-validate.js';

export default class ScreenBackupPhraseValidate extends XScreen {
    html() {
        return `
            <h1>Validate Recovery Phrase</h1>
            <x-mnemonic-validate></x-mnemonic-validate>
        `
    }
    children() { return [XMnemonicValidate] }

    set privateKey(privateKey) {
        this.$mnemonicValidate.privateKey = privateKey
    }

    onHide() {
        this.$mnemonicValidate.reset();
    }

    _onBeforeEntry() {
        this.$mnemonicValidate.$slides._resize();
    }
}

// Todo: [high priority] Add back button (where is the back button in default Screens?)