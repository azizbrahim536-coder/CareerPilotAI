import {
  CommonModule
} from '@angular/common';

import {
  Component
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loading = false;

  errorMessage = '';

  showPassword = false;

  readonly loginForm =
    this.formBuilder.nonNullable.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ]
    });

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly authService:
      AuthService,

    private readonly router:
      Router
  ) {
  }

  submit(): void {

    this.errorMessage = '';

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.authService
      .login(
        this.loginForm.getRawValue()
      )
      .subscribe({
        next: () => {

          this.loading = false;

          this.router.navigate([
            '/dashboard'
          ]);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.loading = false;

          this.errorMessage =
            error.error?.message
            ??
            'Impossible de vous connecter.';
        }
      });
  }
}
