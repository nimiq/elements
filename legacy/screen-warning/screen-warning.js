import XScreenFit from '../../x-screen/x-screen-fit.js';
export default class ScreenWarning extends XScreenFit {
    html() {
        return `
			<x-warning x-grow>
				<i icon-warning></i>
				<h2>Important Notice</h2>
				<div data-x-content>Warning!</div>
			</x-warning>
			<button>I Understand</button>
		`;
    }

    onCreate() {
        this.$('button').addEventListener('click', e => this.fire('x-warning-complete'));
    }
}