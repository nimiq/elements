import XScreenFit from './x-screen-fit.js';
import XAppState from '/elements/x-screen/x-app-state.js';
import XSlideNumberIndicator from '../x-slide-indicator/x-slide-number-indicator.js';

export default class XAppIndicatorScreen extends XScreenFit {

    /** @returns {XAppIndicatorScreen} */
    static get instance() {
        return this._instance;
    }

    /** @param {XAppIndicatorScreen} instance */
    static set instance(instance) {
        this._instance = instance;
    }

    static launch() { window.addEventListener('load', () => new this()); }

    constructor() {
        super();
        this.state = {
            /** @type {string?} */
            error: null
        }
        XAppIndicatorScreen.instance = this;
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
     * @param {XState} nextState
     * @param {XState} prevState
     * @param {boolean} isNavigateBack
     * @returns {Promise<void>}
     * @private
     */
    async _onRootStateChange(nextState, prevState, isNavigateBack) {
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
        if (parent._onStateChange) parent._onStateChange(nextState);
    }

    /**
     * ##################################
     * # COPIED FROM X-SLIDES-SCREEN.JS #
     * ##################################
     */

    onCreate() {
        this.$slideIndicator = XSlideNumberIndicator.createElement();
        this.$el.insertBefore(this.$slideIndicator.$el, this.$el.firstChild);

        this._filteredChildScreenPaths = XAppIndicatorScreen._prepareChildScreens('', this._childScreens, this._childScreenFilter);
        // console.log(this._filteredChildScreenPaths);

        this.addEventListener('x-entry', e => this._update());

        this.$slideIndicator.init(this._filteredChildScreenPaths.length);
        this.$slideIndicator.hide();
    }

    /**
     * @param {XState} nextState
     */
    async _update() {
        const childPath = location.hash.slice(1);
        // console.log('childPath to find:', childPath);
        const slideIndex = this._getSlideIndex(childPath);
        if (slideIndex > -1) this.$slideIndicator.show(slideIndex);
    }

    /**
     * ChildScreens with those ids will not count for indicator
     * @returns {string[]}
     */
    get _childScreenFilter() {
        return ['success', 'error', 'loading'].concat(this.__childScreenFilter);
    }

    /**
     * Overwrite for additionally filtered childScreens
     * @returns {string[]}
     */
    get __childScreenFilter() {
        return [];
    }

    /**
     * @returns {(XScreen & {path: string})[]}
     */
    static _prepareChildScreens(path, childScreens, filter) {

        const filteredChildScreens = Array.from(childScreens.entries())
            .filter(x => !filter.includes(x[0]));

        return filteredChildScreens.map(item => {
            const name = item[0];
            const screen = item[1];

            // Is simple child screen
            if (!screen._childScreens) return path + name;

            // Is meta child screen
            return XAppIndicatorScreen._prepareChildScreens(path + name + '/', screen._childScreens, filter);
        }).reduce((a,b) => a.concat(b), []);
    }

    /**
     * @param {string} childId
     * @returns {number}
     */
    _getSlideIndex(childPath) {
        return this._filteredChildScreenPaths.findIndex(x => x === childPath);
    }
}