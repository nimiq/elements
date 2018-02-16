import XElement from '/libraries/x-element/x-element.js';
import XState from './x-state.js';

export default class XScreen extends XElement {

    types() {
        /** @type {Map<string,XScreen>} */
        this._childScreens = new Map();
    }

    constructor(parent) {
        super(parent);
        if (!parent) this._registerRootElement();
        this._bindListeners();
        this.addEventListener('x-entry', this._onChildEntry.bind(this));
    }

    _registerRootElement() {
        XScreen._registerGlobalStateListener(this._onRootStateChange.bind(this));
        setTimeout(e => this._show(), 100);
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
        while (nextState && !nextState.isRoot) {
            const id = nextState.id;
            parent = parent._getChildScreen(id);
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
        return this._childScreens.values().next().value;
    }

    async __onEntry(nextState, prevState, isNavigateBack) {
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

    goTo(route) {
        return new Promise(resolve => {
            XScreen._goToResolve = resolve;
            document.location = XState.locationFromRoute(route);
        })
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
        return this._childScreens.get(id);
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
        //super.__createChild(child);
        if (!this._childScreens) this._childScreens = new Map();
        this._childScreens.set(child.route, child);
        child._parent = this;
    }

    __createChildScreens(child) {
        const name = child.__toChildName() + 's';

        this[name].forEach(c => this.__createChildScreen(c));
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

    __bindStyles(styles) {
        super.__bindStyles(styles);
        if (!this.styles) this.addStyle('x-screen');
    }

    _resolveGoTo() {
        if (!XScreen._goToResolve) return;
        XScreen._goToResolve();
        XScreen._goToResolve = null;
    }

    /** @param {function} callback */
    static _registerGlobalStateListener(callback) {
        if (this._stateListener) return; // We register only the first screen calling. All other screens get notified by their parent
        this.stateHistory = [];
        this._stateListener = window.addEventListener('popstate', e => this._onHistoryChange(callback));
        setTimeout(e => this._onHistoryChange(callback), 0); // Trigger FF layout
    }

    /** @param {function} callback */
    static _onHistoryChange(callback) {
        const nextState = XState.fromLocation();
        if (nextState.isEqual(this.currState)) return;
        const isNavigateBack = (nextState.isEqual(this.stateHistory[this.stateHistory.length - 1]));

        // Handle state history array
        if(isNavigateBack) this.stateHistory.pop();
        else this.stateHistory.push(this.currState);

        const prevState = this.currState;
        this.currState = nextState;
        callback(nextState, prevState, isNavigateBack);
    }

    static launch() { window.addEventListener('load', () => new this()); }
}
