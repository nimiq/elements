import XScreenFit from '../x-screen/x-screen-fit.js';
import XToast from '../x-toast/x-toast.js';
import ScreenRecipientIntro from './screen-recipient-intro.js';
import ScreenRecipientScanner from './screen-recipient-scanner.js';
import ScreenRecipientFallback from './screen-recipient-fallback.js';

export default class ScreenRecipient extends XScreenFit {
    html() {
        return `
                <screen-recipient-intro></screen-recipient-intro>
                <screen-recipient-scanner></screen-recipient-scanner>
                <screen-recipient-fallback></screen-recipient-fallback>
            `;
    }

    children() {
        return [ScreenRecipientIntro, ScreenRecipientScanner, ScreenRecipientFallback, XToast];
    }

    onCreate() {
        this.addEventListener('x-address-page-select', e => this._onPageSelect(e));

        this.addEventListener('x-address-scanner-success', e => this._onCameraSuccess());
        this.addEventListener('x-address-scanner-error', e => this._onCameraError());

        this.addEventListener('x-address-input', e => this._onAddressInput(e));
        this.addEventListener('x-address-file-input', e => this._onAddressInput(e));
        this.addEventListener('x-address-scan', e => this._onAddressInput(e));
        requestAnimationFrame(e => this._checkCameraStatus());
    }

    _onAddressInput(e) {
        e.stopPropagation();
        const address = e.detail;
        this.fire('x-recipient', address);
    }

    set active(active) {
        this.$screenRecipientScanner.active = active && ScannerSettingsStorage.useScanner;
    }

    _checkCameraStatus() {
        const isFirstUse = ScannerSettingsStorage.isFirstUse;
        if (isFirstUse) return this._select('intro');
        const useScanner = ScannerSettingsStorage.useScanner;
        if (useScanner)
            this._select('scanner');
        else
            this._select('fallback');
    }

    _select(page) {
        this.fire('x-address-page-select', page);
    }

    _onPageSelect(event) {
        const page = event.detail;
        if(page === 'scanner') return this.$screenRecipientScanner.startScanner();
        this.goTo(page);
    }


    _onCameraSuccess() {
        this.goTo('scanner');
        ScannerSettingsStorage.useScanner = true;
    }

    _onCameraError() {
        this.goTo('fallback');
        ScannerSettingsStorage.useScanner = false;
        this.$toast.show('Failed to start scanner. Make sure nimiq.com is allowed to access your camera.');
    }
}

class ScannerSettingsStorage {

    static get KEY_USE_CAMERA() { return 'x-scanner-use-camera' }

    static get isFirstUse() {
        const value = localStorage[this.KEY_USE_CAMERA];
        return value === undefined || value === null;
    }

    static set useScanner(useScanner) {
        const value = useScanner ? 'yes' : 'no'; // Hack: localstorage can't store booleans
        localStorage[this.KEY_USE_CAMERA] = value;
    }

    static get useScanner() {
        return localStorage[this.KEY_USE_CAMERA] === 'yes';
    }
}

// Todo: refactor _pageSelect to use x-screen state changes