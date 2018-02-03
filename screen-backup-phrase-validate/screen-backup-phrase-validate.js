import XScreen from '../x-screen/x-screen.js';
import ScreenSuccess from '../screen-success/screen-success.js'
import MnemonicPhrase from '/library/mnemonic-phrase/mnemonic-phrase.es6.min.js';

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
        `
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
        this.init();
    }

    init() {
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

class ScreenMnemonicValidate extends XScreen {
    html() {
        return `
            <p>Please select the following word from your phrase:</p>
            <x-target-index></x-target-index>
            <x-wordlist>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
            </x-wordlist>`;
    }

    styles() { return ['x-grow', 'x-screen'] }

    onCreate() {
        this.$buttons = this.$$('button');
        this.$targetIndex = this.$('x-target-index');
        this.addEventListener('click', e => this._onClick(e));
    }

    /**
    * @param {string[]} wordlist
    * @param {number} targetIndex
    * @param {string} targetWord
    */
    set(wordlist, targetIndex, targetWord) {
        this.$$('.correct').forEach(button => button.classList.remove('correct'));
        this.$$('.wrong').forEach(button => button.classList.remove('wrong'));
        this.setWordlist(wordlist);
        this.setTargetIndex(targetIndex);
        this._targetWord = targetWord;
    }

    setWordlist(wordlist) {
        this._wordlist = wordlist;
        wordlist.forEach((word, index) => this.$buttons[index].textContent = word);
        this.$buttons.forEach(button => button.removeAttribute('disabled'));
    }

    setTargetIndex(index) {
        this.$targetIndex.textContent = index;
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        this._onButtonPressed(e.target);
    }

    _onButtonPressed($button) {
        this.$buttons.forEach(button => button.setAttribute('disabled', 'disabled'));

        if ($button.textContent !== this._targetWord) {
            this._showAsWrong($button);
            const correctButtonIndex = this._wordlist.indexOf(this._targetWord);
            this._showAsCorrect(this.$buttons[correctButtonIndex]);
            this.fire('screen-mnemonic-validate', false);
            return;
        }

        this._showAsCorrect($button);
        this.fire('screen-mnemonic-validate', true);
    }

    _showAsWrong($el) {
        $el.classList.add('wrong');
        this.animate('shake', $el);
    }

    _showAsCorrect($el) {
        $el.classList.add('correct');
    }
}

// Todo: [high priority] Add back button (where is the back button in default Screens?)