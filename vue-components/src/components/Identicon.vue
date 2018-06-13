<template>
    <div class="identicon">
        <img :src="dataUrl">
    </div>
</template>

<script>
import Iqons from '../../../../libraries/iqons/src/js/iqons.js'
if (!location.host.includes('localhost')) Iqons.svgPath = '/iqons.min.svg'

export default {
    name: 'Identicon',
    props: ['address'],
    asyncComputed: {
        dataUrl: {
            get() {
                return Iqons.toDataUrl(this.address)
            },
            default() {
                return Iqons.placeholderToDataUrl()
            }
        }
    }
}
</script>

<style>
    .identicon {
        width: 80px;
        min-width: 40px;
    }

    .identicon img {
        width: 100%;
        height: 100%;
    }
</style>
