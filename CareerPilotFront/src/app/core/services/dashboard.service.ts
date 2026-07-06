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
  DashboardStatistics
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl =
    `${environment.apiUrl}/dashboard`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getStatistics():
    Observable<DashboardStatistics> {

    return this.http
      .get<DashboardStatistics>(
        `${this.apiUrl}/statistics`
      );
  }
}
