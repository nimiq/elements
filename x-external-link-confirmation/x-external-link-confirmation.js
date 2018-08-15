import XElement from "/libraries/x-element/x-element.js";
import MixinModal from "/elements/mixin-modal/mixin-modal.js";

export default class XExternalLinkConfirmation extends MixinModal(XElement) {
    html() {
        return `
            <p>You are opening an external site. Nimiq and its affiliates are not responsible for content on external web pages.</p>
            <a proceed button>Proceed</a>
            <a back secondary>Back</a>
        `;
    }

    styles() {
        return [ ...super.styles(), 'center' ];
    }

    onCreate() {
        super.onCreate();
        this.$proceed = this.$('[proceed]');
        this.$proceed.addEventListener('click', () => this.hide()); // when user opens link, close modal
        this.$('[back]').addEventListener('click', () => this.hide());
    }

    onShow(href, target='_blank') {
        super.onShow();
        this.$proceed.setAttribute('href', href);
        this.$proceed.setAttribute('target', target);
    }
}
