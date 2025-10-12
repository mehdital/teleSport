import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OlympicService } from 'src/app/core/services/olympic.service';
import {
  OlympicCountry,
  PieChartSlice,
} from 'src/app/shared/models/olympic.model';

interface DashboardState {
  status: 'loading' | 'error' | 'ready';
  slices: PieChartSlice[];
  numberOfJos: number;
  numberOfCountries: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public state$: Observable<DashboardState> = of({
    status: 'loading',
    slices: [],
    numberOfJos: 0,
    numberOfCountries: 0,
  });

  constructor(
    private olympicService: OlympicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.state$ = this.olympicService.getOlympics().pipe(
      map((countries) => this.buildDashboardState(countries))
    );
  }

  onSliceClick(slice: PieChartSlice): void {
    const countryId = slice.meta?.['id'] as number | undefined;
    if (countryId) {
      this.router.navigate(['/country', countryId]);
    }
  }

  private buildDashboardState(
    countries: OlympicCountry[] | null | undefined
  ): DashboardState {
    if (countries === undefined) {
      return {
        status: 'loading',
        slices: [],
        numberOfJos: 0,
        numberOfCountries: 0,
      };
    }

    if (countries === null) {
      return {
        status: 'error',
        slices: [],
        numberOfJos: 0,
        numberOfCountries: 0,
      };
    }

    const uniqueYears = new Set<number>();
    const slices = countries.map((country): PieChartSlice => {
      const medals = country.participations.reduce(
        (acc, participation) => {
          uniqueYears.add(participation.year);
          return acc + participation.medalsCount;
        },
        0
      );
      return {
        label: country.country,
        value: medals,
        meta: { id: country.id },
      };
    });

    return {
      status: 'ready',
      slices,
      numberOfJos: uniqueYears.size,
      numberOfCountries: countries.length,
    };
  }
}
