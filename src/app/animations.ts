import {animate, animateChild, group, query, style, transition, trigger} from "@angular/animations";

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* => AddNewNote', [
      style({position: 'relative'}),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({left: '100%'})
      ]),
      group([
        query(':enter', [
          animate('300ms ease-out', style({left: '0%'}))
        ])
      ]),
    ]),

    transition('AddNewNote => *', [
      style({position: 'relative'}),
      query(':leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          height: '100vh',
          zIndex: 100
        })
      ]),
      group([
        query(':leave', [
          animate('300ms ease-out', style({left: '100%'}))
        ])
      ]),
    ]),

    transition('UserNotes => Main', [
      style({position: 'relative'}),
      query(':leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          height: '100vh',
          zIndex: 100
        })
      ]),
      query(':leave', [
        animate('300ms ease-out', style({transform: 'translate(0 , 100%)'})),
      ]),
    ]),
    transition('Main => UserNotes', [
      style({position: 'relative'}),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100vh',
        })
      ]),
      query(':enter', [
        style({
          transform: 'translate(0 , 50%)',
        })
      ]),
      query(':enter', [
        animate('300ms ease-out', style({transform: 'translate(0 , 0)'})),
      ]),
    ]),
  ]);
