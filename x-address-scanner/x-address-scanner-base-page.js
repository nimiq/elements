import XElement from '/library/x-element/x-element.js';
import QrScanner from '/library/qr-scanner/qr-scanner.min.js';
import NanoApi from '/library/nano-api/nano-api.js';

export default class XAddressScannerBasePage extends XElement {
    onCreate() {
        this.$$('[enable-camera-button]').forEach(
            button => button.addEventListener('click', () => this.fire('x-address-scanner-select-page', 'scanner')));
        this.$$('input[type="file"]').forEach(
            fileInput => fileInput.addEventListener('change', event => this._onFileSelected(event)));
        this._fallbackInputs = this.$$('[fallback-input]');
        this._fallbackInputs.forEach(
            textInput => textInput.addEventListener('change', event => this._onTextInput(event)));
    }

    styles() {
        return ['x-address-scanner-base-page'];
    }

    set active(active) {
        if (!active) {
            this._fallbackInputs.forEach(textInput => {
                textInput.value = '';
                textInput.removeAttribute('invalid');
            });
        }
    }

    _onTextInput(event) {
        const input = event.target;
        if (NanoApi.validateAddress(input.value)) {
            input.removeAttribute('invalid');
            this.fire('x-address-scanned', input.value);
        } else {
            input.setAttribute('invalid', '');
        }
    }

    _onFileSelected(event) {
        const fileInput = event.target;
        const file = fileInput.files[0];
        fileInput.value = null; // reset the file selector
        if (!file) {
            return;
        }
        // Note that this call doesn't use the same qr worker as the webcam scanning and thus doesn't interfere with it.
        QrScanner.scanImage(file)
            .then(result => NanoApi.validateAddress(result)?
                this.fire('x-address-scanned', result) : this._onFileScanFailed(fileInput))
            .catch(() => this._onFileScanFailed(fileInput));
    }

    _onFileScanFailed(fileInput) {
        // abstract method
    }
}
