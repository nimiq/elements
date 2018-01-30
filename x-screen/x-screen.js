import XElement from '/library/x-element/x-element.js';
import XState from './x-state.js';
export default class XScreen extends XElement {

    constructor(root) {
        super(root);
        if (!root) this._registerRootElement();
        this._bindListeners();
    }

    _registerRootElement() {
        XScreen._registerGlobalStateListener(this._onStateChange.bind(this));
    }

    _onStateChange(nextState, prevState, isNavigateBack) {
        if (!this._validateState(nextState, prevState, isNavigateBack)) return;
        if (nextState && nextState.isRootEqual(prevState)) return this._onChildStateChanged(nextState, prevState, isNavigateBack);
        this.__onChildExit(nextState, prevState, isNavigateBack);
        this.__onChildEntry(nextState, prevState, isNavigateBack);
    }

    _onChildStateChanged(nextState, prevState, isNavigateBack) {
        const childScreen = this._getChildScreen(nextState.id);
        if (!childScreen) return console.error(nextState.id, 'doesn\'t exist');;
        childScreen._onStateChange(nextState.child, prevState.child, isNavigateBack);
    }

    async __onChildEntry(nextState, prevState, isNavigateBack) {
        if (!this.isVisible) await this.__onEntry(nextState, prevState, isNavigateBack);
        if (!nextState.id) return this.__onEntry(nextState, prevState, isNavigateBack);
        const nextChild = this._getChildScreen(nextState.id);
        if (!nextChild) return console.error(nextState.id, 'doesn\'t exist');
        if (nextState.isLeaf) return nextChild.__onEntry(nextState, prevState, isNavigateBack);
        nextChild.__onChildEntry(nextState.child, prevState, isNavigateBack);
    }

    async __onEntry(nextState, prevState, isNavigateBack) {
        if (this.isVisible) return;
        this._show();
        if (this._childScreens) return this._onEntryDefault();
        if (this._onBeforeEntry) this._onBeforeEntry(nextState, prevState, isNavigateBack);
        await this._animateEntry(isNavigateBack);
        if (this._onEntry) this._onEntry(nextState, prevState, isNavigateBack);
    }

    _animateEntry(isNavigateBack) {
        if (!isNavigateBack)
            return this.animate('x-entry-animation');
        else
            return this.animate('x-exit-animation-reverse');
    }

    _onEntryDefault(prevState, isNavigateBack) {
        const defaultScreenId = Object.keys(this._childScreens)[0];
        const route = this._childScreens[defaultScreenId].route;
        this.goTo('./' + route);
    }

    async __onChildExit(nextState, prevState, isNavigateBack) {
        if (!prevState) return;
        const prevChild = this._getChildScreen(prevState.id);
        if (!prevChild) return;
        if (prevState.isLeaf) return prevChild.__onExit(nextState, prevState, isNavigateBack);
        prevChild.__onChildExit(nextState, prevState.child, isNavigateBack);
        if (this.isVisible) await this.__onExit(nextState, prevState, isNavigateBack);
    }

    async __onExit(nextState, prevState, isNavigateBack) {
        if (!this.isVisible) return;
        if (this._onBeforeExit) this._onBeforeExit(nextState, prevState, isNavigateBack);
        await this._animateExit(isNavigateBack);
        if (this._onExit) this._onExit(nextState, prevState, isNavigateBack);
        //this._hide();
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
        return this._route || this.__tagName.replace('screen-', '');
    }

    get _location() {
        if (!this._parent) return '#';
        return this._parent._location + this.route + '/';
    }

    goTo(route) {
        document.location = XState.locationFromRoute(route);
        // Todo: should return promise
    }

    back() {
        history.back();
        // Todo: should return promise
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
        const childScreen = this[child.__toChildName()];
        if (childScreen instanceof XScreen) this.__createChildScreen(childScreen);
    }

    __createChildScreen(child) {
        if (!this._childScreens) this._childScreens = {};
        this._childScreens[child.route] = child;
        child._parent = this;
    }

    __bindStyles(styles) {
        super.__bindStyles(styles);
        if (!this.styles) this.addStyle('x-screen');
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


// Todo: use history.replaceState to fix bug when navigating back after redirecting to default