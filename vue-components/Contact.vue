<div class="contact" @click="selected">
    <identicon :address="contact.address"></identicon>
    <div class="info">
        <span class="label">{{ contact.label }}</span>
        <account-address :address="contact.address"></account-address>
    </div>
</div>

<script>
// import Identicon from './Identicon.vue'
// import Address from './Address.vue'

window['contact'] = {
    name: 'contact',
    props: ['contact'],
    methods: {
        selected() {
            this.$eventBus.$emit('contact-selected', this.contact.address)
        }
    }
}
</script>

<style>
    @import '/libraries/nimiq-style/material-icons/material-icons.css';

    .contact {
        display: flex;
        max-width: 490px;
        padding: 8px 16px;
        /* border-bottom: 1px solid rgba(0, 0, 0, 0.1); */
        cursor: pointer;
        position: relative;
    }

    .contact .identicon {
        width: 80px;
        min-width: 50px;
        height: 71px;
    }

    .contact .info {
        text-align: left;
        width: 100%;
        padding-left: 16px;
        max-width: calc(100% - 88px);
    }

    .contact .label {
        display: block;
        font-weight: bold;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .contact .account-address {
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
        padding: 0;
        min-width: auto;
        font-weight: normal;
        opacity: 0.6;
    }

    @media (max-width: 480px) {
        .contact {
            padding: 8px 0;
        }
    }
</style>
