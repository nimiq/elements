import XElement from '/libraries/x-element/x-element.js';
import QrScanner from '/libraries/qr-scanner/qr-scanner.min.js';

export default class XQrScanner extends XElement {
    static get REPORT_FREQUENCY() {
        return 7000; // report the same result only every 7s
    }

    html() {
        return `
            <video muted autoplay playsinline width="600" height="600"></video>
            <x-qr-scanner-overlay></x-qr-scanner-overlay>
        `;
    }

    styles() { return ['x-qr-scanner'] }

    onCreate() {
        const $video = this.$('video');
        this._lastResult = null;
        this._lastResultTime = 0;
        this._scanner = new QrScanner($video, result => this._onResult(result));
        this.$qrOverlay = this.$('x-qr-scanner-overlay');
        window.addEventListener('resize', () => this._positionOverlay());
    }

    async start() {
        try {
            await this._scanner.start();
            requestAnimationFrame(e => this._positionOverlay());
        }
        catch(e) {
            this.fire('x-qr-scanner-error');
        };
    }

    stop() {
        this._scanner.stop();
    }

    _onResult(result) {
        if ((result === this._lastResult && Date.now() - this._lastResultTime < XQrScanner.REPORT_FREQUENCY)
            || !this._validate(result)) return;
        this._lastResult = result;
        this._lastResultTime = Date.now();
        const eventName = this.__tagName.replace('scanner', 'scan');
        this.fire(eventName, result);
    }


    setGrayscaleWeights(red, green, blue) {
        this._scanner.setGrayscaleWeights(red, green, blue);
    }

    _positionOverlay() {
        const $parent = this.$el;
        const scannerHeight = $parent.offsetHeight;
        const scannerWidth = $parent.offsetWidth;
        const smallerDimension = Math.min(scannerHeight, scannerWidth);
        const overlaySize = Math.ceil(2 / 3 * smallerDimension);
        // not always the accurate size of the sourceRect for QR detection (e.g. if video is landscape and
        // screen portrait) but looks nicer in the UI.
        this.$qrOverlay.style.width = overlaySize + 'px';
        this.$qrOverlay.style.height = overlaySize + 'px';
        this.$qrOverlay.style.top = ((scannerHeight - overlaySize) / 2) + 'px';
        this.$qrOverlay.style.left = ((scannerWidth - overlaySize) / 2) + 'px';
    }

    _validate() { return true; /* abstract method */ }
}

// Todo: [Daniel] [low priority] can we detect if camera exists without asking for permission?
