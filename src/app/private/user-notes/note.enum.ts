import {Note} from '../add-new-note/note';

export enum NoteTypes {
    REMAINDER = 'remainder',
    MUTUAL = 'mutual',
    DEBT = 'debt',
    BEER = 'beer',
    PIZZA = 'pizza',
    CINEMA = 'cinema',
    GIFT = 'gift',
    FOOD = 'food',
    PARTY = 'party',
}

export function isAutoNote(note: Note): boolean {
    return isAutoNoteType(note.type);
}

export function isAutoNoteType(type: string = ''): boolean {
    switch (type) {
        case  NoteTypes.REMAINDER:
        case  NoteTypes.MUTUAL:
        case  NoteTypes.DEBT:
            return true;
    }
    return false;
}

