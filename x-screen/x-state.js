export default class XState {
    constructor(path) {
        this._id = path[0];
        this._toString = path.join('/');
        const child = path.slice(1);
        if (child.length && child[0]) this._child = new XState(child);
        this._isLeaf = !this._child;
        this._path = path;
    }

    get isLeaf() { return this._isLeaf; }

    get id() { return this._id; }

    get isRoot() { return this.id === '' }

    get child() { return this._child; }

    get path() { return JSON.parse(JSON.stringify(this._path)) }

    isEqual(otherState) {
        return otherState && this.toString() === otherState.toString();
    }

    isRootEqual(otherState) {
        return otherState && this.id && this.id === otherState.id;
    }

    toString() {
        return this._toString;
    }

    intersection(otherState) {
        const intersection = [];
        let state1 = this;
        let state2 = otherState;
        while (state1 && state2 && state1.id === state2.id) {
            intersection.push(state1.id);
            state1 = state1.child;
            state2 = state2.child;
        }
        return intersection;
    }

    difference(otherState) {
        if (!otherState) return this.path;
        const difference = [];
        let state1 = this;
        let state2 = otherState;
        while (state1) {
            if (!state2 || state1.id !== state2.id) difference.push(state1.id);
            state1 = state1.child;
            if (state2) state2 = state2.child;
        }
        return difference;
    }

    static fromLocation(fragment) {
        fragment = fragment || this._currFragment();
        fragment = fragment[0] === '#' ? fragment.slice(1) : fragment;
        return this.fromString(fragment);
    }

    static fromString(string) {
        const path = string.split('/');
        return new XState(path);
    }

    static locationFromRoute(route) {
        if (!route) return;
        if (route[0] === '/') return this._locationFromAbsoluteRoute(route);
        if (route.indexOf('./') === 0) return this._locationFromSubroute(route);
        return this._locationFromRelativeRoute(route);
    }

    static _locationFromRelativeRoute(route) {
        const fragment = this._currFragment();
        const path = fragment.split('/').filter(e => e);
        path.pop();
        path.push(route);
        return '#' + path.join('/');
    }

    static _locationFromSubroute(route) {
        route = route.slice(2);
        let fragment = this._currFragment();
        let lastChar = fragment[fragment.length - 1];
        if (!!fragment && lastChar !== '/') fragment += '/';
        return '#' + fragment + route;
    }

    static _locationFromAbsoluteRoute(route) {
        return '#' + route.slice(1);
    }

    static _currFragment() {
        let fragment = decodeURIComponent(location.hash.slice(1));
        fragment = fragment.replace('#/', '#');
        return fragment;
    }
}