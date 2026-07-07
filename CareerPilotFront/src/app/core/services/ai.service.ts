import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  CoverLetterRequest,
  CoverLetterResponse,
  InterviewPreparationRequest,
  InterviewPreparationResponse,
  MatchAnalysisRequest,
  MatchAnalysisResponse
} from '../models/ai.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private readonly apiUrl =
    environment.aiApiUrl;

  constructor(
    private readonly http:
      HttpClient
  ) {
  }

  generateCoverLetter(
    request:
      CoverLetterRequest
  ): Observable<CoverLetterResponse> {

    return this.http
      .post<CoverLetterResponse>(
        `${this.apiUrl}/cover-letter`,
        request
      );
  }

  prepareInterview(
    request:
      InterviewPreparationRequest
  ): Observable<InterviewPreparationResponse> {

    return this.http
      .post<InterviewPreparationResponse>(
        `${this.apiUrl}/interview-preparation`,
        request
      );
  }

  analyzeMatch(
    request:
      MatchAnalysisRequest
  ): Observable<MatchAnalysisResponse> {

    return this.http
      .post<MatchAnalysisResponse>(
        `${this.apiUrl}/match-analysis`,
        request
      );
  }
}
