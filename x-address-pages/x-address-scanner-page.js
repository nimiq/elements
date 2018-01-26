import XAddressPage from './x-address-page.js';
import XQrScanner from '../x-qr-scanner/x-qr-scanner.js';
import XAddressScanner from '../x-address-input/x-address-input.js';
import XAddressInput from '../x-address-scanner/x-address-scanner.js';
import XAddressFileInput from '../x-address-file-input/x-address-file-input.js';

export default class XAddressScannerPage extends XAddressPage {
    html() {
        return `
            <x-address-scanner></x-address-scanner>
            <x-header>
                <x-address-input></x-address-input>
                <x-address-file-input></x-address-file-input>
            </x-header>`;
    }

    children() {
        return [XAddressScanner, XAddressInput, XAddressFileInput];
    }

    onCreate() {
        super.onCreate();
    }

    set active(active) {
        super.active = active;
        if (active) 
            this._startScanner();
        else 
            this.$addressScanner.stop();
    }

    setGrayscaleWeights(red, green, blue) {
        this.$addressScanner.setGrayscaleWeights(red, green, blue);
    }

    _startScanner() {
        this.$addressScanner.start()
            .then(e => this.fire('x-address-scanner-success'))
            .catch(e => this.fire('x-address-scanner-error'));
    }
}
