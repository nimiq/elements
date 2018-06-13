<template>
    <div class="contact-list">
        <input v-if="!isEditingContact" type="text" placeholder="Search..." v-model="searchTerm" ref="input">
        <form v-if="isEditingContact" @submit.prevent="submitEditContact">
            <i class="close material-icons" @click="endEditContact">close</i>
            <input type="text" v-model="editingLabel" placeholder="Name">
            <input type="text" v-model="editingAddress" placeholder="Address">
            <button>Set</button>
        </form>
        <div class="list">
            <Contact
                v-for="contact in filteredContacts"
                :contact="contact"
                :show-options="isEditing"
                :remove-action="actions.removeContact"
                :edit-method="startEditContact"
                :key="contact.label"
            />
        </div>
    </div>
</template>

<script>
import Contact from './Contact.vue'
import ValidationUtils from '../../../../libraries/secure-utils/validation-utils/validation-utils.js'

export default {
    name: 'ContactList',
    props: ['contacts', 'actions'],
    data: function() {
        return {
            // Local state
            searchTerm: '',
            isEditing: false,
            isEditingContact: false,
            editingLabel: '',
            editingAddress: ''
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
            this.isEditing = false
            this.isEditingContact = false
            this.$refs.input.focus()
        },
        toggleManaging() {
            this.isEditing = !this.isEditing
        },
        startEditContact(label, address) {
            this.editingLabel = label || ''
            this.editingAddress = address || ''
            this.isEditingContact = true
        },
        submitEditContact() {
            // Validate label
            if (!this.editingLabel) {
                // TODO Set user error message
                console.error("Label is required")
                return
            }

            // Validate address
            if (!ValidationUtils.isValidAddress(this.editingAddress)) {
                // TODO Set user error message
                console.error("Address not valid")
                return
            }

            // Format address
            const address = this.editingAddress.replace(/ /g, '').replace(/.{4}/g, '$& ').trim()

            this.actions.setContact(this.editingLabel, address)

            // Reset form
            this.startEditContact()
        },
        endEditContact() {
            this.isEditingContact = false
        }
    },
    components: {
        Contact
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
