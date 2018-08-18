import XEducationSlide from './x-education-slide.js';
import { getString } from '../strings.js';

export default class XEducationSlideLoss extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('loss_slide_title')}
            </h1>
            <div class="modal-body">
                <h3>${getString('loss_slide_subtitle')}</h3>
                <div class="has-side-image">
                    <ul>
                        <li>${getString('loss_slide_tip_1')}</li>
                        <li>${getString('loss_slide_tip_2')}</li>
                        <li>${getString('loss_slide_tip_3')}</li>
                    </ul>
                    <div class="side-image-loss"></div>
                </div>

                <div class="button-bar">
                    <button back>${getString('loss_slide_back')}</button>
                    <button next>${getString('loss_slide_next')}</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">${getString('edu_slides_skip')}</a>
                </div> 
            </div>
        `;
    }
}
