import XElement from '/libraries/x-element/x-element.js';

export default class XSlideIndicator extends XElement {
    /** @param {number} nrOfSlides */
    init(nrOfSlides) {
        for (let i = 0; i < nrOfSlides; i++) {
            this.$el.appendChild(document.createElement('x-dot'));
        }
        this.isInitialized = true;
    }

    /** @param {number} state */
    show(state) {
        this.$el.style.display = 'flex';

        const dots = Array.from(this.$$('x-dot'));

        const onDots = dots.filter((x,i) => i <= state);

        const offDots = dots.filter((x,i) => i > state);

        onDots.forEach(x => x.setAttribute('on', ''));
        offDots.forEach(x => x.removeAttribute('on'));
    }

    hide() {
        this.$el.style.display = 'none';
    }
}

// Todo: [Max] Fix positioning
