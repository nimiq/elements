import XScreen from '../x-screen/x-screen.js';
import XPrivacyAgent from '../x-privacy-agent/x-privacy-agent.js';
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
    
    _getDefaultScreen() { return this._childScreens['privacy']; }

    set privateKey(privateKey) {
        this.$screenPhrase.$mnemonicPhrase.privateKey = privateKey;
    }
}

class ScreenPrivacy extends XScreen {
    html() {
        return `
            <h2 secondary>First make sure your enviroment is safe.</h2>
            <x-privacy-agent></x-privacy-agent>
            <x-grow></x-grow>
            `;
    }

    children() { return [XPrivacyAgent] }

    get route() { return 'privacy' }

    onCreate() {
        this.addEventListener('x-surrounding-checked', e => this.goTo('phrase'));
    }
}

class ScreenPhrase extends XScreen {
    html() {
        return `
            <h2 secondary>Write down the following 24 words to recover your account later</h2>
            <x-mnemonic-phrase></x-mnemonic-phrase>
            <x-grow></x-grow>
            <a href="#backup-phrase-validate" button fade-in>Validate</a>
            `;
    }

    children() { return [XMnemonicPhrase] }

    get route() { return 'phrase' }

    /*_animateButton() {
        this.$('[button]').classList.add('fade-in');
    }*/
}

// Todo: [low priority] add warning "screenshots are not safe" ?
