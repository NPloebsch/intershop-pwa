import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';

import { mapErrorToAction, mapToPayload } from 'ish-core/utils/operators';

import { RequisitionsService } from '../../services/requisitions/requisitions.service';

import { loadRequisitions, loadRequisitionsFail, loadRequisitionsSuccess } from './requisitions.actions';

@Injectable()
export class RequisitionsEffects {
  constructor(private actions$: Actions, private requisitionsService: RequisitionsService) {}

  loadRequisitions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRequisitions),
      mapToPayload(),
      switchMap(({ view, status }) =>
        this.requisitionsService.getRequisitions(view, status).pipe(
          map(requisitions => loadRequisitionsSuccess({ requisitions })),
          mapErrorToAction(loadRequisitionsFail)
        )
      )
    )
  );
}