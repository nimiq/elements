import XScreenFit from '../../x-screen/x-screen-fit.js';
import XSuccessMark from '../../x-success-mark/x-success-mark.js';
export default class ScreenSuccess extends XScreenFit {
    html() {
        return `
            <x-success-mark></x-success-mark>
            <h2 data-x-content></h2>
        `
    }

    children() { return [XSuccessMark] }

    _onEntry() {
        return this.$successMark.animate();
    }

    onCreate() {
        this.$h2 = this.$('h2');
    }

    show(message) {
        this.$h2.textContent = message;
    }
}