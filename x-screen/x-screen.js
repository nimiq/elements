import XElement from '/library/x-element/x-element.js';
import XState from './x-state.js';
export default class XScreen extends XElement {

    constructor(parent) {
        super(parent);
        if (!parent) this._registerRootElement();
        this._bindListeners();
    }

    _registerRootElement() {
        XScreen._registerGlobalStateListener(this._onStateChange.bind(this));
        this._show();
    }

    async _onStateChange(nextState, prevState, isNavigateBack) {
        nextState = this._sanitizeState(nextState);
        console.log(nextState);
        const intersection = nextState.intersection(prevState); // calc intersection common parent path
        const nextStateDiff = nextState.difference(prevState);
        const prevStateDiff = prevState && prevState.difference(nextState);
        let parent = this;
        intersection.forEach(childId => parent = parent._getChildScreen(childId)); // decent common path
        let exitParent = prevStateDiff && parent._getChildScreen(prevStateDiff[0]);
        if (exitParent) exitParent._exitScreens(prevStateDiff, nextState, prevState, isNavigateBack);
        parent._entryScreens(nextStateDiff, nextState, prevState, isNavigateBack);
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

    _sanitizeState(nextState) {
        let parent = this;
        const state = nextState;
        while (nextState && !nextState.isRoot) {
            parent = parent._getChildScreen(nextState.id);
            nextState = nextState.child;
        }
        let child = parent;
        while (child && child._getDefaultScreen()) {
            child = child._getDefaultScreen();
        }
        const cleanState = XState.fromLocation(child._location);
        history.replaceState(history.state, history.state, child._location);
        XScreen.currState = cleanState;
        return cleanState;
    }

    _getDefaultScreen() {
        if (!this._childScreens) return;
        const defaultScreenId = Object.keys(this._childScreens)[0];
        return this._childScreens[defaultScreenId];
    }

    async __onEntry(nextState, prevState, isNavigateBack) {
        if (this.isVisible) return;
        this._show();
        if (this._onBeforeEntry) this._onBeforeEntry(nextState, prevState, isNavigateBack);
        await this._animateEntry(isNavigateBack);
        if (this._onEntry) await this._onEntry(nextState, prevState, isNavigateBack);
        this._resolveGoTo();
    }

    _animateEntry(isNavigateBack) {
        if (!isNavigateBack)
            return this.animate('x-entry-animation');
        else
            return this.animate('x-exit-animation-reverse');
    }

    async __onExit(nextState, prevState, isNavigateBack) {
        if (!this.isVisible) return;
        document.activeElement.blur();
        if (this._onBeforeExit) this._onBeforeExit(nextState, prevState, isNavigateBack);
        await this._animateExit(isNavigateBack);
        if (this._onExit) await this._onExit(nextState, prevState, isNavigateBack);
        this._hide();
    }

    _animateExit(isNavigateBack) {
        if (!isNavigateBack)
            return this.animate('x-exit-animation');
        else
            return this.animate('x-entry-animation-reverse');
    }

    _show() {
        this.$el.style.display = 'flex';
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

    goTo(route) {
        return new Promise(resolve => {
            XScreen._goToResolve = resolve;
            document.location = XState.locationFromRoute(route);
        })
    }

    goToChild(route) {
        document.location = this._location + '/' + route;
    }

    back() {
        return new Promise(resolve => {
            XScreen._goToResolve = resolve;
            history.back();
        });
    }

    _bindListeners() {
        if (!this.listeners) return;
        const listeners = this.listeners();
        for (const key in listeners) {
            this.addEventListener(key, e => this[listeners[key]](e.detail !== undefined ? e.detail : e));
        }
    }

    _getChildScreen(id) {
        if (!this._childScreens) return;
        return this._childScreens[id];
    }

    __createChild(child) {
        super.__createChild(child);
        if (child instanceof Array) this.__createChildScreens(child[0]);
        else {
            const childScreen = this[child.__toChildName()];
            if (childScreen instanceof XScreen) this.__createChildScreen(childScreen);
        }
    }

    __createChildScreen(child) {
        if (!this._childScreens) this._childScreens = {};
        this._childScreens[child.route] = child;
        child._parent = this;
    }

    __createChildScreens(child) {
        const name = child.__toChildName() + 's';
        this[name].forEach(c => this.__createChildScreen(c));
    }

    __bindStyles(styles) {
        super.__bindStyles(styles);
        if (!this.styles) this.addStyle('x-screen');
    }

    _resolveGoTo() {
        if (!XScreen._goToResolve) return;
        XScreen._goToResolve();
        XScreen._goToResolve = null;
    }

    _validateState(nextState, prevState, isNavigateBack) { return true /* Abstract Method */ }


    static _registerGlobalStateListener(callback) {
        if (this._stateListener) return; // We register only the first screen calling. All other screens get notified by their parent
        this._stateListener = window.addEventListener('popstate', e => this._onHistoryChange(callback));
        this._onHistoryChange(callback);
    }

    static _onHistoryChange(callback) {
        const nextState = XState.fromLocation();
        if (nextState.isEqual(this.currState)) return;
        const isNavigateBack = (nextState.isEqual(this.prevState));
        this.prevState = this.currState;
        this.currState = nextState;
        callback(nextState, this.prevState, isNavigateBack);
    }

    static launch() { window.addEventListener('load', () => new this()); }
}