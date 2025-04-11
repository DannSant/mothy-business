import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class ExchangeRateService {

  private API_URL = `https://open.er-api.com/v6/latest/USD`;

  usdToMxnRate = signal<number>(0);

  constructor(private http: HttpClient) {}

  fetchUsdToMxnRate() {
    this.http.get<any>(this.API_URL)
      .pipe(
        map(response => response?.rates?.MXN || 0),
        catchError(error => {
          console.error('Failed to fetch exchange rate:', error);
          return of(0);
        })
      )
      .subscribe(rate => this.usdToMxnRate.set(rate));
  }

}
