import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { LineChartPoint } from '../../models/olympic.model';

interface ComputedPoint extends LineChartPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnChanges {
  @Input() points: LineChartPoint[] = [];
  @Input() width = 520;
  @Input() height = 320;

  readonly padding = { top: 24, right: 32, bottom: 48, left: 48 };

  computedPoints: ComputedPoint[] = [];
  polylinePoints = '';
  yAxisTicks: number[] = [];
  maxValue = 0;
  innerWidth = 0;
  innerHeight = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['points']) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.points?.length) {
      this.computedPoints = [];
      this.polylinePoints = '';
      this.yAxisTicks = [];
      this.maxValue = 0;
      this.innerWidth = 0;
      this.innerHeight = 0;
      return;
    }

    const sortedPoints = [...this.points].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    const values = sortedPoints.map((point) => point.value);
    const maxValue = Math.max(...values);
    const minValue = 0;

    const innerWidth = this.width - this.padding.left - this.padding.right;
    const innerHeight = this.height - this.padding.top - this.padding.bottom;
    this.innerWidth = innerWidth;
    this.innerHeight = innerHeight;
    this.maxValue = maxValue;

    const stepX =
      sortedPoints.length > 1
        ? innerWidth / (sortedPoints.length - 1)
        : innerWidth / 2;
    const valueRange = maxValue - minValue || maxValue || 1;

    this.computedPoints = sortedPoints.map((point, index) => {
      const x =
        this.padding.left +
        (sortedPoints.length === 1 ? innerWidth / 2 : index * stepX);
      const scaledValue = (point.value - minValue) / valueRange;
      const y = this.padding.top + innerHeight - scaledValue * innerHeight;

      return {
        ...point,
        x,
        y,
      };
    });

    this.polylinePoints = this.computedPoints
      .map((point) => `${point.x},${point.y}`)
      .join(' ');

    this.yAxisTicks = this.computeYAxisTicks(maxValue);
  }

  private computeYAxisTicks(maxValue: number): number[] {
    if (maxValue <= 0) {
      return [0];
    }

    const tickCount = 4;
    const tickSize = Math.ceil(maxValue / tickCount);
    return Array.from({ length: tickCount + 1 }, (_, index) => tickSize * index);
  }

  yPositionForValue(value: number): number {
    if (!this.innerHeight) {
      return this.height - this.padding.bottom;
    }
    const ratio = value / (this.maxValue || 1);
    return this.padding.top + this.innerHeight - ratio * this.innerHeight;
  }
}
