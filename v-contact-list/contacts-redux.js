export const TypeKeys = {
    SET_CONTACT: 'contacts/set-contact',
    REMOVE_CONTACT: 'contacts/remove-contact'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            'Sarah Silverman': {
                label: 'Sarah Silverman',
                address: 'NQ94 VESA PKTA 9YQ0 XKGC HVH0 Q9DF VSFU STSP'
            },
            'Peter Dinklage': {
                label: 'Peter Dinklage',
                address: 'NQ36 P00L 1N6T S3QL KJY8 6FH4 5XN4 DXY0 L7C8'
            }
        }
    }

    switch (action.type) {
        case TypeKeys.SET_CONTACT:
            return Object.assign({}, state, action.contact);

        case TypeKeys.REMOVE_CONTACT:
            const newState = Object.assign({}, state);
            delete newState[action.label];

        default:
            return state
    }
}

export function setContact(label, address) {
    const contact = {};
    contact[label] = address;

    return {
        type: TypeKeys.SET_CONTACT,
        contact
    };
}

export function removeContact(label) {
    return {
        type: TypeKeys.REMOVE_CONTACT,
        label
    };
}
