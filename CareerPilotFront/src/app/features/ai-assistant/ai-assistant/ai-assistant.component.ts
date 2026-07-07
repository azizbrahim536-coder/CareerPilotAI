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
  AiLanguage,
  AiTone,
  CoverLetterRequest,
  CoverLetterResponse,
  InterviewPreparationRequest,
  InterviewPreparationResponse,
  MatchAnalysisRequest,
  MatchAnalysisResponse
} from '../../../core/models/ai.model';

import {
  AuthUser
} from '../../../core/models/auth.model';

import {
  JobApplication
} from '../../../core/models/job-application.model';

import {
  AiService
} from '../../../core/services/ai.service';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  JobApplicationService
} from '../../../core/services/job-application.service';

import {
  SessionService
} from '../../../core/services/session.service';


type AiTab =
  | 'cover-letter'
  | 'interview'
  | 'match';


@Component({
  selector:
    'app-ai-assistant',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl:
    './ai-assistant.component.html',

  styleUrls: [
    './ai-assistant.component.css'
  ]
})
export class AiAssistantComponent
  implements OnInit {

  user:
    AuthUser | null = null;

  applications:
    JobApplication[] = [];

  activeTab:
    AiTab = 'cover-letter';

  loadingApplications = true;

  generating = false;

  errorMessage = '';

  successMessage = '';

  copiedMessage = '';


  coverLetterResult:
    CoverLetterResponse
    | null = null;

  interviewResult:
    InterviewPreparationResponse
    | null = null;

  matchResult:
    MatchAnalysisResponse
    | null = null;


  readonly languages: {
    value: AiLanguage;
    label: string;
  }[] = [
    {
      value: 'fr',
      label: 'Français'
    },
    {
      value: 'en',
      label: 'English'
    },
    {
      value: 'ar',
      label: 'العربية'
    }
  ];


  readonly tones: {
    value: AiTone;
    label: string;
  }[] = [
    {
      value: 'professional',
      label: 'Professionnel'
    },
    {
      value: 'confident',
      label: 'Confiant'
    },
    {
      value: 'enthusiastic',
      label: 'Enthousiaste'
    },
    {
      value: 'concise',
      label: 'Concis'
    }
  ];


  readonly coverLetterForm =
    this.formBuilder.group({

      applicationId: [
        null as number | null,
        [
          Validators.required
        ]
      ],

      language: [
        'fr' as AiLanguage,
        [
          Validators.required
        ]
      ],

      tone: [
        'professional' as AiTone,
        [
          Validators.required
        ]
      ],

      candidateSummary: [
        '',
        [
          Validators.required,
          Validators.minLength(30),
          Validators.maxLength(5000)
        ]
      ]
    });


  readonly interviewForm =
    this.formBuilder.group({

      applicationId: [
        null as number | null,
        [
          Validators.required
        ]
      ],

      language: [
        'fr' as AiLanguage,
        [
          Validators.required
        ]
      ],

      questionCount: [
        8,
        [
          Validators.required,
          Validators.min(3),
          Validators.max(12)
        ]
      ],

      candidateSummary: [
        '',
        [
          Validators.required,
          Validators.minLength(30),
          Validators.maxLength(5000)
        ]
      ]
    });


  readonly matchForm =
    this.formBuilder.group({

      applicationId: [
        null as number | null,
        [
          Validators.required
        ]
      ],

      language: [
        'fr' as AiLanguage,
        [
          Validators.required
        ]
      ],

      cvText: [
        '',
        [
          Validators.required,
          Validators.minLength(50),
          Validators.maxLength(30000)
        ]
      ]
    });


  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly aiService:
      AiService,

    private readonly applicationService:
      JobApplicationService,

    private readonly authService:
      AuthService,

    private readonly sessionService:
      SessionService
  ) {
    this.user =
      this.sessionService
        .getCurrentUser();
  }


  ngOnInit(): void {
    this.loadApplications();
  }


setActiveTab(
  tab: AiTab
): void {

  this.activeTab = tab;

  this.errorMessage = '';
  this.successMessage = '';
  this.copiedMessage = '';

  const coverSummary =
    this.coverLetterForm.controls
      .candidateSummary.value
      ?.trim() ?? '';

  const interviewSummary =
    this.interviewForm.controls
      .candidateSummary.value
      ?.trim() ?? '';

  if (
    tab === 'interview'
    &&
    !interviewSummary
    &&
    coverSummary
  ) {
    this.interviewForm.patchValue({
      candidateSummary: coverSummary
    });
  }
}

  loadApplications(): void {

    this.loadingApplications = true;

    this.errorMessage = '';

    this.applicationService
      .getAll()
      .pipe(
        finalize(() => {
          this.loadingApplications = false;
        })
      )
      .subscribe({

        next: applications => {

          this.applications =
            applications;

          if (
            applications.length > 0
          ) {
            const firstApplicationId =
              applications[0].id;

            this.coverLetterForm
              .patchValue({
                applicationId:
                  firstApplicationId
              });

            this.interviewForm
              .patchValue({
                applicationId:
                  firstApplicationId
              });

            this.matchForm
              .patchValue({
                applicationId:
                  firstApplicationId
              });
          }
        },

        error: error => {

          console.error(
            'Erreur candidatures :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de charger les candidatures.'
            );
        }
      });
  }


  generateCoverLetter(): void {

    this.errorMessage = '';

    this.successMessage = '';

    this.coverLetterResult = null;

    if (
      this.coverLetterForm.invalid
    ) {
      this.coverLetterForm
        .markAllAsTouched();

      return;
    }

    const value =
      this.coverLetterForm
        .getRawValue();

    if (
      value.applicationId === null
    ) {
      this.errorMessage =
        'Veuillez sélectionner une candidature.';

      return;
    }

    const request: CoverLetterRequest = {
      applicationId: value.applicationId,
      language: value.language! as AiLanguage,
      tone: value.tone as AiTone,
      candidateSummary: value.candidateSummary?.trim() ?? ''
    };

    this.generating = true;

    this.aiService
      .generateCoverLetter(
        request
      )
      .pipe(
        finalize(() => {
          this.generating = false;
        })
      )
      .subscribe({

        next: result => {

          this.coverLetterResult =
            result;

          this.successMessage =
            'Lettre de motivation générée avec succès.';
        },

        error: error => {

          console.error(
            'Erreur lettre IA :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible de générer la lettre de motivation.'
            );
        }
      });
  }


