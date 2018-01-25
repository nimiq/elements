import XElement from '/library/x-element/x-element.js';
import XPages from '../x-pages/x-pages.js';
import XQrScanner from '../x-qr-scanner/x-qr-scanner.js';
import NanoApi from '/library/nano-api/nano-api.js';

export default class XAddressScanner extends XElement {
    html() {
        return `
            <x-pages selected="scanner">
                <div page="intro">
                    <h1 x-grow>Scan Address</h1>
                    <button enable-camera-button>Enable Camera</button>
                    <a secondary use-fallback-button>Continue without Camera</a>
                </div>
                <div page="scanner">
                    <x-qr-scanner></x-qr-scanner>
                    <x-header>
                        <a icon-paste></a>
                        <input fallback-input type="text" placeholder="Enter Address" spellcheck="false" autocomplete="off">
                        <label icon-upload><input type="file"></label>
                    </x-header>   
                </div>
                <div page="fallback">
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
                    </label>
                </div>
            </x-pages>`;
    }

    children() {
        return [XPages, XQrScanner];
    }

    onCreate() {
        this._checkCameraStatus();
        this.$qrScanner.validator = address => NanoApi.validateAddress(address);
        this.$qrScanner.addEventListener('x-decoded', event => this.fire('x-address-scanned', event.data));

        this.$$('[enable-camera-button]').forEach(
            button => button.addEventListener('click', () => this._startScanner()));
        this.$('[use-fallback-button]').addEventListener('click', () => this._useFallback());

        this.$$('input[type="file"]').forEach(
            fileInput => fileInput.addEventListener('change', event => this._onFileSelected(event)));
        this._fallbackInputs = this.$$('[fallback-input]');
        this._fallbackInputs.forEach(
            textInput => textInput.addEventListener('change', event => this._onTextInput(event)));

        this.$errorMessage = this.$('[error-message]');
    }

    set active(active) {
        if (active) {
            if (localStorage[XAddressScanner.KEY_USE_CAMERA] !== 'yes') {
                return;
            }
            this._startScanner();
        } else {
            this.$qrScanner.stop();
            this._fallbackInputs.forEach(textInput => {
                textInput.value = '';
                textInput.removeAttribute('invalid');
            });
        }
    }

    setGrayscaleWeights(red, green, blue) {
        this.$qrScanner.setGrayscaleWeights(red, green, blue);
    }

    _checkCameraStatus() {
        const useCamera = localStorage[XAddressScanner.KEY_USE_CAMERA];
        if (useCamera === undefined || useCamera === null) {
            this.$pages.select('intro', false);
        } else if (useCamera === 'yes') {
            this.$pages.select('scanner', false);
        } else {
            this.$pages.select('fallback', false);
        }
    }

    _startScanner() {
        this.$pages.select('scanner');
        this.$qrScanner.start().then(() => {
            // successfully started
            localStorage[XAddressScanner.KEY_USE_CAMERA] = 'yes';
        }).catch(() => {
            localStorage[XAddressScanner.KEY_USE_CAMERA] = 'no';
            this.$pages.select('fallback');
            this._showErrorMessage('Failed to start the camera. Make sure you gave Nimiq access to your camera in ' +
                'the browser settings.');
        });
    }

    _useFallback() {
        localStorage[XAddressScanner.KEY_USE_CAMERA] = 'no';
        this.$pages.select('fallback');
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
        const fileInputIcon = fileInput.parentNode;
        const file = fileInput.files[0];
        fileInput.value = null; // reset the file selector
        if (!file) {
            return;
        }
        // Note that this call doesn't use the same qr worker as the webcam scanning and thus doesn't interfere with it.
        this.$qrScanner.scanImage(file)
            .then(result => result? this.fire('x-address-scanned', result) : this._onFileScanFailed(fileInputIcon));
    }

    _onFileScanFailed(fileInputIcon) {
        if (this.$pages.selected === 'scanner') {
            fileInputIcon.classList.add('scan-failed');
            setTimeout(() => fileInputIcon.classList.remove('scan-failed'), 4000);
        } else {
            this._showErrorMessage('File scan failed.');
        }
    }

    _showErrorMessage(message) {
        this.$errorMessage.textContent = message;
        this.$errorMessage.classList.add('show-error');
        setTimeout(() => this.$errorMessage.classList.remove('show-error'), 6000);
    }
}
XAddressScanner.KEY_USE_CAMERA = 'x-address-scanner-use-camera';

// TODO button animations
// TODO intro background responsive image sizing
// TODO page transition animations
// TODO input size on fallback page
// Todo: Refactor address input into x-address input?
// Todo: x-address-input should not be invalid while typing a correct address
