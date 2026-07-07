export type AiLanguage =
  | 'fr'
  | 'en'
  | 'ar';

export type AiTone =
  | 'professional'
  | 'confident'
  | 'enthusiastic'
  | 'concise';

export type AiCompatibilityLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'GOOD'
  | 'EXCELLENT';

export type InterviewCategory =
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'COMPANY'
  | 'MOTIVATION'
  | 'EXPERIENCE';

export type InterviewDifficulty =
  | 'EASY'
  | 'MEDIUM'
  | 'HARD';


export interface CoverLetterRequest {

  applicationId: number;

  language: AiLanguage;

  tone: AiTone;

  candidateSummary: string;
}


export interface CoverLetterResponse {

  subject: string;

  greeting: string;

  introduction: string;

  body_paragraphs: string[];

  closing: string;

  signature_placeholder: string;

  full_letter: string;
}


export interface InterviewPreparationRequest {

  applicationId: number;

  language: AiLanguage;

  questionCount: number;

  candidateSummary: string;
}


export interface InterviewQuestion {

  question: string;

  category:
    InterviewCategory;

  difficulty:
    InterviewDifficulty;

  why_asked: string;

  answer_guidance: string;

  example_answer: string;
}


export interface InterviewPreparationResponse {

  introduction: string;

  questions:
    InterviewQuestion[];

  technical_topics:
    string[];

  questions_to_ask_recruiter:
    string[];

  preparation_checklist:
    string[];

  final_advice: string;
}


export interface MatchAnalysisRequest {

  applicationId: number;

  language: AiLanguage;

  cvText: string;
}


export interface MatchAnalysisResponse {

  score: number;

  compatibility_level:
    AiCompatibilityLevel;

  summary: string;

  strengths: string[];

  gaps: string[];

  missing_keywords: string[];

  cv_improvements: string[];

  application_recommendations:
    string[];

  disclaimer: string;
}
