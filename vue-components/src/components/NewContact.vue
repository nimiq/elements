<template>
    <div class="new-contact">
        <Identicon :address="workingAddress"/>

        <div class="info">
            <input type="text" class="label" placeholder="Label" ref="labelInput" v-model="workingLabel">
            <input type="text" class="address-input" placeholder="Address" v-model="workingAddress">

            <div class="bottom">
                <button class="small secondary save" @click.stop="save" :disabled="!isInputValid" title="Save changes">
                    <i class="material-icons">check</i>
                </button>
                <button class="small secondary" @click.stop="abort" title="Abort">
                    <i class="material-icons">close</i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import Identicon from './Identicon.vue'
import Address from './Address.vue'

import ValidationUtils from '../../../../libraries/secure-utils/validation-utils/validation-utils.js'

export default {
    name: 'NewContact',
    props: ['setContactAction', 'abortAction'],
    data: function() {
        return {
            // Local state
            workingLabel: '',
            workingAddress: ''
        }
    },
    computed: {
        isInputValid() {
            return this.workingLabel && ValidationUtils.isValidAddress(this.workingAddress)
        }
    },
    methods: {
        edit() {
            this.workingLabel = ''
            this.workingAddress = ''
            this.$refs.labelInput.focus()
        },
        save() {
            const address = this.workingAddress.replace(/ /g, '').replace(/.{4}/g, '$& ').trim()

            // Update or set contact info
            this.setContactAction(this.workingLabel, address)

            this.edit()
        },
        abort() {
            this.abortAction()
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

    .new-contact {
        display: flex;
        max-width: 490px;
        padding: 8px 16px;
        /* border-bottom: 1px solid rgba(0, 0, 0, 0.1); */
        cursor: pointer;
        position: relative;
    }

    .new-contact .identicon {
        width: 80px;
        min-width: 50px;
        height: 71px;
    }

    .new-contact .info {
        text-align: left;
        width: 100%;
        padding-left: 16px;
        max-width: calc(100% - 88px);
    }

    .new-contact .label {
        display: block;
        font-weight: bold;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .new-contact input,
    .new-contact input::placeholder {
        text-align: left;
    }

    .new-contact input.address-input {
        font-size: 14px;
    }

    .new-contact .bottom {
        text-align: right;
        margin-top: 4px;
    }

    .new-contact .bottom button {
        padding: 0 7px;
        min-height: 0;
        height: 29px;
        width: 29px;
        margin-bottom: 0;
        margin-left: 4px;
        background: white;
        opacity: 0.75;
    }

    .new-contact .bottom button:hover {
        opacity: 1;
    }

    .new-contact .bottom button .material-icons {
        font-size: 21px;
        position: relative;
        left: -4px;
        top: -6px;
    }

    @media (max-width: 480px) {
        .new-contact {
            padding: 8px 0;
        }
    }
</style>
