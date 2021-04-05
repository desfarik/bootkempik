import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Note} from '../note';
import {CacheService} from '../../../service/cache.service';

@Injectable({
  providedIn: 'root'
})
export class ViewNoteResolver implements Resolve<Note> {

  constructor(private cacheService: CacheService) {
  }

  public resolve(route: ActivatedRouteSnapshot): Note {
    const noteId = route.queryParams.noteId;
    if (noteId) {
      console.log(this.cacheService.getValue(noteId));
      return this.cacheService.getValue(noteId) as Note;
    }
    return null;
  }
}
