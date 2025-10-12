import { Component, Input } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { LineChartPoint } from '../../models/olympic.model';

interface LineChartSeriesEntry {
  name: string;
  value: number;
}

interface LineChartSeries {
  name: string;
  series: LineChartSeriesEntry[];
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent {
  @Input() points: LineChartPoint[] = [];

  readonly colorScheme: Color = {
    name: 'countryTrend',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#0ea5e9'],
  };

  get chartData(): LineChartSeries[] {
    const sortedPoints = [...this.points].sort(
      (a, b) => Number(a.label) - Number(b.label)
    );

    return [
      {
        name: 'Medals',
        series: sortedPoints.map((point) => ({
          name: point.label,
          value: point.value,
        })),
      },
    ];
  }
}
