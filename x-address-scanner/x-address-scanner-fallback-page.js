import XAddressScannerBasePage from "./x-address-scanner-base-page.js";
import XToast from "../x-toast/x-toast.js";
import XAddressInput from "../x-address-input/x-address-input.js";

export default class XAddressScannerFallbackPage extends XAddressScannerBasePage {
    html() {
        return `
            <h1>Enter Address</h1>
            <div x-grow class="center relative">
                <div class="relative">
                    <a icon-paste></a>
                    <x-address-input></x-address-input>
                </div>
            </div>
            <a secondary enable-camera-button>Use the Scanner</a>
            <label>
                <a secondary>Scan from image</a>
                <input type="file" accept="image/*">
            </label>`;
    }

    children() { return [XToast, XAddressInput] }

    onCreate() {
        super.onCreate();
    }

    _onFileScanFailed(fileInputIcon) {
        this.showErrorMessage('File scan failed.');
    }

    showErrorMessage(message) {
        this.$toast.show(message);
    }
}