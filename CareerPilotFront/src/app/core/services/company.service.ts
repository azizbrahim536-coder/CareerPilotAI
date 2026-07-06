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
  Company,
  CompanyRequest
} from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private readonly apiUrl =
    `${environment.apiUrl}/companies`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getAll(): Observable<Company[]> {

    return this.http.get<Company[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<Company> {

    return this.http.get<Company>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: CompanyRequest
  ): Observable<Company> {

    return this.http.post<Company>(
      this.apiUrl,
      request
    );
  }

  update(
    id: number,
    request: CompanyRequest
  ): Observable<Company> {

    return this.http.put<Company>(
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
