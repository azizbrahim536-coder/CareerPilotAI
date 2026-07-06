import {
  CommonModule
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl:
    './register.component.html',
  styleUrls: [
    './register.component.css'
  ]
})
export class RegisterComponent {

  loading = false;

  errorMessage = '';

  showPassword = false;

  readonly registerForm =
    this.formBuilder.nonNullable.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.maxLength(80)
          ]
        ],

        lastName: [
          '',
          [
            Validators.required,
            Validators.maxLength(80)
          ]
        ],

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
            Validators.minLength(8),
            Validators.maxLength(100)
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ]
      },
      {
        validators:
          RegisterComponent.passwordsMatch
      }
    );

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly authService:
      AuthService,

    private readonly router:
      Router
  ) {
  }

  static passwordsMatch(
    control: AbstractControl
  ): ValidationErrors | null {

    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (
      password !== confirmPassword
    ) {
      return {
        passwordsNotMatching: true
      };
    }

    return null;
  }

  submit(): void {

    this.errorMessage = '';

    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      return;
    }

    const value =
      this.registerForm.getRawValue();

    this.loading = true;

    this.authService
      .register({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        password: value.password
      })
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

          if (
            Array.isArray(
              error.error?.errors
            )
          ) {
            this.errorMessage =
              error.error.errors.join(' ');

            return;
          }

          this.errorMessage =
            error.error?.message
            ??
            'Impossible de créer le compte.';
        }
      });
  }
}
