export default class XState {
    constructor(path) {
        this._id = path[0];
        this._toString = path.join('/');
        const child = path.slice(1);
        if (child.length && child[0]) this._child = new XState(child);
        this._isLeaf = !this._child;
    }

    get isLeaf() { return this._isLeaf; }

    get id() { return this._id; }

    get child() { return this._child; }

    isEqual(otherState) {
        return otherState && this.toString() === otherState.toString();
    }

    isRootEqual(otherState) {
        return otherState && this.id && this.id === otherState.id;
    }

    toString() {
        return this._toString;
    }

    static fromLocation() {
        const fragment = this._currFragment();
        return this.fromString(fragment);
    }

    static fromString(string) {
        const path = string.split('/');
        return new XState(path);
    }

    static locationFromRoute(route) {
        if (!route) return;
        if (route[0] === '/')
            return this._locationFromAbsoluteRoute(route);
        else
            return this._locationFromRelativeRoute(route);
    }

    static _locationFromRelativeRoute(route) {
        const fragment = this._currFragment();
        const path = fragment.split('/').filter(e => e);
        path.pop();
        path.push(route);
        return '#' + path.join('/');
    }

    static _locationFromAbsoluteRoute(route) {
        return '#' + route.slice(1);
    }

    static _currFragment() {
        return decodeURIComponent(location.hash.substr(1));
    }
}