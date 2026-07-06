import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile
} from '../models/auth.model';

import {
  SessionService
} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    `${environment.apiUrl}/auth`;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly sessionService: SessionService
  ) {
  }

  register(
    request: RegisterRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/register`,
        request
      )
      .pipe(
        tap(response =>
          this.sessionService.saveSession(
            response
          )
        )
      );
  }

  login(
    request: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        request
      )
      .pipe(
        tap(response =>
          this.sessionService.saveSession(
            response
          )
        )
      );
  }

  getProfile(): Observable<UserProfile> {

    return this.http.get<UserProfile>(
      `${environment.apiUrl}/users/me`
    );
  }

  logout(): void {

    this.sessionService.clearSession();

    this.router.navigate([
      '/login'
    ]);
  }
}
