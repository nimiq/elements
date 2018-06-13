<template>
    <div class="contact-list">
        <input type="text" placeholder="Search..." v-model="searchTerm" ref="search">
        <div class="list">
            <NewContact
                v-if="isAddingNewContact"
                :set-contact-action="actions.setContact"
                :abort-action="abortNewContact"
                ref="newContact"
            />
            <Contact
                v-for="contact in filteredContacts"
                :contact="contact"
                :show-options="isManaging"
                :set-contact-action="actions.setContact"
                :remove-contact-action="actions.removeContact"
                :key="contact.label"
            />
        </div>
    </div>
</template>

<script>
import Contact from './Contact.vue'
import NewContact from './NewContact.vue'

export default {
    name: 'ContactList',
    props: ['contacts', 'actions'],
    data: function() {
        return {
            // Local state
            searchTerm: '',
            isManaging: false,
            isAddingNewContact: false
        }
    },
    computed: {
        filteredContacts() {
            const searchTerm = this.searchTerm.trim().toLowerCase()

            if (!searchTerm) return Object.assign({}, this.contacts)

            var result = {}
            for (var label of Object.keys(this.contacts)) {
                if (label.toLowerCase().includes(searchTerm)) {
                    result[label] = this.contacts[label]
                }
            }

            return result
        }
    },
    methods: {
        reset() {
            this.searchTerm = '',
            this.isManaging = false
            this.isAddingNewContact = false
            this.$refs.search.focus()
        },
        toggleManaging() {
            this.isManaging = !this.isManaging
        },
        addNewContact() {
            this.isAddingNewContact = true
            Vue.nextTick(() => this.$refs.newContact.edit())
        },
        abortNewContact() {
            this.isAddingNewContact = false
        }
    },
    components: {
        Contact,
        NewContact
    }
}
</script>

<style>
    .contact-list input {
        width: 100%;
    }

    .contact-list form .close {
        float: right;
    }

    .contact-list .list {
        margin-top: 16px;
    }

    .contact-list .contact {
        padding: 8px;
    }

    .contact-list .contact:hover {
        background-color: rgba(0, 0, 0, 0.075);
    }
</style>
