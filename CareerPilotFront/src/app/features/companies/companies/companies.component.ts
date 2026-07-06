import {
  CommonModule
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  AuthUser,
  UserProfile
} from '../../../core/models/auth.model';

import {
  Company,
  CompanyRequest
} from '../../../core/models/company.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  CompanyService
} from '../../../core/services/company.service';

import {
  SessionService
} from '../../../core/services/session.service';

@Component({
  selector: 'app-companies',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl:
    './companies.component.html',

  styleUrls: [
    './companies.component.css'
  ]
})
export class CompaniesComponent
  implements OnInit {

  user:
    AuthUser
    | UserProfile
    | null = null;

  companies: Company[] = [];

  loading = true;

  saving = false;

  deletingId: number | null = null;

  showForm = false;

  editingId: number | null = null;

  errorMessage = '';

  successMessage = '';

  readonly companyForm =
    this.formBuilder.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      website: [
        '',
        [
          Validators.maxLength(500)
        ]
      ],

      location: [
        '',
        [
          Validators.maxLength(150)
        ]
      ],

      industry: [
        '',
        [
          Validators.maxLength(150)
        ]
      ],

      notes: [
        '',
        [
          Validators.maxLength(5000)
        ]
      ]
    });

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly companyService:
      CompanyService,

    private readonly authService:
      AuthService,

    private readonly sessionService:
      SessionService
  ) {
    this.user =
      this.sessionService.getCurrentUser();
  }

  ngOnInit(): void {

    this.loadCompanies();

    this.authService
      .getProfile()
      .subscribe({
        next: profile => {
          this.user = profile;
        },

        error: error => {
          console.error(
            'Erreur profil :',
            error
          );
        }
      });
  }

  loadCompanies(): void {

    this.loading = true;
    this.errorMessage = '';

    this.companyService
      .getAll()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: companies => {

          this.companies =
            companies;
        },

        error: error => {

          console.error(
            'Erreur entreprises :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de charger les entreprises.'
            );
        }
      });
  }

  openCreateForm(): void {

    this.editingId = null;

    this.companyForm.reset({
      name: '',
      website: '',
      location: '',
      industry: '',
      notes: ''
    });

    this.errorMessage = '';
    this.successMessage = '';
    this.showForm = true;
  }

  openEditForm(
    company: Company
  ): void {

    this.editingId =
      company.id;

    this.companyForm.reset({
      name: company.name,
      website: company.website ?? '',
      location: company.location ?? '',
      industry: company.industry ?? '',
      notes: company.notes ?? ''
    });

    this.errorMessage = '';
    this.successMessage = '';
    this.showForm = true;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelForm(): void {

    this.showForm = false;
    this.editingId = null;
    this.saving = false;

    this.companyForm.reset({
      name: '',
      website: '',
      location: '',
      industry: '',
      notes: ''
    });
  }

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.companyForm.invalid) {

      this.companyForm.markAllAsTouched();

      return;
    }

    const value =
      this.companyForm.getRawValue();

    const request:
      CompanyRequest = {

        name:
          value.name.trim(),

        website:
          this.toNullable(
            value.website
          ),

        location:
          this.toNullable(
            value.location
          ),

        industry:
          this.toNullable(
            value.industry
          ),

        notes:
          this.toNullable(
            value.notes
          )
      };

    this.saving = true;

    const request$ =
      this.editingId === null

        ? this.companyService
            .create(request)

        : this.companyService
            .update(
              this.editingId,
              request
            );

    request$
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: savedCompany => {

          if (this.editingId === null) {

            this.companies = [
              ...this.companies,
              savedCompany
            ].sort(
              (
                firstCompany,
                secondCompany
              ) =>
                firstCompany.name.localeCompare(
                  secondCompany.name
                )
            );

            this.successMessage =
              'Entreprise ajoutée avec succès.';

          } else {

            this.companies =
              this.companies
                .map(company =>
                  company.id ===
                  savedCompany.id

                    ? savedCompany
                    : company
                )
                .sort(
                  (
                    firstCompany,
                    secondCompany
                  ) =>
                    firstCompany.name.localeCompare(
                      secondCompany.name
                    )
                );

            this.successMessage =
              'Entreprise modifiée avec succès.';
          }

          this.cancelForm();
        },

        error: error => {

          console.error(
            'Erreur sauvegarde :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de sauvegarder cette entreprise.'
            );
        }
      });
  }

  deleteCompany(
    company: Company
  ): void {

    const confirmed =
      window.confirm(
        `Supprimer l’entreprise "${company.name}" ?`
      );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingId = company.id;

    this.companyService
      .delete(company.id)
      .pipe(
        finalize(() => {
          this.deletingId = null;
        })
      )
      .subscribe({
        next: () => {

          this.companies =
            this.companies.filter(
              currentCompany =>
                currentCompany.id !==
                company.id
            );

          if (
            this.editingId === company.id
          ) {
            this.cancelForm();
          }

          this.successMessage =
            'Entreprise supprimée avec succès.';
        },

        error: error => {

          console.error(
            'Erreur suppression :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de supprimer cette entreprise.'
            );
        }
      });
  }

  getInitial(
    company: Company
  ): string {

    return company.name
      .charAt(0)
      .toUpperCase();
  }

  trackByCompanyId(
    index: number,
    company: Company
  ): number {

    return company.id;
  }

  logout(): void {
    this.authService.logout();
  }

  private toNullable(
    value: string
  ): string | null {

    const cleanedValue =
      value.trim();

    return cleanedValue
      ? cleanedValue
      : null;
  }

  private extractErrorMessage(
    error: HttpErrorResponse,
    defaultMessage: string
  ): string {

    if (
      Array.isArray(
        error.error?.errors
      )
    ) {
      return error.error.errors.join(
        ' '
      );
    }

    return error.error?.message
      ?? defaultMessage;
  }
}