generateInterviewPreparation(): void {

  this.errorMessage = '';
  this.successMessage = '';
  this.interviewResult = null;

  console.log(
    'Valeurs entretien :',
    this.interviewForm.getRawValue()
  );

  console.log(
    'Statut formulaire :',
    this.interviewForm.status
  );

  if (this.interviewForm.invalid) {

    this.interviewForm.markAllAsTouched();

    this.errorMessage =
      'Vérifiez les informations du formulaire d’entretien.';

    console.log(
      'Erreurs formulaire :',
      {
        applicationId:
          this.interviewForm.controls
            .applicationId.errors,

        language:
          this.interviewForm.controls
            .language.errors,

        questionCount:
          this.interviewForm.controls
            .questionCount.errors,

        candidateSummary:
          this.interviewForm.controls
            .candidateSummary.errors
      }
    );

    return;
  }

  const value =
    this.interviewForm.getRawValue();

  if (value.applicationId === null) {

    this.errorMessage =
      'Veuillez sélectionner une candidature.';

    return;
  }

  const request:
    InterviewPreparationRequest = {

      applicationId:
        value.applicationId,

      language:
        value.language as AiLanguage,

      questionCount:
        Number(value.questionCount ?? 8),

      candidateSummary:
        value.candidateSummary?.trim() ?? ''
    };

  this.generating = true;

  this.aiService
    .prepareInterview(request)
    .pipe(
      finalize(() => {
        this.generating = false;
      })
    )
    .subscribe({

      next: result => {

        this.interviewResult =
          result;

        this.successMessage =
          'Préparation d’entretien générée avec succès.';
      },

      error: error => {

        console.error(
          'Erreur entretien IA :',
          error
        );

        this.errorMessage =
          this.extractErrorMessage(
            error,
            'Impossible de préparer l’entretien.'
          );
      }
    });
}

  generateMatchAnalysis(): void {

    this.errorMessage = '';

    this.successMessage = '';

    this.matchResult = null;

    if (
      this.matchForm.invalid
    ) {
      this.matchForm
        .markAllAsTouched();

      return;
    }

    const value =
      this.matchForm
        .getRawValue();

    if (
      value.applicationId === null
    ) {
      this.errorMessage =
        'Veuillez sélectionner une candidature.';

      return;
    }

    const request: MatchAnalysisRequest = {
      applicationId: value.applicationId,
      language: value.language as AiLanguage,
      cvText: value.cvText?.trim() ?? ''
    };

    this.generating = true;

    this.aiService
      .analyzeMatch(
        request
      )
      .pipe(
        finalize(() => {
          this.generating = false;
        })
      )
      .subscribe({

        next: result => {

          this.matchResult =
            result;

          this.successMessage =
            'Analyse CV / offre terminée.';
        },

        error: error => {

          console.error(
            'Erreur analyse IA :',
            error
          );

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Impossible d’analyser le CV.'
            );
        }
      });
  }


  copyText(
    text: string,
    message: string
  ): void {

    if (!text) {
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {

        this.copiedMessage =
          message;

        setTimeout(() => {
          this.copiedMessage = '';
        }, 2500);
      })
      .catch(error => {

        console.error(
          'Erreur copie :',
          error
        );

        this.errorMessage =
          'Impossible de copier le texte.';
      });
  }


  getDifficultyLabel(
    difficulty: string
  ): string {

    switch (difficulty) {

      case 'EASY':
        return 'Facile';

      case 'MEDIUM':
        return 'Moyenne';

      case 'HARD':
        return 'Difficile';

      default:
        return difficulty;
    }
  }


  getCategoryLabel(
    category: string
  ): string {

    switch (category) {

      case 'TECHNICAL':
        return 'Technique';

      case 'BEHAVIORAL':
        return 'Comportementale';

      case 'COMPANY':
        return 'Entreprise';

      case 'MOTIVATION':
        return 'Motivation';

      case 'EXPERIENCE':
        return 'Expérience';

      default:
        return category;
    }
  }


  getCompatibilityLabel(
    level: string
  ): string {

    switch (level) {

      case 'LOW':
        return 'Faible';

      case 'MEDIUM':
        return 'Moyenne';

      case 'GOOD':
        return 'Bonne';

      case 'EXCELLENT':
        return 'Excellente';

      default:
        return level;
    }
  }


  getApplicationLabel(
    application:
      JobApplication
  ): string {

    return `${application.jobTitle} — ${application.companyName}`;
  }


  logout(): void {
    this.authService.logout();
  }


  private extractErrorMessage(
    error:
      HttpErrorResponse,

    defaultMessage:
      string
  ): string {

    if (
      typeof error.error?.message
      ===
      'string'
    ) {
      return error.error.message;
    }

    if (
      Array.isArray(
        error.error?.errors
      )
    ) {
      return error.error.errors
        .join(' ');
    }

    if (error.status === 0) {
      return 'Le service IA est inaccessible. Vérifiez que Flask fonctionne sur le port 5004.';
    }

    return defaultMessage;
  }
}
