import XWalletBackup from '../x-wallet-backup/x-wallet-backup.js';
import XScreenFit from '../x-screen/x-screen-fit.js';

export default class ScreenDownloadRecovery extends XScreenFit {
    html() {
        return `
          <h2 secondary>Do NOT share this Account Access File and keep it safe.</h2>
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