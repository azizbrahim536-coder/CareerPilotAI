import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import {
  authGuard
} from './core/guards/auth.guard';

import {
  guestGuard
} from './core/guards/guest.guard';

const routes: Routes = [

  {
    path: 'login',
    canActivate: [
      guestGuard
    ],
    loadComponent: () =>
      import(
        './features/auth/login/login.component'
      ).then(
        module =>
          module.LoginComponent
      )
  },

  {
    path: 'register',
    canActivate: [
      guestGuard
    ],
    loadComponent: () =>
      import(
        './features/auth/register/register.component'
      ).then(
        module =>
          module.RegisterComponent
      )
  },

  {
    path: 'dashboard',
    canActivate: [
      authGuard
    ],
    loadComponent: () =>
      import(
        './features/dashboard/dashboard/dashboard.component'
      ).then(
        module =>
          module.DashboardComponent
      )
  },

  {
    path: 'companies',
    canActivate: [
      authGuard
    ],
    loadComponent: () =>
      import(
        './features/companies/companies/companies.component'
      ).then(
        module =>
          module.CompaniesComponent
      )
  },
  {
  path: 'job-offers',

  canActivate: [
    authGuard
  ],

  loadComponent: () =>
    import(
      './features/job-offers/job-offers/job-offers.component'
    ).then(
      module =>
        module.JobOffersComponent
    )
},

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
