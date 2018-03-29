import XElement from "/libraries/x-element/x-element.js";
import NanoApi from "/libraries/nano-api/nano-api.js";

export default class XNimiqApi extends XElement {
    onCreate() {
        const connect = this.$el.getAttribute('connect') === 'true';
        this._api = NanoApi.getApi();
        this._api.setXElement(this);
        if (connect) this._api.connect();
    }
}
