import XEducationSlide from './x-education-slide.js';
import { getString } from '../strings.js';

export default class XEducationSlideScams extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('scams_slide_title')}
            </h1>
            <div class="modal-body">
                <h3>${getString('scams_slide_subtitle')}</h3>
                <div class="has-side-image">
                    <ul>
                        <li>${getString('scams_slide_tip_1')}</li>
                        <li>${getString('scams_slide_tip_2')}</li>
                        <li>${getString('scams_slide_tip_3')}</li>
                        <li>${getString('scams_slide_tip_4')}</li>
                    </ul>
                    <div class="side-image-scams"></div>
                </div>

                <div class="button-bar">
                    <button back>${getString('scams_slide_back')}</button>
                    <button next>${getString('scams_slide_next')}</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">${getString('edu_slides_skip')}</a>
                </div> 
            </div>
        `;
    }
}
