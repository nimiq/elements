import MixinModal from "/elements/mixin-modal/mixin-modal.js";
import XLedgerUi from "./x-ledger-ui.js";

export default class XLedgerUiModal extends MixinModal(XLedgerUi) {
    styles() {
        return [ ...super.styles(), 'nimiq-dark' ];
    }

    onHide() {
        this.cancelRequests();
    }

    _showInstructions(type, title, text) {
        if ((type && type !== 'none') || title || text) {
            this.show();
        }
        super._showInstructions(type, title, text);
    }

    cancelRequests() {
        super.cancelRequests();
        this.hide();
    }

/*  // TODO hiding modal for getAddress, confirmAddress and getPublicKey shouldn't be done this way, as they also get
    // called within getConfirmedAddress and signTransaction
    async getAddress() {
        try {
            return await super.getAddress();
        } finally {
            this.hide();
        }
    }

    async confirmAddress(userFriendlyAddress) {
        try {
            return await super.confirmAddress(userFriendlyAddress);
        } finally {
            this.hide();
        }
    }

    async getPublicKey() {
        try {
            return await super.getPublicKey();
        } finally {
            this.hide();
        }
    }*/

    async getConfirmedAddress() {
        try {
            return await super.getConfirmedAddress();
        } finally {
            this.hide();
        }
    }

    async signTransaction(transaction) {
        try {
            return await super.signTransaction(transaction);
        } finally {
            this.hide();
        }
    }
}
