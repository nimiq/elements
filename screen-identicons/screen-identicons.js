import XScreen from '../x-screen/x-screen.js';
import XIdenticon from '../x-identicon/x-identicon.js';

export default class ScreenIdenticons extends XScreen {

    html() {
        return `
            <h1>Choose Your Avatar</h1>
            <h2>Your Avatar will be unique to this Account. You can not change it later.</h2>
            <x-container></x-container>
            <a secondary>Generate More</a>
            <x-backdrop class="center">
                <x-address></x-address>
                <a button>Confirm</a>
            </x-backdrop>
            `
    }

    onCreate() {
        this.$container = this.$('x-container');
        this.$address = this.$('x-address');
        this.$('[secondary]').addEventListener('click', e => this._generateIdenticons());
        this.$('[button]').addEventListener('click', e => this._onConfirm(e));
        this.$('x-backdrop').addEventListener('click', e => this._clearSelection());
    }

    _onEntry() {
        if (this._generated) return;
        return this._generateIdenticons();
    }

    _onExit(){
        this._clearIdenticons();
    }

    onApiReady(api) {
        this._api = api;
        if (this._generated || !this.visible) return;
        this._generateIdenticons();
    }

    async _generateIdenticons() {
        if (!this._api) return;
        this._clearIdenticons();
        this._generated = true;
        const promises = [];
        for (var i = 0; i < 7; i++) { promises.push(this._api.generateKeyPair()) }
        const keyPairs = await Promise.all(promises);
        keyPairs.forEach(keyPair => this._generateIdenticon(keyPair));
        setTimeout(e => this.$el.setAttribute('active', true), 100);
    }

    _generateIdenticon(keyPair) {
        const identicon = XIdenticon.createElement();
        this.$container.appendChild(identicon.$el);
        identicon.address = keyPair.address;
        identicon.addEventListener('click', e => this._onIdenticonSelected(keyPair, identicon));
    }

    _onIdenticonSelected(keyPair, identicon) {
        this._clearSelection();
        this._selectedKeyPair = keyPair;
        this._selectedIdenticon = identicon;
        this.$el.setAttribute('selected', true);
        identicon.$el.setAttribute('selected', true);
        this.$address.textContent = keyPair.address;
    }

    _clearSelection() {
        this._selectedKeyPair = null;
        if (!this._selectedIdenticon) return;
        this.$el.removeAttribute('selected');
        this._selectedIdenticon.$el.removeAttribute('selected');
    }

    _clearIdenticons() {
        this._generated = false;
        this._clearSelection()
        this.$container.innerHTML = '';
        this.$el.removeAttribute('active');
    }

    _onConfirm(e) {
        this.fire('x-keypair', this._selectedKeyPair)
        e.stopPropagation();
    }
}

// Todo: [Max] [high priority] why are the identicons just white when used in wallet but not in demo or exchange tool? 
// Todo: show loading screen while waiting for api to start
// Todo: refactor api such that addresses can be generated before full api is loaded
// Todo: [low priority] remove hack for overlay and find a general solution