import XElement from '/library/x-element/x-element.js';
import XPages from '../x-pages/x-pages.js';
import XAddressScannerIntroPage from './x-address-scanner-intro-page.js';
import XAddressScannerScannerPage from './x-address-scanner-scanner-page.js';
import XAddressScannerFallbackPage from './x-address-scanner-fallback-page.js';

export default class XAddressScanner extends XElement {
    html() {
        return `
            <x-pages selected="scanner" animation-show="from-right-in" animation-hide="from-left-out">
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
        this.addEventListener('x-address-scanner-select-page', e => this._onPageSelection(e));
        this.addEventListener('x-address-scanner-camera-success', e => this._onCameraSuccess());
        this.addEventListener('x-address-scanner-camera-fail', e => this._onCameraFail());
    }

    set active(active) {
        this.$addressScannerIntroPage.active = active;
        this.$addressScannerFallbackPage.active = active;
        this.$addressScannerScannerPage.active = active && ScannerSettingsStorage.useCamera;
    }

    setGrayscaleWeights(red, green, blue) {
        this.$addressScannerScannerPage.setGrayscaleWeights(red, green, blue);
    }

    _checkCameraStatus() {
        const firstUse = ScannerSettingsStorage.firstUse;
        if (firstUse) {
            this.$pages.select('intro', false);
            return;
        }
        const useCamera = ScannerSettingsStorage.useCamera;
        if (useCamera) {
            this.$pages.select('scanner', false);
        } else {
            this.$pages.select('fallback', false);
        }
    }

    _onPageSelection(event) {
        const page = event.detail;
        this.$pages.select(page);
        if (page === 'fallback') {
            ScannerSettingsStorage.useCamera = false;
        } else if (page === 'scanner') {
            ScannerSettingsStorage.useCamera = true;
            this.$addressScannerScannerPage.active = true;
        }
    }

    _onCameraSuccess() {
        ScannerSettingsStorage.useCamera = true;
    }

    _onCameraFail() {
        ScannerSettingsStorage.useCamera = false;
        this.$pages.select('fallback');
        this.$addressScannerFallbackPage.showErrorMessage('Failed to start the camera. Make sure you gave Nimiq ' +
            'access to your camera in the browser settings.');
    }
}

class ScannerSettingsStorage {

    static get KEY_USE_CAMERA() { return 'x-address-scanner-use-camera' }

    static get firstUse() {
        const value = localStorage[this.KEY_USE_CAMERA];
        return value === undefined || value === null;
    }

    static set useCamera(useCamera) {
        const value = useCamera ? 'yes' : 'no'; // Hack: localstorage can't store booleans
        localStorage[this.KEY_USE_CAMERA] = value;
    }

    static get useCamera() {
        return localStorage[this.KEY_USE_CAMERA] === 'yes';
    }
}

// TODO input size on fallback page
// Todo: Refactor address input into x-address input?
// Todo: x-address-input should not be invalid while typing a correct address