import MixinModal from "/elements/mixin-modal/mixin-modal.js";
import XLedgerUi from "./x-ledger-ui.js";

export default class XLedgerUiModal extends MixinModal(XLedgerUi) {
    styles() {
        return [ ...super.styles(), 'nimiq-dark' ];
    }

    onCreate() {
        super.onCreate();
        this._hideTimeout = null;
        this._shouldCancelOnHide = true;
    }

    onHide() {
        if (this._shouldCancelOnHide) this.cancelRequest();
    }

    _showInstructions(type, title, text) {
        if ((type && type !== 'none') || title || text) {
            clearTimeout(this._hideTimeout);
            super._showInstructions(type, title, text);
            this.show();
        } else {
            // delay hiding to not hide between compound calls that consist of two calls to ledger
            this._hideTimeout = setTimeout(() => {
                this._shouldCancelOnHide = false;
                this.hide();
                this._shouldCancelOnHide = true;
                this._hideTimeout = setTimeout(() => super._showInstructions('none'), 400);
            }, 250);
        }
    }

}
