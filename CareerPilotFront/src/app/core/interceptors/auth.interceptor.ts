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

    const isSpringRequest =
      request.url.startsWith(
        environment.apiUrl
      );

    const isAiRequest =
      request.url.startsWith(
        environment.aiApiUrl
      );

    const isApiRequest =
      isSpringRequest
      ||
      isAiRequest;

    const isAuthenticationRequest =
      request.url.includes(
        '/auth/login'
      )
      ||
      request.url.includes(
        '/auth/register'
      );

    let securedRequest =
      request;

    if (
      token
      &&
      isApiRequest
    ) {
      securedRequest =
        request.clone({
          setHeaders: {
            Authorization:
              `Bearer ${token}`
          }
        });
    }

    return next(
      securedRequest
    ).pipe(

      catchError(
        (
          error:
            HttpErrorResponse
        ) => {

          if (
            error.status === 401
            &&
            isApiRequest
            &&
            !isAuthenticationRequest
          ) {
            sessionService
              .clearSession();

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
