import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  AuthUser,
  UserProfile
} from '../../../core/models/auth.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  SessionService
} from '../../../core/services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl:
    './dashboard.component.html',
  styleUrls: [
    './dashboard.component.css'
  ]
})
export class DashboardComponent
  implements OnInit {

  user: AuthUser | UserProfile | null =
    null;

  loading = true;

  errorMessage = '';

  constructor(
    private readonly authService:
      AuthService,

    private readonly sessionService:
      SessionService
  ) {
    this.user =
      this.sessionService.getCurrentUser();
  }

  ngOnInit(): void {

    this.authService
      .getProfile()
      .subscribe({
        next: profile => {

          this.user = profile;
          this.loading = false;
        },

        error: () => {

          this.loading = false;

          this.errorMessage =
            'Impossible de charger votre profil.';
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
