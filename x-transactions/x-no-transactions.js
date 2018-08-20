import XElement from '/libraries/x-element/x-element.js';
import Config from '/libraries/secure-utils/config/config.js';
import { getString } from '../strings.js'

export default class XNoTransactions extends XElement {
    html() {
        return `
            <h1 class="material-icons">inbox</h1>
            <span>${getString('no_txs')}</span>
        `
    }

    onCreate() {
        if (Config.offline) {
            this.$('h1').textContent = 'cloud_off';
            this.$('span').textContent = getString('no_txs_offline_mode');
        }
    }
}
