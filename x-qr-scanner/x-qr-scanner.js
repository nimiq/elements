class XQrScanner extends XElement {
    onCreate() {
        const $video = this.$('video');
        this.$fileUpload = this.$('input[type="file"]');
        this.$fileUpload.addEventListener('change', () => this._onFileSelected());
        // requires https://github.com/nimiq/qr-scanner
        this._scanner = new QrScanner($video, result => this.fire('x-decoded', result));

    }

    set active(active) {
        this._scanner.active = active;
    }

    setGrayscaleWeights(red, green, blue) {
        this._scanner.setGrayscaleWeights(red, green, blue);
    }

    _onFileSelected() {
        const file = this.$fileUpload.files[0];
        this.$fileUpload.value = ''; // reset the file upload
        if (!file) {
            return;
        }
        QrScanner.scanImage(file)
            .then(result => this.fire('x-decoded', result))
            .catch(() => this.fire('x-error', 'No QR code found.'));
    }

    html(){
        return `<video muted autoplay playsinline width="600" height="600"></video>
                <label icon-upload><input type="file"></label>`;
    }
}