<div class="contact-list">
    <input type="text" placeholder="Search..." v-model="searchTerm" ref="input">
    <div class="list">
        <contact v-for="contact in filteredContacts" :contact="contact" :key="contact.label"></contact>
    </div>
</div>

<script>
// import Contact from './Contact.vue'

window['contact-list'] = {
    name: 'contact-list',
    props: ['contacts', 'actions'],
    data: function() {
        return {
            // Local state
            searchTerm: '',
            isCreatingNewContact: false,
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
            this.searchTerm = ''
            this.$refs.input.focus()
        }
    }
}
</script>

<style>
    .contact-list input {
        width: 100%;
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
