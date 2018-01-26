import XElement from '/library/x-element/x-element.js';
import QrScanner from '/library/qr-scanner/qr-scanner.min.js';
import XToast from "../x-toast/x-toast.js";

export default class XQrFileInput extends XElement {
    html() {
        return `<label>
                    <div content>
                        <x-default icon-upload></x-default>
                    </div>
                    <input type="file" accept="image/*">
                </label>`;
    }

    styles() { return ['x-qr-file-input'] }

    onCreate() {
        this.$input = this.$('input');
        this.$input.addEventListener('change', e => this._onFileSelected());
    }

    _onFileSelected() {
        const file = this.$input.files[0];
        this.$input.value = null; // reset the file selector
        if (!file) return;
        QrScanner.scanImage(file)
            .then(result => this._onFileScanSuccess(result))
            .catch(e => this._onFileScanError())
    }

    _onFileScanSuccess(result) {
        if (!this._validate(result)) return;
        this.fire(this.__tagname, result);
    }

    _onFileScanError() {
        this._onInvalid('No QR Code found!');
    }

    _onInvalid(message){
        this.animate('shake');
        if(message) XToast.show(message);
    }

    _validate() { return true; /* abstract method */ }
}

// Todo: replace `icon-upload` with a different one than that `send-icon` in `view-home`