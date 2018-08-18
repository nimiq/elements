import XElement from "/libraries/x-element/x-element.js";
import MixinModal from "/elements/mixin-modal/mixin-modal.js";
import { getString } from '../strings.js';

export default class XExternalLinkConfirmation extends MixinModal(XElement) {
    html() {
        return `
            <p>${getString('external_site_warning')}</p>
            <a proceed button>${getString('proceed')}</a>
            <a back secondary>${getString('back')}</a>
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
