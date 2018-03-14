import XScreen from '../../x-screen/x-screen.js';
import ScreenPrivacy from '../screen-privacy/screen-privacy.js';
import ScreenBackupPhraseImportEnter from './screen-backup-phrase-import-enter.js';

export default class ScreenBackupPhraseImport extends XScreen {
    html() {
        return `
            <h1>Enter Recovery Words</h1>
            <x-slides>
                <screen-privacy></screen-privacy>
                <screen-backup-phrase-import-enter></screen-backup-phrase-import-enter>
            </x-slides>
        `
    }

    children() { return [ScreenPrivacy, ScreenBackupPhraseImportEnter] }

    listeners() {
        return {
            'x-mnemonic-input':'_onMenmonicInput'
        }
    }

    onCreate() {
        this.addEventListener('x-surrounding-checked', e => this._onSurrondingChecked())
    }

    _onSurrondingChecked() {
        this.goTo('enter');
    }

    _onMenmonicInput(privateKey) {
        this.fire('x-phrase-imported', privateKey);
    }
}
