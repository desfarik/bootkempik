import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../../../../service/model/user';
import {isAutoNote, isAutoNoteType} from '../../../user-notes/note.enum';

const LINE_LENGTH = 30;

@Pipe({
    name: 'noteDescription'
})
export class NoteDescriptionPipe implements PipeTransform {

    transform(description: string, noteType: string, allPersons: User[]): string {
        if (!isAutoNoteType(noteType)) {
            return description;
        }
        const html = this.changeUsers(description, allPersons).split('\n')
            .map(line => this.wrapToTr(line)).join('');
        return `<table>${html}</table>`;
    }

    private wrapToTr(line: string): string {
        const [title, sum] = line.split('%');
        if (sum) {
            return `<tr><td>${title}</td><td>${sum}</td></tr>`;
        }
        return `<tr><td colspan="2">${title}</td></tr>`;
    }

    private changeUsers(description: string, allUsers: User[]): string {
        return description.replace(/\$userId(\d+)/g, (substring) => {
            const userId = Number(substring.slice(7));
            const user = allUsers.find((person) => person.id === userId);
            return user ? `${user.first_name} ${user.last_name}` : 'Неизвестный';
        });
    }

}
