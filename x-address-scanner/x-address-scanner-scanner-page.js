import XAddressScannerBasePage from './x-address-scanner-base-page.js';
import XQrScanner from '../x-qr-scanner/x-qr-scanner.js';
import XAddressInput from '../x-address-input/x-address-input.js';

export default class XAddressScannerScannerPage extends XAddressScannerBasePage {
    html() {
        return `
            <x-qr-scanner></x-qr-scanner>
            <x-header>
                <a icon-paste></a>
                <x-address-input></x-address-input>
                <label icon-upload><input type="file" accept="image/*"></label>
            </x-header>`;
    }

    children() {
        return [XQrScanner, XAddressInput];
    }

    onCreate() {
        super.onCreate();
        this.$qrScanner.validator = address => NanoApi.validateAddress(address);
        this._mapEvent(this.$qrScanner, 'x-decoded', 'x-address-scanned');
    }

    set active(active) {
        super.active = active;
        if (active) {
            this._startScanner();
        } else {
            this.$qrScanner.stop();
        }
    }

    setGrayscaleWeights(red, green, blue) {
        this.$qrScanner.setGrayscaleWeights(red, green, blue);
    }

    _startScanner() {
        this.$qrScanner.start().then(() => {
            this.fire('x-address-scanner-camera-success');
        }).catch(() => {
            this.fire('x-address-scanner-camera-fail');
        });
    }

    _onFileScanFailed(fileInput) {
        fileInput.parentNode.classList.add('scan-failed');
        setTimeout(() => fileInput.parentNode.classList.remove('scan-failed'), 4000);
    }
}
