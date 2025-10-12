import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { PieChartSlice } from '../../models/olympic.model';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent {
  @Input() slices: PieChartSlice[] = [];
  @Output() sliceClick = new EventEmitter<PieChartSlice>();

  readonly colorScheme: Color = {
    name: 'countryMedals',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
    ],
  };

  get chartData(): { name: string; value: number }[] {
    return this.slices.map((slice) => ({
      name: slice.label,
      value: slice.value,
    }));
  }

  onSelect(event: { name: string }): void {
    const slice = this.slices.find((item) => item.label === event.name);
    if (slice) {
      this.sliceClick.emit(slice);
    }
  }
}
