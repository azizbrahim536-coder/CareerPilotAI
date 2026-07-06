import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject
} from 'rxjs';

import {
  AuthResponse,
  AuthUser
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly tokenKey =
    'careerpilot_token';

  private readonly userKey =
    'careerpilot_user';

  private readonly expiresAtKey =
    'careerpilot_expires_at';

  private readonly currentUserSubject =
    new BehaviorSubject<AuthUser | null>(
      this.readStoredUser()
    );

  readonly currentUser$ =
    this.currentUserSubject.asObservable();

  saveSession(
    response: AuthResponse
  ): void {

    const user: AuthUser = {
      id: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      role: response.role
    };

    const expiresAt =
      Date.now() + response.expiresIn;

    localStorage.setItem(
      this.tokenKey,
      response.token
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(user)
    );

    localStorage.setItem(
      this.expiresAtKey,
      expiresAt.toString()
    );

    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.tokenKey
    );
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {

    const token =
      this.getToken();

    const expiresAt =
      Number(
        localStorage.getItem(
          this.expiresAtKey
        )
      );

    if (
      !token
      ||
      !expiresAt
      ||
      Date.now() >= expiresAt
    ) {
      this.clearSession();

      return false;
    }

    return true;
  }

  clearSession(): void {

    localStorage.removeItem(
      this.tokenKey
    );

    localStorage.removeItem(
      this.userKey
    );

    localStorage.removeItem(
      this.expiresAtKey
    );

    this.currentUserSubject.next(null);
  }

  private readStoredUser(): AuthUser | null {

    const storedUser =
      localStorage.getItem(
        this.userKey
      );

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(
        storedUser
      ) as AuthUser;

    } catch {
      localStorage.removeItem(
        this.userKey
      );

      return null;
    }
  }
}
