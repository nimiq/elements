import XScreen from '../x-screen.js';

class Screen extends XScreen {
    _onEntry(next, prev, isBack) {
        console.log(this.__tagName, 'onEntry', next + '', prev + '', isBack);
    }

    _onExit(next, prev, isBack) {
        console.log(this.__tagName, 'onExit', next + '', prev + '', isBack);
    }
}

export default class ScreenDemo extends Screen {
    html() {
        return `
            <screen-demo-one></screen-demo-one>
            <screen-demo-two></screen-demo-two>
        `;
    }

    children() {
        return [ScreenDemoTwo, ScreenDemoOne, ];
    }

    styles() { return ['x-parent-screen'] }
}

class ScreenDemoOne extends Screen {
    html() {
        return `
            <h1>Screen Demo 1</h1>
        `;
    }

    styles() { return ['x-screen'] }
}

class ScreenDemoTwo extends Screen {
    html() {
        return `
            <screen-demo-two-two></screen-demo-two-two>
            <screen-demo-two-one></screen-demo-two-one>
        `;
    }

    children() {
        return [ScreenDemoTwoOne, ScreenDemoTwoTwo];
    }

    styles() { return ['x-parent-screen'] }
}

class ScreenDemoTwoOne extends Screen {
    html() {
        return `
            <h1>Screen Demo 2-1</h1>
        `;
    }
    get route() {
        return 'one';
    }

    styles() { return ['x-screen'] }
}


class ScreenDemoTwoTwo extends Screen {
    html() {
        return `
            <h1>Screen Demo 2-2</h1>
        `;
    }
    get route() {
        return 'two';
    }

    styles() { return ['x-screen'] }
}
