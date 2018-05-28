<div class="identicon">
    <img :src="dataUrl">
</div>

<script>
// import Iqons from '/libraries/iqons/dist/iqons.min.js'
// Iqons.svgPath = '/iqons.min.svg'

window['identicon'] = {
    name: 'identicon',
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
