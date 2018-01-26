import XQrScanner from '../x-qr-scanner/x-qr-scanner.js';
export default class XAddressScanner extends XQrScanner {
    onCreate() {
        super.onCreate();
        this.setGrayscaleWeights(145, 91, 20); // Todo: refactor magic numbers into global config file
    }

    _validate(address) {
        return NanoApi.validateAddress(address);
    }
}