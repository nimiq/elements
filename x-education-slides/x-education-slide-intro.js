import XEducationSlide from './x-education-slide.js';
import XEducationSlides from './x-education-slides.js';
import XWelcomeModal from '/apps/safe/src/elements/x-welcome-modal.js';
import { getString } from '../strings.js';

export default class XEducationSlideIntro extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('edu_slide_intro_title')}
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div>
                        <div class="spacing-bottom action-text-container">
                            ${getString('edu_slide_intro_you_can_soon')}
                        </div>
                        <div class="warning">
                            <p>${getString('intro_slide_please_read')}</p>
                            <p>${getString('intro_slide_funds_may_be_stolen')}</p>
                        </div>
                        <div class="warning">
                            ${getString('intro_slide_funds_unrecoverable')}
                        </div>
                    </div>
                    <div class="side-image-intro"></div>
                </div>

                <div class="button-bar">
                    <button back>${getString('back')}</button>
                    <button next>${getString('intro_slide_next')}</button>
                </div>
                
                <div class="spacing-top center">
                    <a secondary class="skip">${getString('edu_slides_skip')}</a>
                </div> 
            </div>
        `;
    }

    onShow() {
        XEducationSlides._slides = XEducationSlides.allSlides;

        super.onShow();

        let actionText = '';
        switch (XEducationSlides.action) {
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
                actionText = getString('intro_slide_intro_action_import_ledger');
                break;

            case 'upgrade':
                actionText = getString('intro_slide_intro_action_upgrade');
                break;

            case 'none':
                this.$('.action-text-container').classList.add('display-none');
                break;

            default:
                this.onBack();
        }

        if (actionText !== '') {
            this.$('.action-text').innerText = actionText;
            this.$('.action-text-container').classList.remove('display-none');
        }
    }

    onBack() {
        XWelcomeModal.show();
    }
}

// Todo: Fix import situation (import from apps/safe)
