import XElement from '/library/x-element/x-element.js';

export default class XSlideIndicator extends XElement {
    /** @param {number} nrOfSlides */
    init(nrOfSlides) {
        for (let i = 0; i < nrOfSlides; i++) {
            this.$el.appendChild(document.createElement('x-dot'));
        }
    }

    /** @param {number} state */
    show(state) {
        this.$el.style.display = 'flex';
    }

    hide() {
        this.$el.style.display = 'none';
    }
}

// Todo: [Max] Fix positioning
// Todo: [Max] Fix state calculation (in x-screen.js)
// Todo: [Max] Use state => dots
