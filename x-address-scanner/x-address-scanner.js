import XElement from '/library/x-element/x-element.js';
import XPages from '../x-pages/x-pages.js';
import XAddressScannerIntroPage from './x-address-scanner-intro-page.js';
import XAddressScannerScannerPage from './x-address-scanner-scanner-page.js';
import XAddressScannerFallbackPage from './x-address-scanner-fallback-page.js';

export default class XAddressScanner extends XElement {
    html() {
        return `
            <x-pages selected="scanner">
                <x-address-scanner-intro-page page="intro"></x-address-scanner-intro-page>
                <x-address-scanner-scanner-page page="scanner"></x-address-scanner-scanner-page>
                <x-address-scanner-fallback-page page="fallback"></x-address-scanner-fallback-page>
            </x-pages>`;
    }

    children() {
        return [XPages, XAddressScannerIntroPage, XAddressScannerScannerPage, XAddressScannerFallbackPage];
    }

    onCreate() {
        this._checkCameraStatus();
        this.addEventListener('x-address-scanner-select-page', event => this._onPageSelection(event));
        this.addEventListener('x-address-scanner-camera-success',
            () => localStorage[XAddressScanner.KEY_USE_CAMERA] = 'yes');
        this.addEventListener('x-address-scanner-camera-fail', () => this._onCameraFail());
    }

    set active(active) {
        this.$addressScannerIntroPage.active = active;
        this.$addressScannerFallbackPage.active = active;
        this.$addressScannerScannerPage.active = active && localStorage[XAddressScanner.KEY_USE_CAMERA] === 'yes';
    }

    setGrayscaleWeights(red, green, blue) {
        this.$addressScannerScannerPage.setGrayscaleWeights(red, green, blue);
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

    _onPageSelection(event) {
        const page = event.detail;
        this.$pages.select(page);
        if (page === 'fallback') {
            localStorage[XAddressScanner.KEY_USE_CAMERA] = 'no';
        } else if (page === 'scanner') {
            localStorage[XAddressScanner.KEY_USE_CAMERA] = 'yes';
            this.$addressScannerScannerPage.active = true;
        }
    }

    _onCameraFail() {
        localStorage[XAddressScanner.KEY_USE_CAMERA] = 'no';
        this.$pages.select('fallback');
        this.$addressScannerFallbackPage.showErrorMessage('Failed to start the camera. Make sure you gave Nimiq ' +
            'access to your camera in the browser settings.');
    }
}
XAddressScanner.KEY_USE_CAMERA = 'x-address-scanner-use-camera';

// TODO button animations
// TODO intro background responsive image sizing
// TODO page transition animations
// TODO input size on fallback page
// Todo: Refactor address input into x-address input?
// Todo: x-address-input should not be invalid while typing a correct address
