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
  JobOffer,
  JobOfferRequest
} from '../models/job-offer.model';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {

  private readonly apiUrl =
    `${environment.apiUrl}/job-offers`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getAll(
    companyId?: number
  ): Observable<JobOffer[]> {

    let params =
      new HttpParams();

    if (companyId !== undefined) {

      params = params.set(
        'companyId',
        companyId.toString()
      );
    }

    return this.http.get<JobOffer[]>(
      this.apiUrl,
      {
        params
      }
    );
  }

  getById(
    id: number
  ): Observable<JobOffer> {

    return this.http.get<JobOffer>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: JobOfferRequest
  ): Observable<JobOffer> {

    return this.http.post<JobOffer>(
      this.apiUrl,
      request
    );
  }

  update(
    id: number,
    request: JobOfferRequest
  ): Observable<JobOffer> {

    return this.http.put<JobOffer>(
      `${this.apiUrl}/${id}`,
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
