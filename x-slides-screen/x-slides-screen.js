import XScreen from '../x-screen/x-screen.js';
import XSlideIndicator from '../x-slide-indicator/x-slide-indicator.js';

export default class XSlidesScreen extends XScreen {

    onCreate() {
        this.$slideIndicator = XSlideIndicator.createElement();
        this.$('x-slides').insertAdjacentElement('afterend', this.$slideIndicator.$el);
        this.$slideIndicator.init(this._filteredChildScreens.length);
        this.$slideIndicator.show(0);
    }

    /** @param {XState} nextState */
    async _onUpdateSlideIndicator(nextState) {
        if (this._childScreenFilter.includes(nextState.child._id)) {
            this.$slideIndicator.hide();
        }
        else {
            this.$slideIndicator.show(this._getSlideIndex(nextState.child._id));
        }
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

    get _filteredChildScreens() {
        return Array.from(this._childScreens.entries())
            .filter(x => !this._childScreenFilter.includes(x[0]));
    }

    /** @param {string} childId
     *  @returns {number}
     */
    _getSlideIndex(childId) {
        return this._filteredChildScreens.findIndex(x => x[0] === childId);

    }
}