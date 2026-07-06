import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  SessionService
} from '../services/session.service';

export const authInterceptor:
  HttpInterceptorFn = (
    request,
    next
  ) => {

    const sessionService =
      inject(SessionService);

    const router =
      inject(Router);

    const token =
      sessionService.getToken();

    let authenticatedRequest =
      request;

    if (
      token
      &&
      request.url.startsWith(
        environment.apiUrl
      )
    ) {
      authenticatedRequest =
        request.clone({
          setHeaders: {
            Authorization:
              `Bearer ${token}`
          }
        });
    }

    return next(
      authenticatedRequest
    ).pipe(
      catchError(
        (
          error: HttpErrorResponse
        ) => {

          const isAuthenticationRequest =
            request.url.includes(
              '/auth/login'
            )
            ||
            request.url.includes(
              '/auth/register'
            );

          if (
            error.status === 401
            &&
            !isAuthenticationRequest
          ) {
            sessionService.clearSession();

            router.navigate([
              '/login'
            ]);
          }

          return throwError(
            () => error
          );
        }
      )
    );
  };
