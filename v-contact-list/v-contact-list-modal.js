import XElement from '/libraries/x-element/x-element.js'
import MixinModal from '/elements/mixin-modal/mixin-modal.js'
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js'
import { bindActionCreators } from '/libraries/redux/src/index.js';
import { importVueComponent } from '/elements/vue-components/import-vue-component.js'
import Iqons from '/libraries/iqons/dist/iqons.min.js'
import XSendTransactionModal from '/elements/x-send-transaction/x-send-transaction-modal.js'
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js'
import Provider from '/elements/vue-components/vuejs-redux.js'
import { setContact, removeContact } from './contacts-redux.js'

export default class VContactListModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Contacts</h2>
            </div>
            <div class="modal-body" id="vue-contact-list">
                <redux-provider :map-state-to-props="mapStateToProps" :map-dispatch-to-props="mapDispatchToProps" :store="store">
                    <template slot-scope="{contacts, actions}">
                        <contact-list :contacts="contacts" :actions="actions" ref="contactList"></contact-list>
                    </template>
                </redux-provider>
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

        // Set up async waiting, to make sure the components are loaded when we need them in onShow()
        this._isLoadingComponents = false
        this._awaitComponents = new Promise(res => this._awaitComponentsResolver = res)
        importVueComponent.track((isLoading) => {
            if (this._isLoadingComponents && !isLoading) this._awaitComponentsResolver()
            this._isLoadingComponents = isLoading
        })

        // Provide Iqons to the Identicons component
        window.Iqons = Iqons

        Vue.prototype.$eventBus = new Vue({})

        this.vue = new Vue({
            el: '#vue-contact-list',
            data: {
                store: MixinRedux.store
            },
            created() {
                this.$eventBus.$on('contact-selected', address => {
                    self._wasClosedByContactSelection = true
                    self._onContactSelected(address)
                })
            },
            components: {
                'redux-provider': Provider
            },
            methods: {
                mapStateToProps(state) {
                    return {
                        contacts: state.contacts
                    }
                },

                mapDispatchToProps(dispatch) {
                    return {
                        actions: bindActionCreators({ setContact, removeContact }, dispatch)
                    }
                }
            }
        })
    }

    async onShow() {
        // Reset local state
        this._wasClosedByContactSelection = false
        await this._awaitComponents
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
