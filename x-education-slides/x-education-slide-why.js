import XEducationSlide from './x-education-slide.js';
import { getString } from '../strings.js';

export default class XEducationSlideWhy extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                ${getString('why_slide_title')}
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div class="side-image-why"></div>
                    <div>
                        <h3>${getString('why_slide_subtitle')}</h3>
                        <ul class="important">
                            <li>${getString('why_slide_list_we_cant_list_1')}</li>
                            <li>${getString('why_slide_list_we_cant_list_2')}</li>
                            <li>${getString('why_slide_list_we_cant_list_3')}</li>
                            <li>${getString('why_slide_list_we_cant_list_4')}</li>
                            <li>${getString('why_slide_list_we_cant_list_5')}</li>
                        </ul>

                        <h3>${getString('why_slide_you_responsible_for_security')}</h3>
                        <ul>
                            <li>${getString('why_slide_warning_list_1')}</li>
                            <li>${getString('why_slide_warning_list_2')}</li>
                            <li>${getString('why_slide_warning_list_3')}</li>
                        </ul>
                    </div>
                </div>

                <div class="button-bar">
                    <button back>What is a Blockchain?</button>
                    <button next>So what's the point?</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">Skip AT YOUR OWN RISK</a>
                </div> 
            </div>
        `;
    }
}
