import XAddressScannerBasePage from "./x-address-scanner-base-page.js";

export default class XAddressScannerFallbackPage extends XAddressScannerBasePage {
    html() {
        return `
            <h1>Enter Address</h1>
            <div x-grow class="center relative">
                <div class="relative">
                    <a icon-paste></a>
                    <input fallback-input type="text" placeholder="Enter Address" spellcheck="false" autocomplete="off">
                </div>
                <div error-message></div>
            </div>
            <a secondary enable-camera-button>Use the Scanner</a>
            <label>
                <a secondary>Scan from image</a>
                <input type="file">
            </label>`;
    }

    onCreate() {
        super.onCreate();
        this.$errorMessage = this.$('[error-message]');
    }

    _onFileScanFailed(fileInputIcon) {
        this.showErrorMessage('File scan failed.');
    }

    showErrorMessage(message) {
        this.$errorMessage.textContent = message;
        this.$errorMessage.classList.add('show-error');
        setTimeout(() => this.$errorMessage.classList.remove('show-error'), 6000);
    }
}
