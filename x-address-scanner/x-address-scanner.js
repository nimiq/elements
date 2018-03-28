import XQrScanner from '../x-qr-scanner/x-qr-scanner.js';
import ValidationUtils from '/libraries/nimiq-utils/validation-utils/validation-utils.js';
export default class XAddressScanner extends XQrScanner {
    onCreate() {
        super.onCreate();
        this.setGrayscaleWeights(145, 91, 20); 
    }

    _validate(address) {
        return ValidationUtils.isValidAddress(address);
    }
}