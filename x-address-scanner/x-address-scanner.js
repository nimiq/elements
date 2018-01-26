import XQrScanner from '../x-qr-scanner/x-qr-scanner.js';
import NanoApi from '/library/nano-api/nano-api.js';
export default class XAddressScanner extends XQrScanner {
    onCreate() {
        super.onCreate();
        this.setGrayscaleWeights(145, 91, 20); 
    }

    _validate(address) {
        return NanoApi.validateAddress(address);
    }
}
// Todo: [low] refactor setGrayscaleWeights into global config file