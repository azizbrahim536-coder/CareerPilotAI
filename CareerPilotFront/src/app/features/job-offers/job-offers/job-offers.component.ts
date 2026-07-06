import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  AuthUser
} from '../../../core/models/auth.model';

import {
  Company
} from '../../../core/models/company.model';

import {
  EmploymentType,
  JobOffer,
  JobOfferRequest,
  WorkMode
} from '../../../core/models/job-offer.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  CompanyService
} from '../../../core/services/company.service';

import {
  JobOfferService
} from '../../../core/services/job-offer.service';

import {
  SessionService
} from '../../../core/services/session.service';

@Component({
  selector: 'app-job-offers',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl:
    './job-offers.component.html',

  styleUrls: [
    './job-offers.component.css'
  ]
})
export class JobOffersComponent
  implements OnInit {

  user: AuthUser | null = null;

  offers: JobOffer[] = [];

  companies: Company[] = [];

  loading = true;

  saving = false;

  deletingId: number | null = null;

  editingId: number | null = null;

  showForm = false;

  searchTerm = '';

  selectedCompanyFilter: number | null = null;

  errorMessage = '';

  successMessage = '';

  readonly workModes: {
    value: WorkMode;
    label: string;
  }[] = [
    {
      value: 'ONSITE',
      label: 'Sur site'
    },
    {
      value: 'HYBRID',
      label: 'Hybride'
    },
    {
      value: 'REMOTE',
      label: 'À distance'
    }
  ];

  readonly employmentTypes: {
    value: EmploymentType;
    label: string;
  }[] = [
    {
      value: 'FULL_TIME',
      label: 'Temps plein'
    },
    {
      value: 'PART_TIME',
      label: 'Temps partiel'
    },
    {
      value: 'INTERNSHIP',
      label: 'Stage'
    },
    {
      value: 'CONTRACT',
      label: 'Contrat'
    },
    {
      value: 'FREELANCE',
      label: 'Freelance'
    }
  ];

  readonly offerForm =
    this.formBuilder.group({

      companyId: [
        null as number | null,
        [
          Validators.required
        ]
      ],

      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(180)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(10000)
        ]
      ],

      location: [
        '',
        [
          Validators.maxLength(150)
        ]
      ],

      workMode: [
        'ONSITE' as WorkMode,
        [
          Validators.required
        ]
      ],

      employmentType: [
        'FULL_TIME' as EmploymentType,
        [
          Validators.required
        ]
      ],

      sourceUrl: [
        '',
        [
          Validators.maxLength(500)
        ]
      ],

      salaryMin: [
        null as number | null,
        [
          Validators.min(0)
        ]
      ],

      salaryMax: [
        null as number | null,
        [
          Validators.min(0)
        ]
      ],

      currency: [
        'TND',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10)
        ]
      ],

      deadline: [
        ''
      ]
    });

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly jobOfferService:
      JobOfferService,

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
    this.loadData();
  }

  get filteredOffers(): JobOffer[] {

    const normalizedSearch =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.offers.filter(offer => {

      const matchesCompany =
        this.selectedCompanyFilter === null
        ||
        offer.companyId ===
        this.selectedCompanyFilter;

      const matchesSearch =
        !normalizedSearch
        ||
        offer.title
          .toLowerCase()
          .includes(normalizedSearch)
        ||
        offer.companyName
          .toLowerCase()
          .includes(normalizedSearch)
        ||
        (
          offer.location
            ?.toLowerCase()
            .includes(normalizedSearch)
          ?? false
        );

      return matchesCompany && matchesSearch;
    });
  }

  loadData(): void {

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      offers:
        this.jobOfferService.getAll(),

      companies:
        this.companyService.getAll()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: result => {

          this.offers =
            result.offers;

          this.companies =
            result.companies;
        },

        error: error => {

          console.error(
            'Erreur chargement :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de charger les offres.'
            );
        }
      });
  }

  openCreateForm(): void {

    this.editingId = null;

    this.errorMessage = '';
    this.successMessage = '';

    this.offerForm.reset({
      companyId:
        this.companies.length === 1
          ? this.companies[0].id
          : null,

      title: '',
      description: '',
      location: '',
      workMode: 'ONSITE',
      employmentType: 'FULL_TIME',
      sourceUrl: '',
      salaryMin: null,
      salaryMax: null,
      currency: 'TND',
      deadline: ''
    });

    this.showForm = true;
  }

  openEditForm(
    offer: JobOffer
  ): void {

    this.editingId =
      offer.id;

    this.errorMessage = '';
    this.successMessage = '';

    this.offerForm.reset({
      companyId:
        offer.companyId,

      title:
        offer.title,

      description:
        offer.description ?? '',

      location:
        offer.location ?? '',

      workMode:
        offer.workMode,

      employmentType:
        offer.employmentType,

      sourceUrl:
        offer.sourceUrl ?? '',

      salaryMin:
        offer.salaryMin,

      salaryMax:
        offer.salaryMax,

      currency:
        offer.currency || 'TND',

      deadline:
        offer.deadline ?? ''
    });

    this.showForm = true;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelForm(): void {

    this.showForm = false;
    this.editingId = null;

    this.offerForm.reset({
      companyId: null,
      title: '',
      description: '',
      location: '',
      workMode: 'ONSITE',
      employmentType: 'FULL_TIME',
      sourceUrl: '',
      salaryMin: null,
      salaryMax: null,
      currency: 'TND',
      deadline: ''
    });
  }

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.offerForm.invalid) {

      this.offerForm.markAllAsTouched();

      return;
    }

    const value =
      this.offerForm.getRawValue();

    if (value.companyId === null) {

      this.errorMessage =
        'Veuillez sélectionner une entreprise.';

      return;
    }

    if (
      value.salaryMin !== null
      &&
      value.salaryMax !== null
      &&
      Number(value.salaryMin)
        >
      Number(value.salaryMax)
    ) {
      this.errorMessage =
        'Le salaire minimum ne peut pas dépasser le salaire maximum.';

      return;
    }

    const request: JobOfferRequest = {

      companyId:
        value.companyId,

      title:
        value.title?.trim() ?? '',

      description:
        this.toNullable(
          value.description
        ),

      location:
        this.toNullable(
          value.location
        ),

      workMode:
        value.workMode as WorkMode,

      employmentType:
        value.employmentType as EmploymentType,

      sourceUrl:
        this.toNullable(
          value.sourceUrl
        ),

      salaryMin:
        this.toNullableNumber(
          value.salaryMin
        ),

      salaryMax:
        this.toNullableNumber(
          value.salaryMax
        ),

      currency:
        (
          value.currency
          || 'TND'
        )
          .trim()
          .toUpperCase(),

      deadline:
        this.toNullable(
          value.deadline
        )
    };

    this.saving = true;

    const editing =
      this.editingId !== null;

    const request$ =
      editing

        ? this.jobOfferService.update(
            this.editingId as number,
            request
          )

        : this.jobOfferService.create(
            request
          );

    request$
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: savedOffer => {

          if (editing) {

            this.offers =
              this.offers.map(offer =>
                offer.id === savedOffer.id
                  ? savedOffer
                  : offer
              );

            this.successMessage =
              'Offre modifiée avec succès.';

          } else {

            this.offers = [
              savedOffer,
              ...this.offers
            ];

            this.successMessage =
              'Offre ajoutée avec succès.';
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
              'Impossible de sauvegarder cette offre.'
            );
        }
      });
  }

  deleteOffer(
    offer: JobOffer
  ): void {

    const confirmed =
      window.confirm(
        `Supprimer l’offre "${offer.title}" ?`
      );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.deletingId =
      offer.id;

    this.jobOfferService
      .delete(offer.id)
      .pipe(
        finalize(() => {
          this.deletingId = null;
        })
      )
      .subscribe({
        next: () => {

          this.offers =
            this.offers.filter(
              currentOffer =>
                currentOffer.id !== offer.id
            );

          if (
            this.editingId === offer.id
          ) {
            this.cancelForm();
          }

          this.successMessage =
            'Offre supprimée avec succès.';
        },

        error: error => {

          console.error(
            'Erreur suppression :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de supprimer cette offre.'
            );
        }
      });
  }

  getWorkModeLabel(
    workMode: WorkMode
  ): string {

    return this.workModes.find(
      item =>
        item.value === workMode
    )?.label ?? workMode;
  }

  getEmploymentTypeLabel(
    employmentType: EmploymentType
  ): string {

    return this.employmentTypes.find(
      item =>
        item.value === employmentType
    )?.label ?? employmentType;
  }

  formatSalary(
    offer: JobOffer
  ): string {

    if (
      offer.salaryMin === null
      &&
      offer.salaryMax === null
    ) {
      return 'Salaire non précisé';
    }

    if (
      offer.salaryMin !== null
      &&
      offer.salaryMax !== null
    ) {
      return `${offer.salaryMin} - ${offer.salaryMax} ${offer.currency}`;
    }

    if (offer.salaryMin !== null) {
      return `À partir de ${offer.salaryMin} ${offer.currency}`;
    }

    return `Jusqu’à ${offer.salaryMax} ${offer.currency}`;
  }

  trackByOfferId(
    index: number,
    offer: JobOffer
  ): number {

    return offer.id;
  }

  logout(): void {
    this.authService.logout();
  }

  private toNullable(
    value: string | null | undefined
  ): string | null {

    if (!value) {
      return null;
    }

    const normalized =
      value.trim();

    return normalized || null;
  }

  private toNullableNumber(
    value: number | null | undefined
  ): number | null {

    if (
      value === null
      ||
      value === undefined
      ||
      value === ('' as unknown as number)
    ) {
      return null;
    }

    return Number(value);
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
      return error.error.errors.join(' ');
    }

    return error.error?.message
      ?? defaultMessage;
  }
}
