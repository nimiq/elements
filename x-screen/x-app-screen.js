import XScreenFit from './x-screen-fit.js';
export default class XAppScreen extends XScreenFit {
	get __tagName() { return 'body' }

	_animateEntry() {} // Overwritten from XScreenFit

    set _error(message) {
        this.appState.error = message;

        if (this.$screenError) {
            this.$screenError.show(this.appState.error);
            location = '#error';
        }
    }

}