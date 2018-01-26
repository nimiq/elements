import XQrScanner from '../x-qr-scanner/x-qr-scanner.js';
export default class XAddressScanner extends XQrScanner {
    _validate(address) {
        return NanoApi.validateAddress(address);
    }
}