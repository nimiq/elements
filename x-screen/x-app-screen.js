import XScreenFit from './x-screen-fit.js';
import XLocationState from '/elements/x-screen/x-location-state.js';

export default class XAppScreen extends XScreenFit {

    /** @returns {XAppScreen} */
    static get instance() {
        return this._instance;
    }

    /** @param {XAppScreen} instance */
    static set instance(instance) {
        this._instance = instance;
    }

    static launch() { window.addEventListener('load', () => new this()); }

    /** @param {function} callback */
    static _registerGlobalStateListener(callback) {
        this.stateHistory = [];
        this._stateListener = window.addEventListener('popstate', e => this._onHistoryChange(callback));
        setTimeout(e => this._onHistoryChange(callback), 0); // Trigger FF layout
    }

    /** @param {function} callback */
    static _onHistoryChange(callback) {
        const nextState = XLocationState.fromLocation();

        if (nextState.isEqual(this.currState)) return;

        const isNavigateBack = (nextState.isEqual(this.stateHistory[this.stateHistory.length - 1]));

        // Handle state history array
        if (isNavigateBack) this.stateHistory.pop();
        else this.stateHistory.push(this.currState);

        const prevState = this.currState;
        this.currState = nextState;

        callback(nextState, prevState, isNavigateBack);
    }

    constructor() {
        super();
        this.state = {
            /** @type {string?} */
            error: null
        }
        XAppScreen.instance = this;
        XAppScreen._registerGlobalStateListener(this._onStateChange.bind(this));
    }

	get __tagName() { return 'body' }

	_animateEntry() {} // Overwritten from XScreenFit

    showError(message, linkTarget = null, linkText = null) {
        if (this.state.error) return;
        this.state.error = message;

        if (this.$screenError) {
            this.$screenError.show(this.state.error);

            if (linkTarget && linkText) this.$screenError.setLink(linkTarget, linkText);
            else this.$screenError.removeLink();

            location = '#error';
        }
    }

    /**
     *
     * @param {XLocationState} nextState
     * @param {XLocationState} prevState
     * @param {boolean} isNavigateBack
     * @returns {Promise<void>}
     * @private
     */
    async _onStateChange(nextState, prevState, isNavigateBack) {
        if (this.state.error && nextState.leafId !== 'error') return;
        nextState = this._sanitizeState(nextState);
        const intersection = nextState.intersection(prevState); // calc intersection common parent path
        const nextStateDiff = nextState.difference(prevState);
        const prevStateDiff = prevState && prevState.difference(nextState);
        let parent = this;
        intersection.forEach(childId => parent = parent._getChildScreen(childId)); // decent common path
        let exitParent = prevStateDiff && parent._getChildScreen(prevStateDiff[0]);
        if (exitParent) exitParent._exitScreens(prevStateDiff, nextState, prevState, isNavigateBack);
        parent._entryScreens(nextStateDiff, nextState, prevState, isNavigateBack);
        if (parent.onStateChange) parent.onStateChange(nextState);
    }

    _sanitizeState(nextState) {
        let parent = this;
        while (nextState && !nextState.isRoot) {
            const id = nextState.id;
            parent = parent._getChildScreen(id);
            nextState = nextState.child;
        }
        let child = parent;
        while (child && child._getDefaultScreen()) {
            child = child._getDefaultScreen();
        }
        const cleanState = XLocationState.fromLocation(child._location);
        history.replaceState(history.state, history.state, child._location);
        //XScreen.currState = cleanState;
        return cleanState;
    }
}