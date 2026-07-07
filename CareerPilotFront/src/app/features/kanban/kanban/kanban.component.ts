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
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  AuthUser
} from '../../../core/models/auth.model';

import {
  ApplicationBoard,
  ApplicationStatus,
  JobApplication,
  JobApplicationRequest
} from '../../../core/models/job-application.model';

import {
  JobOffer
} from '../../../core/models/job-offer.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  JobApplicationService
} from '../../../core/services/job-application.service';

import {
  JobOfferService
} from '../../../core/services/job-offer.service';

import {
  SessionService
} from '../../../core/services/session.service';

interface KanbanColumn {
  status: ApplicationStatus;
  label: string;
  description: string;
  icon: string;
  className: string;
}

@Component({
  selector: 'app-kanban',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    DragDropModule
  ],

  templateUrl:
    './kanban.component.html',

  styleUrls: [
    './kanban.component.css'
  ]
})
export class KanbanComponent
  implements OnInit {

  user: AuthUser | null = null;

  board: ApplicationBoard = {
    SAVED: [],
    APPLIED: [],
    INTERVIEW: [],
    OFFER: [],
    REJECTED: []
  };

  offers: JobOffer[] = [];

  loading = true;

  refreshing = false;

  saving = false;

  deletingId: number | null = null;

  updatingStatusId: number | null = null;

  showForm = false;

  editingApplication:
    JobApplication | null = null;

  errorMessage = '';

  successMessage = '';

  readonly columns: KanbanColumn[] = [
    {
      status: 'SAVED',
      label: 'Enregistrées',
      description: 'À préparer',
      icon: '🔖',
      className: 'saved'
    },
    {
      status: 'APPLIED',
      label: 'Envoyées',
      description: 'Candidatures envoyées',
      icon: '📤',
      className: 'applied'
    },
    {
      status: 'INTERVIEW',
      label: 'Entretiens',
      description: 'Entretiens planifiés',
      icon: '📅',
      className: 'interview'
    },
    {
      status: 'OFFER',
      label: 'Offres reçues',
      description: 'Réponses positives',
      icon: '🎉',
      className: 'offer'
    },
    {
      status: 'REJECTED',
      label: 'Refusées',
      description: 'Réponses négatives',
      icon: '✕',
      className: 'rejected'
    }
  ];

  readonly applicationForm =
    this.formBuilder.group({

      jobOfferId: [
        null as number | null,
        [
          Validators.required
        ]
      ],

      status: [
        'SAVED' as ApplicationStatus,
        [
          Validators.required
        ]
      ],

      appliedDate: [
        ''
      ],

      interviewDate: [
        ''
      ],

      nextFollowUpDate: [
        ''
      ],

      contactName: [
        '',
        [
          Validators.maxLength(150)
        ]
      ],

      contactEmail: [
        '',
        [
          Validators.email,
          Validators.maxLength(150)
        ]
      ],

      contactPhone: [
        '',
        [
          Validators.maxLength(50)
        ]
      ],

      notes: [
        '',
        [
          Validators.maxLength(10000)
        ]
      ]
    });

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly applicationService:
      JobApplicationService,

    private readonly jobOfferService:
      JobOfferService,

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

  get allApplications(): JobApplication[] {

    return this.columns.flatMap(
      column =>
        this.board[column.status]
    );
  }

  get totalApplications(): number {
    return this.allApplications.length;
  }

  get selectableOffers(): JobOffer[] {

    const currentOfferId =
      this.editingApplication?.jobOfferId
      ?? null;

    const usedOfferIds =
      new Set(
        this.allApplications.map(
          application =>
            application.jobOfferId
        )
      );

    return this.offers.filter(
      offer =>
        offer.id === currentOfferId
        ||
        !usedOfferIds.has(offer.id)
    );
  }

  loadData(): void {

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      board:
        this.applicationService.getBoard(),

      offers:
        this.jobOfferService.getAll()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: result => {

          this.board =
            this.normalizeBoard(
              result.board
            );

          this.offers =
            result.offers;
        },

        error: error => {

          console.error(
            'Erreur chargement Kanban :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de charger le tableau Kanban.'
            );
        }
      });
  }

  refreshBoard(): void {

    this.refreshing = true;
    this.errorMessage = '';

    this.applicationService
      .getBoard()
      .pipe(
        finalize(() => {
          this.refreshing = false;
        })
      )
      .subscribe({
        next: board => {

          this.board =
            this.normalizeBoard(board);
        },

        error: error => {

          console.error(
            'Erreur actualisation Kanban :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible d’actualiser les candidatures.'
            );
        }
      });
  }

  openCreateForm(
    initialStatus:
      ApplicationStatus = 'SAVED'
  ): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.offers.length === 0) {

      this.errorMessage =
        'Ajoutez d’abord une offre d’emploi.';

      return;
    }

    if (this.selectableOffers.length === 0) {

      this.errorMessage =
        'Toutes les offres possèdent déjà une candidature.';

      return;
    }

    this.editingApplication = null;

    this.applicationForm.reset({
      jobOfferId:
        this.selectableOffers.length === 1
          ? this.selectableOffers[0].id
          : null,

      status:
        initialStatus,

      appliedDate:
        initialStatus === 'SAVED'
          ? ''
          : this.getToday(),

      interviewDate: '',
      nextFollowUpDate: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: ''
    });

    this.showForm = true;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  openEditForm(
    application: JobApplication
  ): void {

    this.editingApplication =
      application;

    this.errorMessage = '';
    this.successMessage = '';

    this.applicationForm.reset({

      jobOfferId:
        application.jobOfferId,

      status:
        application.status,

      appliedDate:
        application.appliedDate ?? '',

      interviewDate:
        this.toDateTimeLocal(
          application.interviewDate
        ),

      nextFollowUpDate:
        application.nextFollowUpDate
        ?? '',

      contactName:
        application.contactName ?? '',

      contactEmail:
        application.contactEmail ?? '',

      contactPhone:
        application.contactPhone ?? '',

      notes:
        application.notes ?? ''
    });

    this.showForm = true;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelForm(): void {

    this.showForm = false;

    this.editingApplication = null;

    this.applicationForm.reset({
      jobOfferId: null,
      status: 'SAVED',
      appliedDate: '',
      interviewDate: '',
      nextFollowUpDate: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: ''
    });
  }

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.applicationForm.invalid) {

      this.applicationForm.markAllAsTouched();

      return;
    }

    const value =
      this.applicationForm.getRawValue();

    if (value.jobOfferId === null) {

      this.errorMessage =
        'Veuillez sélectionner une offre.';

      return;
    }

    const request:
      JobApplicationRequest = {

        jobOfferId:
          value.jobOfferId,

        status: (
          value.status as ApplicationStatus
        ),

        appliedDate:
          this.toNullable(
            value.appliedDate
          ),

        interviewDate:
          this.toBackendDateTime(
            value.interviewDate
          ),

        nextFollowUpDate:
          this.toNullable(
            value.nextFollowUpDate
          ),

        contactName:
          this.toNullable(
            value.contactName
          ),

        contactEmail:
          this.toNullable(
            value.contactEmail
          ),

        contactPhone:
          this.toNullable(
            value.contactPhone
          ),

        notes:
          this.toNullable(
            value.notes
          )
      };

    this.saving = true;

    const editing =
      this.editingApplication !== null;

    const request$ =
      editing

        ? this.applicationService.update(
            this.editingApplication!.id,
            request
          )

        : this.applicationService.create(
            request
          );

    request$
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {

          this.successMessage =
            editing
              ? 'Candidature modifiée avec succès.'
              : 'Candidature ajoutée avec succès.';

          this.cancelForm();

          this.refreshBoard();
        },

        error: error => {

          console.error(
            'Erreur sauvegarde candidature :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de sauvegarder cette candidature.'
            );
        }
      });
  }

  drop(
    event:
      CdkDragDrop<JobApplication[]>,

    targetStatus:
      ApplicationStatus
  ): void {

    if (
      event.previousContainer
      ===
      event.container
    ) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      return;
    }

    const application =
      event.previousContainer
        .data[event.previousIndex];

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const previousStatus =
      application.status;

    application.status =
      targetStatus;

    this.updatingStatusId =
      application.id;

    this.errorMessage = '';
    this.successMessage = '';

    this.applicationService
      .updateStatus(
        application.id,
        targetStatus
      )
      .pipe(
        finalize(() => {
          this.updatingStatusId = null;
        })
      )
      .subscribe({
        next: updatedApplication => {

          Object.assign(
            application,
            updatedApplication
          );

          this.successMessage =
            `Candidature déplacée vers « ${this.getStatusLabel(targetStatus)} ».`;
        },

        error: error => {

          application.status =
            previousStatus;

          console.error(
            'Erreur changement de statut :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de modifier le statut.'
            );

          this.refreshBoard();
        }
      });
  }

  changeStatus(
    application: JobApplication,
    newStatus: ApplicationStatus
  ): void {

    if (
      application.status === newStatus
    ) {
      return;
    }

    this.updatingStatusId =
      application.id;

    this.errorMessage = '';
    this.successMessage = '';

    this.applicationService
      .updateStatus(
        application.id,
        newStatus
      )
      .pipe(
        finalize(() => {
          this.updatingStatusId = null;
        })
      )
      .subscribe({
        next: () => {

          this.successMessage =
            'Statut modifié avec succès.';

          this.refreshBoard();
        },

        error: error => {

          console.error(
            'Erreur changement de statut :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de modifier le statut.'
            );
        }
      });
  }

  deleteApplication(
    application: JobApplication
  ): void {

    const confirmed =
      window.confirm(
        `Supprimer la candidature "${application.jobTitle}" chez "${application.companyName}" ?`
      );

    if (!confirmed) {
      return;
    }

    this.deletingId =
      application.id;

    this.errorMessage = '';
    this.successMessage = '';

    this.applicationService
      .delete(application.id)
      .pipe(
        finalize(() => {
          this.deletingId = null;
        })
      )
      .subscribe({
        next: () => {

          this.successMessage =
            'Candidature supprimée avec succès.';

          if (
            this.editingApplication?.id
            ===
            application.id
          ) {
            this.cancelForm();
          }

          this.refreshBoard();
        },

        error: error => {

          console.error(
            'Erreur suppression candidature :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de supprimer cette candidature.'
            );
        }
      });
  }

  getStatusLabel(
    status: ApplicationStatus
  ): string {

    return this.columns.find(
      column =>
        column.status === status
    )?.label ?? status;
  }

  getColumnApplications(
    status: ApplicationStatus
  ): JobApplication[] {

    return this.board[status] ?? [];
  }

  getColumnCount(
    status: ApplicationStatus
  ): number {

    return this.getColumnApplications(
      status
    ).length;
  }

  trackByApplicationId(
    index: number,
    application: JobApplication
  ): number {

    return application.id;
  }

  logout(): void {
    this.authService.logout();
  }

  private normalizeBoard(
    board:
      Partial<ApplicationBoard>
  ): ApplicationBoard {

    return {
      SAVED:
        board.SAVED ?? [],

      APPLIED:
        board.APPLIED ?? [],

      INTERVIEW:
        board.INTERVIEW ?? [],

      OFFER:
        board.OFFER ?? [],

      REJECTED:
        board.REJECTED ?? []
    };
  }

  private toNullable(
    value:
      string
      | null
      | undefined
  ): string | null {

    if (!value) {
      return null;
    }

    const cleanedValue =
      value.trim();

    return cleanedValue || null;
  }

  private toBackendDateTime(
    value:
      string
      | null
      | undefined
  ): string | null {

    const cleanedValue =
      this.toNullable(value);

    if (!cleanedValue) {
      return null;
    }

    if (
      cleanedValue.length === 16
    ) {
      return `${cleanedValue}:00`;
    }

    return cleanedValue;
  }

  private toDateTimeLocal(
    value:
      string
      | null
      | undefined
  ): string {

    if (!value) {
      return '';
    }

    return value.slice(0, 16);
  }

  private getToday(): string {

    return new Date()
      .toISOString()
      .slice(0, 10);
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
