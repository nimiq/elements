import XEducationSlide from './x-education-slide.js';
import XEducationSlides from './x-education-slides.js';
import { getString } from '../strings.js';

export default class XEducationSlideNotABank extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('not_bank_slide_title')}
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div class="side-image-not-a-bank"></div>
                    <div>
                        <h3>${getString('not_bank_slide_subtitle')}</h3>
                        <ul>
                            <li>${getString('not_bank_slide_list_1')}</li>
                            <li>${getString('not_bank_slide_list_2')}</li>
                            <li>${getString('not_bank_slide_list_3')}</li>
                            <li>${getString('not_bank_slide_list_4')}</li>
                            <li>${getString('not_bank_slide_list_5')}</li>
                        </ul>
                    </div>
                </div>

                <div class="button-bar">
                    <button back>${getString('not_bank_slide_back')}</button>
                    <button next>${getString('not_bank_slide_next')}</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">${getString('edu_slides_skip')}</a>
                </div> 
            </div>
        `;
    }

    onShow() {
        super.onShow();

        if (XEducationSlides.allSlides.length !== XEducationSlides.slides.length) {
            // user clicked on "show information slides", so this is the first slide
            const backButton = this.$('button[back]');
            if (backButton) {
                this.$('.button-bar').removeChild(backButton);
            }
        }
    }
}
