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

    listeners() {
        return {
            'x-address-page-select': '_onPageSelect',
            'x-address-scanner-success': '_onCameraSuccess',
            'x-address-scanner-error': '_onCameraError',
            'x-address-input': '_onAddressInput',
            'x-address-file-input': '_onAddressInput',
            'x-address-scan': '_onAddressInput'
        }
    }

    _onAddressInput(e) {
        e.stopPropagation();
        const address = e.detail;
        navigator.vibrate && navigator.vibrate([100, 100, 100]);
        this.fire('x-recipient', address);
    }

    set active(active) {
        this.$screenRecipientScanner.active = active && ScannerSettingsStorage.useScanner;
    }

    _checkCameraStatus() {
        // const isFirstUse = ScannerSettingsStorage.isFirstUse;
        // if (isFirstUse) return this._select('intro');
        // const useScanner = ScannerSettingsStorage.useScanner;
        // if (useScanner)
        //     this._select('scanner');
        // else
        //     this._select('fallback');
    }

    _select(page) {
        this.fire('x-address-page-select', page);
    }

    _onPageSelect(page) {
        if (page === 'scanner') return this.$screenRecipientScanner.startScanner();
        this.goTo(page);
    }

    _onCameraSuccess() {
        this.goToChild('scanner');
        ScannerSettingsStorage.useScanner = true;
    }

    _onCameraError() {
        this.goToChild('fallback');
        ScannerSettingsStorage.useScanner = false;
        this.$toast.show('Failed to start scanner. Make sure nimiq.com is allowed to access your camera.');
    }

    _getDefaultScreen() {
        const isFirstUse = ScannerSettingsStorage.isFirstUse;
        if (isFirstUse) return this._childScreens['intro'];
        const useScanner = ScannerSettingsStorage.useScanner;
        if (useScanner)
            return this._childScreens['scanner'];
        else
            return this._childScreens['fallback'];
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
// Todo: Bug: Page layout defect in Firefox