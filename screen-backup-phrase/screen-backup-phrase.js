import XScreen from '../x-screen/x-screen.js';
import XScreenFit from '../x-screen/x-screen-fit.js';
import ScreenPrivacy from '../screen-privacy/screen-privacy.js';
import ScreenPhrase from './screen-phrase/screen-phrase.js';

export default class ScreenBackupPhrase extends XScreen {
    html() {
        return `
            <h1>Backup your Recovery Phrase</h1>
            <x-slides>
                <screen-privacy></screen-privacy>
                <screen-phrase></screen-phrase>
            </x-slides>
            `;
    }

    types() {
        /** @type {ScreenPrivacy} */
        this.$screenPrivacy = null;
        /** @type {ScreenPhrase} */
        this.$screenPhrase = null;
    }

    children() { return [ScreenPrivacy, ScreenPhrase] }
    
    onCreate(){
        this.addEventListener('x-surrounding-checked', e => this.goTo('phrase'));
    }

    _getDefaultScreen() { return this._childScreens['privacy']; }

    set privateKey(privateKey) {
        this.$screenPhrase.$mnemonicPhrase.privateKey = privateKey;
    }
}

// Todo: [low priority] add warning "screenshots are not safe" ?
