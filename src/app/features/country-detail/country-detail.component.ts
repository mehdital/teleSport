import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import {
  LineChartPoint,
  OlympicCountry,
} from 'src/app/shared/models/olympic.model';

interface CountryDetailState {
  status: 'loading' | 'error' | 'not-found' | 'ready';
  country?: OlympicCountry;
  countryName?: string;
  entries?: number;
  totalMedals?: number;
  totalAthletes?: number;
  points?: LineChartPoint[];
}

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss'],
})
export class CountryDetailComponent {
  state$: Observable<CountryDetailState>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {
    this.state$ = combineLatest([
      this.route.paramMap,
      this.olympicService.getOlympics(),
    ]).pipe(map(([params, countries]) => this.buildState(params.get('id'), countries)));
  }

  backToDashboard(): void {
    this.router.navigate(['/']);
  }

  private buildState(
    idParam: string | null,
    countries: OlympicCountry[] | null | undefined
  ): CountryDetailState {
    if (countries === undefined) {
      return { status: 'loading' };
    }

    if (countries === null) {
      return { status: 'error' };
    }

    const id = Number(idParam);
    if (!id) {
      return { status: 'not-found' };
    }

    const country = countries.find((item) => item.id === id);
    if (!country) {
      return { status: 'not-found' };
    }

    const entries = country.participations.length;
    const totalMedals = country.participations.reduce(
      (acc, participation) => acc + participation.medalsCount,
      0
    );
    const totalAthletes = country.participations.reduce(
      (acc, participation) => acc + participation.athleteCount,
      0
    );

    const points: LineChartPoint[] = [...country.participations]
      .sort((a, b) => a.year - b.year)
      .map((participation) => ({
        label: participation.year.toString(),
        value: participation.medalsCount,
      }));

    return {
      status: 'ready',
      country,
      countryName: country.country,
      entries,
      totalMedals,
      totalAthletes,
      points,
    };
  }
}
