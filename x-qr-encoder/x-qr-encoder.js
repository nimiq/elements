class XQrEncoder extends XElement {
    set address(address) {
        this.$el.innerHTML = '';
        QrEncoder.render({
            text: address,
            radius: 0.5,
            ecLevel: 'H',
            fill: '#536DFE',
            background: 'transparent',
            size: Math.min(240, (window.innerWidth - 64))
        }, this.$el);
    }
}