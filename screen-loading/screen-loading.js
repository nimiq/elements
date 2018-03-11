import XScreenFit from '../x-screen/x-screen-fit.js';

export default class ScreenLoading extends XScreenFit {
    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <h2 data-x-content></h2>
        `
    }
}

// Todo: When going back in history, skip loading screens. Semnatically better would be if they had no own route.