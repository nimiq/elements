import XScreen from '../x-screen/x-screen.js';
export default class ScreenError extends XScreen {
    html() {
        return `
            <img src="/elements/screen-error/screen-error.svg">
            <h1>Error</h1>
            <h2>Unfortunately we don't know the reason</h2>
            <a button href="" class="small hidden"></a>
        `
    }

    onCreate() {
        this.$h2 = this.$('h2');
        this.$button = this.$('[button]');
        const message = this.$el.getAttribute('message');
        if (message !== undefined) {
            this.show(message);
        }
    }

    show(message) {
        this.$h2.textContent = message;
    }

    setLink(href, text) {
        this.$button.href = href;
        this.$button.textContent = text;
        this.$button.classList.remove('hidden');
    }

    removeLink() {
        this.$button.classList.add('hidden');
    }
}