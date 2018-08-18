import XEducationSlide from './x-education-slide.js';
import { getString } from '../strings.js';

export default class XEducationSlidePointOfNimiq extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('point_of_nimiq_slide_title')}
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div class="side-image-point-of-nimiq"></div>
                    <div>
                        <ul>
                            <li>${getString('point_of_nimiq_slide_reason_list_1')}</li>
                            <li>${getString('point_of_nimiq_slide_reason_list_2')}</li>
                            <li>${getString('point_of_nimiq_slide_reason_list_3')}</li>
                            <li>${getString('point_of_nimiq_slide_reason_list_4')}</li>

                        </ul>
                    </div>
                </div>

                <div class="button-bar">
                    <button back>${getString('point_of_nimiq_slide_back')}</button>
                    <button next>${getString('point_of_nimiq_slide_next')}</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">${getString('edu_slides_skip')}</a>
                </div> 
            </div>
        `;
    }
}
