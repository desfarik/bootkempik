import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, any> = new Map();

  constructor() {
  }

  public setValue(cacheName: string, value: any): void {
    this.cache.set(cacheName, value);
  }

  public getValue(cacheName: string): any {
    return this.cache.get(cacheName);
  }

  public evict(cacheName: string): void {
    this.cache.delete(cacheName);
  }

  public evictAll(): void {
    console.log('evict all cache');
    this.cache = new Map();
  }
}
