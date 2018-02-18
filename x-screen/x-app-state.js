export default class XAppState {

    static getAppState() {
        this._instance = this._instance || new XAppState();
        return this._instance;
    }

    constructor() {
        /** @type {string} */
        this.error = null;
    }
}