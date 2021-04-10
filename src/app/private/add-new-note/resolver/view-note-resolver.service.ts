import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Note} from '../note';
import {CacheService} from '../../../service/cache.service';
import {FirebaseService} from '../../../service/firebase.service';

@Injectable({
    providedIn: 'root'
})
export class ViewNoteResolver implements Resolve<Promise<Note>> {

    constructor(private cacheService: CacheService, private firebase: FirebaseService) {
    }

    public async resolve(route: ActivatedRouteSnapshot): Promise<Note> {
        const noteId = route.queryParams.noteId;
        if (noteId) {
            const cachedNote = this.cacheService.getValue(noteId) as Note;
            return cachedNote || await this.firebase.getNoteById(noteId);
        }
        return null;
    }
}
