import XElement from '/libraries/x-element/x-element.js'
import MixinModal from '/elements/mixin-modal/mixin-modal.js'
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js'
import { upgradeCanceled } from '/elements/x-accounts/accounts-redux.js'
import { importVueComponent } from '/elements/vue-components/import-vue-component.js'
import Iqons from '/libraries/iqons/dist/iqons.min.js'
import XSendTransactionModal from '/elements/x-send-transaction/x-send-transaction-modal.js'
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js'

export default class VContactListModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Contacts</h2>
            </div>
            <div class="modal-body" id="vue-contact-list">
                <contact-list :contacts="contacts" ref="contactList"></contact-list>
            </div>
        `
    }

    onCreate() {
        super.onCreate()
        const self = this

        // Load dependency components
        /* asset(/elements/vue-components/ContactList.vue) */
        /* asset(/elements/vue-components/Contact.vue) */
        /* asset(/elements/vue-components/Identicon.vue) */
        /* asset(/elements/vue-components/AccountAddress.vue) */
        importVueComponent('contact-list', location.origin + '/elements/vue-components/ContactList.vue')
        importVueComponent('contact', location.origin + '/elements/vue-components/Contact.vue')
        importVueComponent('identicon', location.origin + '/elements/vue-components/Identicon.vue')
        importVueComponent('account-address', location.origin + '/elements/vue-components/AccountAddress.vue')

        // Provide Iqons to the Identicons component
        window.Iqons = Iqons

        Vue.prototype.$eventBus = new Vue({})

        this.vue = new Vue({
            el: '#vue-contact-list',
            data: {
                // Global state
                contacts: {
                    'Sarah Silverman': {
                        label: 'Sarah Silverman',
                        address: 'NQ94 VESA PKTA 9YQ0 XKGC HVH0 Q9DF VSFU STSP'
                    },
                    'Peter Dinklage': {
                        label: 'Peter Dinklage',
                        address: 'NQ36 P00L 1N6T S3QL KJY8 6FH4 5XN4 DXY0 L7C8'
                    }
                }
            },
            created() {
                this.$eventBus.$on('contact-selected', address => {
                    self._wasClosedByContactSelection = true
                    self._onContactSelected(address)
                })
            }
        })
    }

    onShow() {
        // Reset local state
        this._wasClosedByContactSelection = false;
        this.vue.$refs.contactList.reset()
    }

    onHide() {
        if (this._wasClosedByContactSelection) return
        XSendTransactionModal.show('fromContactList=yes')
    }

    _onContactSelected(address) {
        XSendTransactionModal.show('fromContactList=yes', 'recipient=' + spaceToDash(address))
    }
}
