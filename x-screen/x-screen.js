import XElement from '/libraries/x-element/x-element.js';
import XLocationState from './x-location-state.js';

export default class XScreen extends XElement {

    types() {
        /** @type {Map<string,XScreen>} */
        this._childScreens = new Map();
    }

    constructor(parent) {
        super(parent);
        this._bindListeners();
        this.addEventListener('x-entry', this._onChildEntry.bind(this));
    }

    __bindStyles(styles) {
        super.__bindStyles(styles);
        if (!this.styles) this.addStyle('x-screen');
    }

    __createChild(child) {
        super.__createChild(child);
        this.path = (parent ? parent.path : '') + this.route;
        if (child instanceof Array) {
            const name = child[0].__toChildName() + 's';
            if (this[name][0] instanceof XScreen) this.__createChildScreens(child[0]);
        } else {
            const childScreen = this[child.__toChildName()];
            if (childScreen instanceof XScreen) this.__createChildScreen(childScreen);
        }
    }

    __createChildScreen(child) {
        if (!this._childScreens) this._childScreens = new Map();
        this._childScreens.set(child.route, child);
        child._parent = this;
    }

    __createChildScreens(child) {
        const name = child.__toChildName() + 's';

        this[name].forEach(c => this.__createChildScreen(c));
    }

    _getChildScreen(id) {
        if (!this._childScreens) return;
        return this._childScreens.get(id);
    }

    _getDefaultScreen() {
        if (!this._childScreens) return;
        return this._childScreens.get(0);
    }

    _onChildEntry(e) {
        if (e.target === this.$el) return;

        e.stopPropagation();

        if (this.route) {
            const childPath = e.detail;
            const myPath = this.route + '/' + childPath;
            this.fire('x-entry', myPath);
        }
    }

    _exitScreens(prevStateDiff, nextState, prevState, isNavigateBack) {
        if (prevStateDiff && prevStateDiff.length > 1) {
            const childScreen = this._getChildScreen(prevStateDiff[1]);
            prevStateDiff = prevStateDiff.slice(1);
            childScreen._exitScreens(prevStateDiff, nextState, prevState, isNavigateBack);
        }
        this.__onExit(nextState, prevState, isNavigateBack);
    }

    _entryScreens(nextStateDiff, nextState, prevState, isNavigateBack) {
        this.__onEntry(nextState, prevState, isNavigateBack);
        if (!nextStateDiff || !nextStateDiff.length) return;
        const childScreen = this._getChildScreen(nextStateDiff[0]);
        if (!childScreen) return;
        const nextChildStateDiff = nextStateDiff.slice(1);
        childScreen._entryScreens(nextChildStateDiff, nextState, prevState, isNavigateBack);
    }

    async __onEntry(nextState, prevState, isNavigateBack) {
        this._fixStuckAnimations();
        if (this.isVisible) return;
        if (this._onBeforeEntry) this._onBeforeEntry(nextState, prevState, isNavigateBack);
        this.fire('x-entry', this.route);
        await this._animateEntry(isNavigateBack);
        if (this._onEntry) await this._onEntry(nextState, prevState, isNavigateBack);
        this._resolveGoTo();
    }

    _animateEntry(isNavigateBack) {
        const afterStartCallback = () => { this._show(); };
        if (!isNavigateBack)
            return this.animate('x-entry-animation', null, afterStartCallback);
        else
            return this.animate('x-exit-animation-reverse', null, afterStartCallback);
    }

    async __onExit(nextState, prevState, isNavigateBack) {
        if (!this.isVisible) return;
        document.activeElement.blur();
        if (this._onBeforeExit) this._onBeforeExit(nextState, prevState, isNavigateBack);
        await this._animateExit(isNavigateBack);
        if (this._onExit) await this._onExit(nextState, prevState, isNavigateBack);
    }

    _animateExit(isNavigateBack) {
        const beforeEndCallback = () => { this._hide(); };
        if (!isNavigateBack)
            return this.animate('x-exit-animation', null, null, beforeEndCallback);
        else
            return this.animate('x-entry-animation-reverse', null, null, beforeEndCallback);
    }

    _fixStuckAnimations() {
        // workaround: fix stuck animations
        this.$el.classList.remove('x-entry-animation');
        this.$el.classList.remove('x-exit-animation');
        this.$el.classList.remove('x-entry-animation-reverse');
        this.$el.classList.remove('x-exit-animation-reverse');
    }

    _show() {
        this.$el.style.display = 'flex';
        this.$el.offsetWidth; // Bugfix for FF: trigger layout and repaint
        this._isVisible = true;
    }

    _hide() {
        this.$el.style.display = 'none';
        this._isVisible = false;
    }

    get isVisible() { return this._isVisible; }

    get route() {
        return this._route || this.$el.getAttribute('route') || this.__tagName.replace('screen-', '');
    }

    get _location() {
        if (!this._parent) return;
        if (!this._parent._location) return '#' + this.route;
        return this._parent._location + '/' + this.route;
    }

    // Todo: Either fix it, so relative path is interpreted correctly, or replace this.goTo by XLocationState.goTo
    goTo(route) {
        return new Promise(resolve => {
            XScreen._goToResolve = resolve;
            document.location = XLocationState.locationFromRoute(route);
        })
    }

    back() {
        return new Promise(resolve => {
            XScreen._goToResolve = resolve;
            history.back();
        });
    }

    _resolveGoTo() {
        if (!XScreen._goToResolve) return;
        XScreen._goToResolve();
        XScreen._goToResolve = null;
    }

    _bindListeners() {
        if (!this.listeners) return;
        const listeners = this.listeners();
        for (const key in listeners) {
            this.addEventListener(key, e => this[listeners[key]](e.detail !== undefined ? e.detail : e));
        }
    }
}
