import {Note} from '../add-new-note/note';

export enum NoteType {
    REMAINDER = 'remainder',
    MUTUAL = 'mutual',
    DEBT = 'debt',
    BEER = 'beer',
    TAXI = 'taxi',
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
        case  NoteType.REMAINDER:
        case  NoteType.MUTUAL:
        case  NoteType.DEBT:
            return true;
    }
    return false;
}

