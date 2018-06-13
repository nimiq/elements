<template>
    <div class="contact" @click="select">
        <Identicon :address="contact.address"/>
        <div class="info">
            <span class="label">{{ contact.label }}</span>
            <Address :address="contact.address"/>
            <div class="bottom" v-if="showOptions">
                <button class="small secondary" @click.stop="editMethod(contact.label, contact.address)" title="Edit contact"><i class="material-icons">edit</i></button>
                <button class="small secondary remove" @click.stop="remove" title="Delete contact"><i class="material-icons">delete</i></button>
            </div>
        </div>
    </div>
</template>

<script>
import Identicon from './Identicon.vue'
import Address from './Address.vue'

export default {
    name: 'Contact',
    props: ['contact', 'showOptions', 'editMethod', 'removeAction'],
    methods: {
        select() {
            this.$eventBus.$emit('contact-selected', this.contact.address)
        },
        remove() {
            const confirmRemove = confirm(`Really delete this contact: ${this.contact.label}?`)
            confirmRemove && this.removeAction(this.contact.label)
        }
    },
    components: {
        Identicon,
        Address
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

    .contact .address {
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
        padding: 0;
        min-width: auto;
        font-weight: normal;
        opacity: 0.6;
    }

    .contact .bottom {
        text-align: right;
        margin-top: 4px;
    }

    .contact .bottom button {
        padding: 0 7px;
        min-height: 0;
        height: 29px;
        width: 29px;
        margin-bottom: 0;
        background: white;
        opacity: 0.75;
    }

    .contact .bottom button:hover {
        opacity: 1;
    }

    .contact .bottom button .material-icons {
        font-size: 21px;
        position: relative;
        left: -4px;
        top: -6px;
    }

    .contact .bottom button.remove {
        border-color: var(--error-color);
    }

    .contact .bottom button.remove .material-icons {
        color: var(--error-color);
    }

    @media (max-width: 480px) {
        .contact {
            padding: 8px 0;
        }
    }
</style>
