import MixinModal from "/elements/mixin-modal/mixin-modal.js";
import XLedgerUi from "./x-ledger-ui.js";

export default class XLedgerUiModal extends MixinModal(XLedgerUi) {
   styles() {
       return [ ...super.styles(), 'nimiq-dark' ];
   }

   onHide() {
       this.cancelRequests();
   }

   _showInstructions(type, text) {
       if ((type && type !== 'none') || text) {
           this.show();
       }
       super._showInstructions(type, text);
   }
}
