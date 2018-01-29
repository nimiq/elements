import XScreenFit from '../x-screen/x-screen-fit.js';
export default class ScreenLoading extends XScreenFit {
    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <h2 content></h2>
        `
    }
}
