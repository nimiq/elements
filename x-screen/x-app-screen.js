import XScreenFit from './x-screen-fit.js';
import XAppState from '/elements/x-screen/x-app-state.js';

export default class XAppScreen extends XScreenFit {
	get __tagName() { return 'body' }

	_animateEntry() {} // Overwritten from XScreenFit

    get state() {
	    return XAppState.getAppState();
    }

    set _error(message) {
        this.state.error = message;

        if (this.$screenError) {
            this.$screenError.show(this.state.error);
            location = '#error';
        }
    }

}