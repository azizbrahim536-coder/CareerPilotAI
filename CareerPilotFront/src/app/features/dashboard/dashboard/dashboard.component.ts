import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  finalize
} from 'rxjs';

import {
  AuthUser,
  UserProfile
} from '../../../core/models/auth.model';

import {
  ApplicationStatus
} from '../../../core/models/job-application.model';

import {
  DashboardStatistics
} from '../../../core/models/dashboard.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  DashboardService
} from '../../../core/services/dashboard.service';

import {
  SessionService
} from '../../../core/services/session.service';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [
    CommonModule,
      RouterLink,
      RouterLinkActive
  ],

  templateUrl:
    './dashboard.component.html',

  styleUrls: [
    './dashboard.component.css'
  ]
})
export class DashboardComponent
  implements OnInit {

  user:
    AuthUser
    | UserProfile
    | null = null;

  statistics:
    DashboardStatistics
    | null = null;

  loading = true;

  errorMessage = '';

  constructor(
    private readonly authService:
      AuthService,

    private readonly sessionService:
      SessionService,

    private readonly dashboardService:
      DashboardService
  ) {
    this.user =
      this.sessionService
        .getCurrentUser();
  }

  ngOnInit(): void {

    this.loadDashboard();

    this.authService
      .getProfile()
      .subscribe({
        next: profile => {
          this.user = profile;
        },

        error: () => {
          console.error(
            'Impossible de charger le profil.'
          );
        }
      });
  }

  loadDashboard(): void {

    this.loading = true;
    this.errorMessage = '';

    this.dashboardService
      .getStatistics()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: statistics => {

          this.statistics =
            statistics;
        },

        error: error => {

          console.error(
            'Erreur dashboard :',
            error
          );

          this.errorMessage =
            error.error?.message
            ??
            'Impossible de charger les statistiques.';
        }
      });
  }

  getStatusLabel(
    status: ApplicationStatus
  ): string {

    switch (status) {

      case 'SAVED':
        return 'Enregistrée';

      case 'APPLIED':
        return 'Envoyée';

      case 'INTERVIEW':
        return 'Entretien';

      case 'OFFER':
        return 'Offre reçue';

      case 'REJECTED':
        return 'Refusée';

      default:
        return status;
    }
  }

  getStatusClass(
    status: ApplicationStatus
  ): string {

    return `status-${status.toLowerCase()}`;
  }

  logout(): void {
    this.authService.logout();
  }
}
