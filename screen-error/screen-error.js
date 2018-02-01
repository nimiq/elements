import XScreen from '../x-screen/x-screen.js';
export default class ScreenError extends XScreen {
    html() {
        return `
            <img src="/elements/screen-error/screen-error.svg">
            <h1>Error</h1>
            <h2>Unfortunately we don't know the reason</h2>
        `
    }

    onCreate() {
        this.$h2 = this.$('h2');
    }

    show(message) {
        this.$h2.textContent = message;
    }
}