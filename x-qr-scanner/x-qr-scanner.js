import XElement from "/library/x-element/x-element.js";
import QrScanner from "/qr-scanner/qr-scanner.min.js";

export default class XQrScanner extends XElement {
    html() {
        return `<video muted autoplay playsinline width="600" height="600"></video>
                <div qr-overlay></div>
                <label icon-upload><input type="file"></label>`;
    }

    onCreate() {
        const $video = this.$('video');
        this.$qrOverlay = this.$('[qr-overlay]');
        this.$fileUpload = this.$('input[type="file"]');
        this.$fileUpload.addEventListener('change', () => this._onFileSelected());
        // requires https://github.com/nimiq/qr-scanner
        this._scanner = new QrScanner($video, result => this.fire('x-decoded', result));

        this._positionOverlay();
        window.addEventListener('resize', () => this._positionOverlay());
    }

    set active(active) {
        this._scanner.active = active;
        if (active) {
            this._positionOverlay();
        }
    }

    set hasFileInputButton(hasFileInputButton) {
        this.$fileUpload.parentNode.style.display = hasFileInputButton ? 'block' : 'none';
    }

    setGrayscaleWeights(red, green, blue) {
        this._scanner.setGrayscaleWeights(red, green, blue);
    }

    scanImage(image) {
        // Note that this call doesn't use the same qr worker as the webcam scanning and thus doesn't interfere with it.
        return QrScanner.scanImage(image)
            .then(result => this.fire('x-image-decoded', result))
            .catch(e => this.fire('x-image-error', 'No QR code found.'));
    }

    _onFileSelected() {
        const file = this.$fileUpload.files[0];
        this.$fileUpload.value = ''; // reset the file upload
        if (!file) {
            return;
        }
        this.scanImage(file);
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
