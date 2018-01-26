import XElement from '/library/x-element/x-element.js';
import QrScanner from '/library/qr-scanner/qr-scanner.min.js';
import NanoApi from '/library/nano-api/nano-api.js';

export default class XAddressScannerBasePage extends XElement {
    onCreate() {
        this.$$('[enable-camera-button]').forEach(
            button => button.addEventListener('click', () => this.fire('x-address-scanner-select-page', 'scanner')));
        this.$$('input[type="file"]').forEach(
            fileInput => fileInput.addEventListener('change', event => this._onFileSelected(event)));
        this._addressInputs = this.$$('x-address-input');
        this._addressInputs.forEach(input => this._mapEvent(input, 'x-address-input', 'x-address-scanned'));
    }

    styles() {
        return ['x-address-scanner-base-page'];
    }

    set active(active) {
        if (!active) {
            this._addressInputs.forEach(addressInput => this._resetInput(addressInput));
        }
    }

    _resetInput(input) {
        input.value = '';
    }

    _mapEvent(el, sourceEvent, targetEvent) {
        el.addEventListener(sourceEvent, event => {
            event.stopPropagation();
            event.preventDefault();
            el.state.fire(targetEvent, event.detail);
        });
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
