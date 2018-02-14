import XWalletBackup from '../x-wallet-backup/x-wallet-backup.js';
import XScreenFit from '../x-screen/x-screen-fit.js';

export default class ScreenDownloadRecovery extends XScreenFit {
    html() {
        return `
          <h2 secondary>Download your Recovery File to later recover your account</h2>
          <x-wallet-backup></x-wallet-backup>
          <x-grow></x-grow>
      `
    }

    get route() { return 'download' }

    types() {
        /** @type {XWalletBackup} */
        this.$walletBackup = null;
    }

    children() { return [XWalletBackup] }
}