import XScreen from '../x-screen/x-screen.js';
import XSlideIndicator from '../x-slide-indicator/x-slide-indicator.js';

export default class XSlidesScreen extends XScreen {

    onCreate() {
        this.$slideIndicator = XSlideIndicator.createElement();
        this.$('x-slides').insertAdjacentElement('afterend', this.$slideIndicator.$el);

        this._filteredChildScreens = XSlidesScreen._prepareChildScreens('', this._childScreens, this._childScreenFilter)

        this.addEventListener('x-entry', e => this._update(e.detail));

        this.$slideIndicator.init(this._filteredChildScreens.length);
        this.$slideIndicator.show(0);
    }

    /** @param {XState} nextState */
    async _update(childPath) {
        const slideIndex = this._getSlideIndex(childPath);
        if (slideIndex > 0) this.$slideIndicator.show(slideIndex);
    }

    /** ChildScreens with those ids will not count for indicator
     * @returns {string[]}
     */
    get _childScreenFilter() {
        return ['success', 'error', 'loading'].concat(this.__childScreenFilter);
    }

    /** Overwrite for additionally filtered childScreens
     * @returns {string[]}
     */
    get __childScreenFilter() {
        return [];
    }

    /** @returns {(XScreen & {path: string})[]} */
    static _prepareChildScreens(path, childScreens, filter) {
        const filteredChildScreens = Array.from(childScreens.entries())
            .filter(x => !filter.includes(x[0]));

        const simpleChildScreens = filteredChildScreens
            .filter(x => !x[1]._childScreens);

        const metaChildScreens = filteredChildScreens
            .filter(x => x[1]._childScreens);

        const preparedChildScreens = simpleChildScreens.map(x => ({
            ...x,
            path: path + x[0]
        }));

        const recursiveChildScreens = metaChildScreens.map(x =>
            XSlidesScreen._prepareChildScreens(x[0] + '/', x[1]._childScreens, filter)
        ).reduce((a,b) => a.concat(b), [])

        return preparedChildScreens.concat(recursiveChildScreens);
    }

    /** @param {string} childId
     *  @returns {number}
     */
    _getSlideIndex(childPath) {
        return this._filteredChildScreens.findIndex(x => x.path === childPath);
    }
}
