import XScreen from '../x-screen/x-screen.js';
import ScreenPrivacy from '../screen-privacy/screen-privacy.js';
import ScreenBackupPhraseImportEnter from './screen-backup-phrase-import-enter/screen-backup-phrase-import-enter';

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

    types() {
        /** @type {ScreenPrivacy} */
        this.$screenPrivacy = null;
        /** @type {ScreenBackupPhraseImportEnter} */
        this.$screenBackupPhraseImportEnter = null;
    }

    children() { return [ScreenPrivacy, ScreenBackupPhraseImportEnter] }

    onCreate() {
        this.addEventListener('x-surrounding-checked', e => this._onSurrondingChecked())
    }

    _onSurrondingChecked() {
        this.goTo('enter');
    }
}
