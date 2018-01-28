import XElement from '/library/x-element/x-element.js';
import XState from './x-state.js';
export default class XScreen extends XElement {

    constructor(root) {
        super(root);
        if (!root) this._registerRootElement();
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

    async __onEntry(nextState, prevState, isNavigateBack) {
        if (this._childScreens) return this._onEntryDefault();
        this._show();
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

    __onChildEntry(nextState, prevState, isNavigateBack) {
        if (!nextState.id) return this.__onEntry(nextState, prevState, isNavigateBack);
        const nextChild = this._getChildScreen(nextState.id);
        if (!nextChild) return console.error(nextState.id, 'doesn\'t exist');
        if (nextState.isLeaf) return nextChild.__onEntry(nextState, prevState, isNavigateBack);
        nextChild.__onChildEntry(nextState.child, prevState, isNavigateBack);
    }

    _onEntryDefault(prevState, isNavigateBack) {
        const defaultScreenId = Object.keys(this._childScreens)[0];
        location = this._childScreens[defaultScreenId]._location;
    }

    async __onExit(nextState, prevState, isNavigateBack) {
        if (this._onBeforeExit) this._onBeforeExit(nextState, prevState, isNavigateBack);
        await this._animateExit(isNavigateBack);
        if (this._onExit) this._onExit(nextState, prevState, isNavigateBack);
        this._hide();
    }

    _animateExit(isNavigateBack) {
        if (!isNavigateBack)
            return this.animate('x-exit-animation');
        else
            return this.animate('x-entry-animation-reverse');
    }

    __onChildExit(nextState, prevState, isNavigateBack) {
        if (!prevState) return;
        const prevChild = this._getChildScreen(prevState.id);
        if (!prevChild) return;
        if (prevState.isLeaf) return prevChild.__onExit(nextState, prevState, isNavigateBack);
        prevChild.__onChildExit(nextState, prevState.child, isNavigateBack);
    }

    _onChildStateChanged(nextState, prevState, isNavigateBack) {
        const childScreen = this._getChildScreen(nextState.id);
        if (!childScreen) return console.error(nextState.id, 'doesn\'t exist');;
        childScreen._onStateChange(nextState.child, prevState.child, isNavigateBack);
    }

    get route() {
        return this._route || this.__tagName.replace('screen-', '');
    }

    get _location() {
        if (!this._parent) return '#';
        return this._parent._location + this.route + '/';
    }

    _validateState(nextState, prevState, isNavigateBack) { return true /* Abstract Method */ }

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

    _getChildScreen(id) {
        if (!this._childScreens) return;
        return this._childScreens[id];
    }

    _show(){
        this.$el.style.display = 'flex';
    }

    _hide(){
        this.$el.style.display = 'none';
    }

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
}


// Todo: use history.replaceState to fix bug when navigating back after redirecting to default