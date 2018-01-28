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
        const fragment = decodeURIComponent(location.hash.substr(1))
        return this.fromString(fragment);
    }

    static fromString(string) {
        const path = string.split('/');
        return new XState(path);
    }
}