import XElement from '/library/x-element/x-element.js';
import QrScanner from '/library/qr-scanner/qr-scanner.min.js';

export default class XQrScanner extends XElement {
    html() {
        return `<video muted autoplay playsinline width="600" height="600"></video>
                <x-qr-scanner-overlay></x-qr-scanner-overlay>`;
    }
    styles() { return ['x-qr-scanner'] }

    onCreate() {
        const $video = this.$('video');
        this._scanner = new QrScanner($video, result => this._onResult(result));
        this.$qrOverlay = this.$('x-qr-scanner-overlay');
        window.addEventListener('resize', () => this._positionOverlay());
    }

    async start() {
        await this._scanner.start();
        requestAnimationFrame(e => this._positionOverlay());
    }

    stop() {
        this._scanner.stop();
    }

    _onResult(result) {
        if (!this._validate(result)) return;
        const eventName = this.__tagName.replace('scanner', 'scan');
        this.fire(eventName, result);
    }


    setGrayscaleWeights(red, green, blue) {
        this._scanner.setGrayscaleWeights(red, green, blue);
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

    _validate() { return true; /* abstract method */ }
}



// Todo: [Daniel] event should fire only once every 7s for the same result