import {
  HttpClient,
  HttpParams
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
  ApplicationBoard,
  ApplicationStatus,
  ApplicationStatusRequest,
  JobApplication,
  JobApplicationRequest
} from '../models/job-application.model';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {

  private readonly apiUrl =
    `${environment.apiUrl}/applications`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getAll(
    status?: ApplicationStatus
  ): Observable<JobApplication[]> {

    let params =
      new HttpParams();

    if (status) {

      params = params.set(
        'status',
        status
      );
    }

    return this.http.get<JobApplication[]>(
      this.apiUrl,
      {
        params
      }
    );
  }

  getBoard():
    Observable<ApplicationBoard> {

    return this.http.get<ApplicationBoard>(
      `${this.apiUrl}/board`
    );
  }

  getById(
    id: number
  ): Observable<JobApplication> {

    return this.http.get<JobApplication>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: JobApplicationRequest
  ): Observable<JobApplication> {

    return this.http.post<JobApplication>(
      this.apiUrl,
      request
    );
  }

  update(
    id: number,
    request: JobApplicationRequest
  ): Observable<JobApplication> {

    return this.http.put<JobApplication>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    id: number,
    status: ApplicationStatus
  ): Observable<JobApplication> {

    const request:
      ApplicationStatusRequest = {
        status
      };

    return this.http.patch<JobApplication>(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }

  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
