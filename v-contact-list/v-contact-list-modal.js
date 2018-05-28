import XElement from '/libraries/x-element/x-element.js'
import MixinModal from '/elements/mixin-modal/mixin-modal.js'
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js'
import { upgradeCanceled } from '/elements/x-accounts/accounts-redux.js'
import { importVueComponent } from '/elements/vue-components/import-vue-component.js'
import Iqons from '/libraries/iqons/dist/iqons.min.js'

export default class VContactListModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Contacts</h2>
            </div>
            <div class="modal-body" id="vue-contact-list">
                <input type="text" placeholder="Search..." v-model="searchTerm">
                <div class="contact-list">
                    <contact v-for="contact in filteredContacts" :contact="contact" :key="contact.label"></contact>
                </div>
            </div>
        `
    }

    onCreate() {
        super.onCreate()
        const self = this

        // Load dependency components
        /* asset(/elements/vue-components/Contact.vue) */
        /* asset(/elements/vue-components/Identicon.vue) */
        /* asset(/elements/vue-components/Account-Address.vue) */
        importVueComponent('contact', location.origin + '/elements/vue-components/Contact.vue')
        importVueComponent('identicon', location.origin + '/elements/vue-components/Identicon.vue')
        importVueComponent('account-address', location.origin + '/elements/vue-components/Account-Address.vue')

        // Provide Iqons to the Identicons component
        window.Iqons = Iqons

        this.app = new Vue({
            el: '#vue-contact-list',
            data: {
                // Local state
                searchTerm: '',
                isCreatingNewContact: false,
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
            computed: {
                filteredContacts() {
                    const searchTerm = this.searchTerm.trim().toLowerCase()

                    if (!searchTerm) return Object.assign({}, this.contacts)

                    var result = {}
                    for (var label of Object.keys(this.contacts))
                        if (label.toLowerCase().includes(searchTerm))
                            result[label] = this.contacts[label]
                    return result
                }
            }
        })
    }

    onShow() {
        // Reset local state
    }
}
