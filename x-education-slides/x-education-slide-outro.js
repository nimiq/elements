import XEducationSlide from './x-education-slide.js';
import XEducationSlides from './x-education-slides.js';
import { getString } from '../strings.js';

export default class XEducationSlideOutro extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('outro_slide_title')}
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div>
                        ${getString('outro_slide_you_are_prepared')}
                        <span class="keyguard-popup-info">
                            ${getString('outro_slide_keyguard')}
                        </span>
                    </div>
                </div>

                <div class="button-bar">
                    <button next>${getString('outro_slide_keyguard_button')}</button>
                </div>
            </div>
        `;
    }

    onShow() {
        super.onShow();

        let actionText;
        switch (XEducationSlides.action) {
            // we use the same strings as the intro does when descibing what the user is prepared to do
            case 'create':
                actionText = getString('intro_slide_intro_action_create');
                break;

            case 'import-words':
                actionText = getString('intro_slide_intro_action_import_words');
                break;

            case 'import-file':
                actionText = getString('intro_slide_intro_action_import_file');
                break;

            case 'import-ledger':
                this.$nextButton.textContent = getString('outro_slide_ledger_button');
                this.$('.keyguard-popup-info').style.display = 'none';
                actionText = getString('intro_slide_intro_action_import_ledger');
                break;

            case 'upgrade':
                actionText = getString('intro_slide_intro_action_upgrade');
                break;
            
            // if we don't have a case for the action, then they will just see that they are prepared to continue
        }
        this.$('.action-text').innerText = actionText;
    }

    _onArrowNavigation(e) {
        if (e.keyCode === 37) {
            // left arrow
            return; // don't allow going back
        }
        super._onArrowNavigation(e);
    }

}
