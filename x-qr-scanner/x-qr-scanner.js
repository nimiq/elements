import XElement from '/library/x-element/x-element.js';
import QrScanner from '/library/qr-scanner/qr-scanner.min.js';

export default class XQrScanner extends XElement {
    html() {
        return `<video muted autoplay playsinline width="600" height="600"></video>
                <div qr-overlay></div>`;
    }

    onCreate() {
        const $video = this.$('video');
        this._validate = () => true;
        this._scanner = new QrScanner($video, result => this._validate(result) && this.fire('x-decoded', result));

        this.$qrOverlay = this.$('[qr-overlay]');
        this._positionOverlay();
        window.addEventListener('resize', () => this._positionOverlay());
    }

    start() {
        this._positionOverlay();
        return this._scanner.start();
    }

    stop() {
        this._scanner.stop();
    }

    set validator(validator) {
        this._validate = validator;
    }

    setGrayscaleWeights(red, green, blue) {
        this._scanner.setGrayscaleWeights(red, green, blue);
    }

    scanImage(image) {
        // Note that this call doesn't use the same qr worker as the webcam scanning and thus doesn't interfere with it.
        return QrScanner.scanImage(image)
            .then(result => this._validate(result)? result : null)
            .catch(() => null);
    }

    _positionOverlay() {
        const scannerHeight = this.$el.offsetHeight;
        const scannerWidth = this.$el.offsetWidth;
        const smallerDimension = Math.min(scannerHeight, scannerWidth);
        const overlaySize = Math.ceil(2 / 3 * smallerDimension);
        /* not always the accurate size of the sourceRect for QR
               detection (e.g. if video is landscape and screen portrait) but looks nicer in the UI */
        this.$qrOverlay.style.width = overlaySize + 'px';
        this.$qrOverlay.style.height = overlaySize + 'px';
        this.$qrOverlay.style.top = ((scannerHeight - overlaySize) / 2) + 'px';
        this.$qrOverlay.style.left = ((scannerWidth - overlaySize) / 2) + 'px';
    }
}
