export const TypeKeys = {
    SET_CONTACT: 'contacts/set-contact',
    REMOVE_CONTACT: 'contacts/remove-contact'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            // TODO Remove example contacts
            'Leia Organa': {
                label: 'Leia Organa',
                address: 'NQ94 VESA PKTA 9YQ0 XKGC HVH0 Q9DF VSFU STSP'
            },
            'Luke Skywalker': {
                label: 'Luke Skywalker',
                address: 'NQ36 P00L 1N6T S3QL KJY8 6FH4 5XN4 DXY0 L7C8'
            }
        }
    }

    switch (action.type) {
        case TypeKeys.SET_CONTACT:
            const newContact = {};
            newContact[action.label] = {
                label: action.label,
                address: action.address
            };
            const unorderedContacts = Object.assign({}, state, newContact);
            const orderedContacts = {};
            Object.keys(unorderedContacts).sort().forEach(function(key) {
                orderedContacts[key] = unorderedContacts[key];
            });
            return orderedContacts;

        case TypeKeys.REMOVE_CONTACT:
            const newState = Object.assign({}, state);
            delete newState[action.label];
            return newState;

        default:
            return state
    }
}

export function setContact(label, address) {
    return {
        type: TypeKeys.SET_CONTACT,
        label,
        address
    };
}

export function removeContact(label) {
    return {
        type: TypeKeys.REMOVE_CONTACT,
        label
    };
}
