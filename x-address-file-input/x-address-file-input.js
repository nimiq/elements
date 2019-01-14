import XQrFileInput from '../x-qr-file-input/x-qr-file-input.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';

export default class XAddressFileInput extends XQrFileInput {
    _validate(address) {
        if (ValidationUtils.isValidAddress(address)) return true;
        this._onInvalid('No Address in QR Code!');
    }
}
// Todo: [low priority] handle if user selects a backup file 
	// 0: Create Nimiq.validateBackup
	// 1: tell user this is not an address but an backup file 
	// 2: ask user to send money to that account ? 