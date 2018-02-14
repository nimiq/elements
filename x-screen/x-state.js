export default class XState {
    constructor(path) {
        /** @type {string} */
        this._id = path[0];
        /** @type {string} */
        this._toString = path.join('/');
        /** @type {string} */
        const child = path.slice(1);
        if (child.length && child[0]) this._child = new XState(child);
        /** @type {boolean} */
        this._isLeaf = !this._child;
        /** @type {string[]} */
        this._path = path;
    }

    /** @returns {boolean} */
    get isLeaf() { return this._isLeaf; }

    /** @returns {string} */
    get leafId() { return this._path[this._path.length]; }

    /** @returns {string} */
    get id() { return this._id; }

    /** @returns {boolean} */
    get isRoot() { return this.id === '' }

    /** @returns {XState} */
    get child() { return this._child; }

    /** @returns {string[]} */
    get path() { return JSON.parse(JSON.stringify(this._path)) }

    /** @return {boolean} */
    isEqual(otherState) {
        return otherState && this.toString() === otherState.toString();
    }

    /** @return {boolean} */
    isRootEqual(otherState) {
        return otherState && this.id && this.id === otherState.id;
    }

    /** @return {string} */
    toString() {
        return this._toString;
    }

    /** @return {string[]} */
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

    /** @return {string[]} */
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

    /** @param {string} fragment
     *  @returns {XState}
     */
    static fromLocation(fragment) {
        fragment = fragment || this._currFragment();
        fragment = fragment[0] === '#' ? fragment.slice(1) : fragment;
        return this.fromString(fragment);
    }

    /** @param {string} string
     * @returns {XState}
     */
    static fromString(string) {
        const path = string.split('/');
        return new XState(path);
    }

    /** @param {string[]} route
     *  @returns string */
    static locationFromRoute(route) {
        if (!route) return '';
        if (route[0] === '/') return this._locationFromAbsoluteRoute(route);
        if (route.indexOf('./') === 0) return this._locationFromSubroute(route);
        return this._locationFromRelativeRoute(route);
    }

    /** @param {string[]} route
     *  @returns string */
    static _locationFromRelativeRoute(route) {
        const fragment = this._currFragment();
        const path = fragment.split('/').filter(e => e);
        path.pop();
        path.push(route);
        return '#' + path.join('/');
    }

    /** @param {string[]} route
     *  @returns string */
    static _locationFromSubroute(route) {
        route = route.slice(2);
        let fragment = this._currFragment();
        let lastChar = fragment[fragment.length - 1];
        if (!!fragment && lastChar !== '/') fragment += '/';
        return '#' + fragment + route;
    }

    /** @param {string[]} route
     *  @returns string */
    static _locationFromAbsoluteRoute(route) {
        return '#' + route.slice(1);
    }

    /** @returns string */
    static _currFragment() {
        let fragment = decodeURIComponent(location.hash.slice(1));
        fragment = fragment.replace('#/', '#');
        return fragment;
    }
}