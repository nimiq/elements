import XScreenFit from '../x-screen/x-screen-fit.js';
import XAddressInput from '../x-address-scanner/x-address-scanner.js';
import XAddressScanner from '../x-address-input/x-address-input.js';

export default class ScreenRecipientScanner extends XScreenFit {
    html() {
        return `
            <x-address-scanner></x-address-scanner>
            <x-header>
                <x-address-input></x-address-input>
            </x-header>`;
    }

    children() {
        return [XAddressScanner, XAddressInput];
    }

    get route() { return 'scanner' }

    set active(active) {
        if (active) 
            this.startScanner();
        else 
            this.$addressScanner.stop();
    }

    _onBeforeEntry(){
        this.$addressScanner.start();
    }

    startScanner() {
        this.$addressScanner.start()
            .then(e => this.fire('x-address-scanner-success'))
            .catch(e => this.fire('x-address-scanner-error'));
    }
}
