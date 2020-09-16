import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CookiesGuard } from 'ish-core/guards/cookies.guard';
import { CookiesModalComponent } from 'ish-shared/components/cookies/cookies-modal/cookies-modal.component';
import { SharedModule } from 'ish-shared/shared.module';

const cookiesPageRoutes: Routes = [
  {
    path: '',
    children: [],
    canActivate: [CookiesGuard],
    data: {
      meta: {
        title: 'account.login.link',
        robots: 'noindex, nofollow',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(cookiesPageRoutes), SharedModule],
  declarations: [CookiesModalComponent],
})
export class CookiesPageModule {}
