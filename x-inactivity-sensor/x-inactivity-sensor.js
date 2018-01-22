import XElement from '/x-element/x-element.js';

export default class XInactivitySensor extends XElement {

    static get NO_INPUT_TIME() { return 3000 } // in seconds
    static get TAB_INVISIBLE_TIME() { return 1000 } // in seconds

    onCreate() {
        this._inactive = this._inactive.bind(this);
        document.addEventListener('visibilitychange', e => this._visibilityChange());
        window.addEventListener('popstate', () => this.reset());
        window.addEventListener('touchstart', () => this.reset());
        window.addEventListener('mousemove', () => this.reset());
        window.addEventListener('input', () => this.reset());
        window.addEventListener('change', () => this.reset());
    }

    _visibilityChange() {
        if (document.hidden) {
            this.reset(XInactivitySensor.TAB_INVISIBLE_TIME);
        } else {
            this.reset();
        }
    }

    reset(seconds) {
        clearTimeout(this._timeout);
        seconds = seconds || XInactivitySensor.NO_INPUT_TIME;
        this._timeout = setTimeout(this._inactive, seconds * 1000);
    }

    _inactive() {
        this.fire('x-inactive');
    }
}

// Todo: compute time diff on visibility change because timers might stop when tab inactive
// Todo: check deviceorientation and devicemotion events for mobile
