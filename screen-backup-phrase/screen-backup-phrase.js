import XScreen from '../x-screen/x-screen.js';
import XScreenFit from '../x-screen/x-screen-fit.js';
import ScreenPrivacy from '../screen-privacy/screen-privacy.js';
import XMnemonicPhrase from '../x-mnemonic-phrase/x-mnemonic-phrase.js';

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
    children() { return [ScreenPrivacy, ScreenPhrase] }
    
    onCreate(){
        this.addEventListener('x-surrounding-checked', e => this.goTo('phrase'));
    }

    _getDefaultScreen() { return this._childScreens['privacy']; }

    set privateKey(privateKey) {
        this.$screenPhrase.$mnemonicPhrase.privateKey = privateKey;
    }
}



class ScreenPhrase extends XScreenFit {
    html() {
        return `
            <h2 secondary>Write down the following 24 words to recover your account later</h2>
            <x-mnemonic-phrase></x-mnemonic-phrase>
            <x-grow></x-grow>
            <a href="#backup-phrase-validate" button fade-in>Validate</a>
            `;
    }

    children() { return [XMnemonicPhrase] }

    /*_animateButton() {
        this.$('[button]').classList.add('fade-in');
    }*/
}

// Todo: [low priority] add warning "screenshots are not safe" ?
