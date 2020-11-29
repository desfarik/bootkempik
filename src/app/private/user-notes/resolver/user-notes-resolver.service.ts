import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {Note} from "../../add-new-note/note";
import {FirebaseService} from "../../../service/firebase.service";
import {AuthorizationService} from "../../../service/authorization.service";
import {CacheService} from "../../../service/cache.service";

@Injectable({
  providedIn: 'root'
})
export class UserNotesResolver implements Resolve<Note[]> {

  constructor(private firebaseService: FirebaseService, private authorizationService: AuthorizationService,
              private cacheService: CacheService) {
  }

  public async resolve(route: ActivatedRouteSnapshot): Promise<Note[]> {
    const currentUserId = Number(this.authorizationService.getUserId());
    const cacheName = route.queryParams["userId"] + currentUserId;
    const fromCache = this.cacheService.getValue(cacheName);
    if (fromCache) {
      return fromCache;
    } else {
      const userNotes = await this.firebaseService.getUserNotes(currentUserId, Number(route.queryParams["userId"]));
      this.cacheService.setValue(cacheName, userNotes);
      return userNotes;
    }
  }
}
