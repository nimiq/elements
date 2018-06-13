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
            },
            'Robin': {
                label: 'Robin',
                address: 'NQ23 3RT4 JB6F 9CBG NQUL 9MK4 M1UP KNYT EL64'
            },
            'Marvin': {
                label: 'Marvin',
                address: 'NQ52 5PYL AP7U K1QP RHVU G6S7 3G7V G592 JPRK'
            },
            'Pascal': {
                label: 'Pascal',
                address: 'NQ52 UJFU XX2M NP22 CD4V V9JR NLKS JTMC V3LU'
            },
            'Phillip': {
                label: 'Phillip',
                address: 'NQ50 NGQY D19N 81VG 4JEE EX8E ELEE 7J09 LLL5'
            },
            'Max': {
                label: 'Max',
                address: 'NQ25 5HQ0 VVQA 8NRA F1B9 CM29 YKLJ VEFU 46L2'
            },
            'Sven': {
                label: 'Sven',
                address: 'NQ71 6T5A 7B4Q F8F0 YPUV 2PJ6 8AN4 PCTH 0K7F'
            },
            'Zsófia': {
                label: 'Zsófia',
                address: 'NQ03 7EHY 0UFJ 6S6Q 2XAG YHN6 3J22 JM6A 926G'
            },
            'Elion': {
                label: 'Elion',
                address: 'NQ52 7X80 Y7E9 ESXA C098 X08P Y5RN TPY4 C7S3'
            }
        }
    }

    switch (action.type) {
        case TypeKeys.SET_CONTACT:
            const newContact = {};
            newContact[action.contact.label] = action.contact;
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
    const contact = {
        label,
        address
    };

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
