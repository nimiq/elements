import XElement from '/libraries/x-element/x-element.js';
import { getString } from '../strings.js';

export default class XNoAccounts extends XElement {
    html() {
        return `
            <h1 class="material-icons">account_circle</h1>
            ${getString('add_account_hint')}
        `
    }
}
