import XAddressScannerBasePage from './x-address-scanner-base-page.js';

export default class XAddressScannerIntroPage extends XAddressScannerBasePage {
    html() {
        return `
            <div background class="move-bottom-in"></div>
            <h1 x-grow>Scan Address</h1>
            <button enable-camera-button>Enable Camera</button>
            <a secondary use-fallback-button>Continue without Camera</a>`;
    }

    onCreate() {
        super.onCreate();
        this._positionBackground = this._positionBackground.bind(this);
        this.$background = this.$('[background]');
        this.$('[use-fallback-button]').addEventListener('click', () => this.fire('x-address-scanner-select-page', 'fallback'));
    }

    onShow() {
        this._positionBackground();
        window.addEventListener('resize', this._positionBackground);
    }

    onHide() {
        window.removeEventListener('resize', this._positionBackground);
    }

    _positionBackground() {
        const imageRatio = 0.5455;
        const pageHeight = this.$el.offsetHeight;
        const pageWidth = this.$el.offsetWidth;
        const growthFactor = Math.log(Math.log(Math.log(pageHeight)));
        const imageHeight = 0.3 * pageHeight + growthFactor * pageHeight;
        const imageWidth = imageHeight * imageRatio;
        const imageTop = 0.09 * pageHeight + 0.18 * imageHeight;
        // x offset according to the image size to center the phone along the x axis
        const imageRight = 0.5 * pageWidth - 0.3 * imageWidth;
        this.$background.style.width = imageWidth + 'px';
        this.$background.style.height = imageHeight + 'px';
        this.$background.style.top = imageTop + 'px';
        this.$background.style.right = imageRight + 'px';
    }
}
