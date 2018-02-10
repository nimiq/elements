import XScreen from '../x-screen/x-screen.js';
import ScreenSuccess from '../screen-success/screen-success.js'
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.es6.min.js';
import ScreenMnemonicValidate from './screen-mnemonic-validate/screen-mnemonic-validate.js';

export default class ScreenBackupPhraseValidate extends XScreen {
    html() {
        return `
            <h1>Validate Recovery Phrase</h1>
            <x-slides>
                <screen-mnemonic-validate route="1"></screen-mnemonic-validate>
                <screen-mnemonic-validate route="2"></screen-mnemonic-validate>
                <screen-mnemonic-validate route="3"></screen-mnemonic-validate>
                <screen-success>
                    Phrase validated
                </screen-success>
            </x-slides>
            <a secondary href="../#backup-phrase">Back to phrase</a>
        `
    }

    types() {
        /** @type {ScreenSuccess} */
        this.$screenSuccess = null
        /** @type {ScreenMnemonicValidate[]} */
        this.$screenMnemonicValidates = null;
    }

    onHide() {
        this.reset();
    }

    children() {
        return [ScreenSuccess, [ScreenMnemonicValidate]];
    }

    _getDefaultScreen() { return this._childScreens['1']; }

    onCreate() {
        this.$screenMnemonicValidates.forEach(slide => {
            slide.addEventListener('screen-mnemonic-validate', e => this._onSlideEvent(e.detail));
        });
    }

    set privateKey(privateKey) {
        this.mnemonic = MnemonicPhrase.keyToMnemonic(privateKey);
    }

    set mnemonic(mnemonic) {
        if (!mnemonic) return;
        this._mnemonic = mnemonic.split(/\s+/g);
    }

    _onEntry() {
        this._activeSlideIndex = 0;
        this._generateIndices();
        this._setSlideContent(this._activeSlideIndex);
        this._showActiveSlide();
    }

    reset() {
        if (!this._mnemonic) return;
        this.mnemonic = this._mnemonic.join(' ');
    }

    resetSlide() {
        this.requiredWords[this._activeSlideIndex] = this._generateIndex(this._activeSlideIndex);
        this._setSlideContent(this._activeSlideIndex);
    }

    _next() {
        this._activeSlideIndex += 1;
        if (this._activeSlideIndex < 3) this._setSlideContent(this._activeSlideIndex);
        this._showActiveSlide();
    }

    _onSlideEvent(valid) {
        if (!valid) setTimeout(() => this.resetSlide(), 820);
        else {
            if (this._activeSlideIndex === 2) this._success();
            setTimeout(() => this._next(), 500);
        }
    }

    _success() {
        setTimeout(e => this.fire('x-phrase-validated'), 2500);
    }

    _generateIndices() {
        this.requiredWords = [0, 1, 2].map(this._generateIndex);
    }

    _generateIndex(index) {
        return Math.floor(Math.random() * 8) + index * 8;
    }

    _setSlideContent(slideIndex) {
        this.$screenMnemonicValidates[slideIndex].set(
            this._generateWords(this.requiredWords[slideIndex]), // wordlist
            this.requiredWords[slideIndex] + 1, // targetIndex
            this._mnemonic[this.requiredWords[slideIndex]] // targetWord
        );
    }

    _generateWords(wordIndex) {
        const words = {};

        words[this._mnemonic[wordIndex]] = wordIndex;

        // Select 7 additional unique words from the mnemonic phrase
        while (Object.keys(words).length < 8) {
            const index = Math.floor(Math.random() * 24);
            words[this._mnemonic[index]] = index;
        }

        return Object.keys(words).sort();
    }

    _showActiveSlide() {
        const activeSlide = this._activeSlideIndex < 3
            ? this.$screenMnemonicValidates[this._activeSlideIndex]
            : this.$screenSuccess;
        this.goTo(activeSlide.route);
    }
}
