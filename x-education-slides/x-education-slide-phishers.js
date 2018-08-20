import XEducationSlide from './x-education-slide.js';
import { getString } from '../strings.js';

export default class XEducationSlidePhishers extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('phishers_slide_title')}
            </h1>
            <div class="modal-body">
                <h3>${getString('phishers_slide_subtitle')}</h3>
                <div class="has-side-image">
                    <ul>
                        <li>${getString('phishers_slide_tip_list_1')}</li>
                        <li>${getString('phishers_slide_tip_list_2')}</li>
                        <li>${getString('phishers_slide_tip_list_3')}</li>
                        <li>${getString('phishers_slide_tip_list_4')}</li>
                    </ul>
                    <div class="side-image-phishers"></div>
                </div>

                <div class="button-bar">
                    <button back>${getString('phishers_slide_back')}</button>
                    <button next>${getString('phishers_slide_next')}</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">${getString('edu_slides_skip')}</a>
                </div> 
            </div>
        `;
    }
}
