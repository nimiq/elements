import XEducationSlide from './x-education-slide.js';
import { getString } from '../strings.js';

export default class XEducationSlideBlockchain extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('blockchain_slide_title')}
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <ul>
                        <li>${getString('blockchain_slide_list_1')}</li>
                        <li>${getString('blockchain_slide_list_2')}</li>
                        <li>${getString('blockchain_slide_list_3')}</li>
                        <li>${getString('blockchain_slide_list_4')}</li>
                        <li>${getString('blockchain_slide_list_5')}</li>
                    </ul>
                    <div class="side-image-blockchain"></div>
                </div>

                <div class="button-bar">
                    <button back>${getString('blockchain_slide_back')}</button>
                    <button next>${getString('blockchain_slide_next')}</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">${getString('edu_slides_skip')}</a>
                </div> 
            </div>
        `;
    }
}
