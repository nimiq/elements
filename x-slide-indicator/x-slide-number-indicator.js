import XElement from '/libraries/x-element/x-element.js';

export default class XSlideNumberIndicator extends XElement {
    /** @param {number} nrOfSlides */
    init(nrOfSlides) {
        this.$el.innerHTML = 'Step&nbsp;<span></span>&nbsp;of&nbsp;' + nrOfSlides;
        this.$span = this.$('span');
        
        this.isInitialized = true;
    }

    /** @param {number} state */
    show(state) {
        this.$el.style.display = 'flex';
        this.$span.textContent = state + 1;
    }

    hide() {
        this.$el.style.display = 'none';
    }
}
