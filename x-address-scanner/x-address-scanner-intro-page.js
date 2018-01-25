import XAddressScannerBasePage from './x-address-scanner-base-page.js';

export default class XAddressScannerIntroPage extends XAddressScannerBasePage {
    html() {
        return `
            <h1 x-grow>Scan Address</h1>
            <button enable-camera-button>Enable Camera</button>
            <a secondary use-fallback-button>Continue without Camera</a>`;
    }

    onCreate() {
        super.onCreate();
        this.$('[use-fallback-button]').addEventListener('click', () => this.fire('x-address-scanner-select-page', 'fallback'));
    }
}
