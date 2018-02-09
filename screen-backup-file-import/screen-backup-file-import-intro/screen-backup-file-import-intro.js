import XWalletBackupImport from '/elements/x-wallet-backup-import/x-wallet-backup-import.js';
import XScreenFit from '/elements/x-screen/x-screen-fit.js';

export default class ScreenBackupFileImportIntro extends XScreenFit {
    html() {
        return `
            <h2 secondary>Select a backup file to import an account</h2>
            <x-wallet-backup-import></x-wallet-backup-import>
        `
    }

    get route() { return 'intro' }

    children() { return [XWalletBackupImport] }
}