import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  
  // Observable for online status
  online$ = this.onlineSubject.asObservable();
  
  // Observable for offline status  
  offline$ = this.online$.pipe(map(online => !online));

  constructor() {
    // Listen to browser online/offline events
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      startWith(navigator.onLine)
    ).subscribe(online => {
      this.onlineSubject.next(online);
    });
  }

  get isOnline(): boolean {
    return this.onlineSubject.value;
  }

  get isOffline(): boolean {
    return !this.isOnline;
  }
}