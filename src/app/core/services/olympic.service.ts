import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OlympicCountry } from '../../shared/models/olympic.model';

export interface OlympicState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  countries: OlympicCountry[];
  error?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private readonly stateSubject = new BehaviorSubject<OlympicState>({
    status: 'idle',
    countries: [],
  });
  private inFlight = false;

  constructor(private http: HttpClient) {}

  ensureDataLoaded(force = false): void {
    const currentState = this.stateSubject.value;

    if (!force && (this.inFlight || currentState.status === 'ready')) {
      return;
    }

    this.inFlight = true;
    this.stateSubject.next({
      status: 'loading',
      countries: currentState.countries,
    });

    this.http
      .get<OlympicCountry[]>(this.olympicUrl)
      .pipe(
        finalize(() => {
          this.inFlight = false;
        })
      )
      .subscribe({
        next: (countries) => {
          this.stateSubject.next({
            status: 'ready',
            countries,
          });
        },
        error: (error) => {
          console.error('Failed to load olympic data', error);
          this.stateSubject.next({
            status: 'error',
            countries: currentState.countries,
            error,
          });
        },
      });
  }

  refresh(): void {
    this.ensureDataLoaded(true);
  }

  getOlympics(): Observable<OlympicState> {
    return this.stateSubject.asObservable();
  }
}
