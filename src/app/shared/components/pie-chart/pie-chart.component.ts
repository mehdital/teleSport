import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PieChartSlice } from '../../models/olympic.model';

interface ComputedSlice extends PieChartSlice {
  startAngle: number;
  endAngle: number;
  largeArcFlag: number;
  path: string;
  midAngle: number;
  labelX: number;
  labelY: number;
  percentage: number;
}

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnChanges {
  @Input() slices: PieChartSlice[] = [];
  @Input() size = 220;
  @Input() radius = 100;
  @Output() sliceClick = new EventEmitter<PieChartSlice>();
  @Output() sliceHover = new EventEmitter<PieChartSlice | null>();

  computedSlices: ComputedSlice[] = [];
  hoveredSlice: ComputedSlice | null = null;
  hoverPosition = { x: 0, y: 0 };

  private readonly palette = [
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
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slices']) {
      this.computeSlices();
    }
  }

  onSliceEnter(event: MouseEvent, slice: ComputedSlice): void {
    this.hoveredSlice = slice;
    this.updateHoverPosition(event);
    this.sliceHover.emit(slice);
  }

  onSliceMove(event: MouseEvent): void {
    if (this.hoveredSlice) {
      this.updateHoverPosition(event);
    }
  }

  onSliceLeave(): void {
    this.hoveredSlice = null;
    this.sliceHover.emit(null);
  }

  handleSliceClick(slice: ComputedSlice): void {
    this.sliceClick.emit(slice);
  }

  sliceColor(index: number, slice: PieChartSlice): string {
    return slice.color ?? this.palette[index % this.palette.length];
  }

  private computeSlices(): void {
    const total = this.slices.reduce((acc, slice) => acc + slice.value, 0);
    if (!total) {
      this.computedSlices = [];
      return;
    }

    let currentAngle = 0;
    const center = this.size / 2;
    const radius = Math.min(this.radius, center);

    this.computedSlices = this.slices.map((slice, index) => {
      const valueRatio = slice.value / total;
      const angle = valueRatio * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      currentAngle = endAngle;

      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const path = this.describeSlice(center, center, radius, startAngle, endAngle);
      const labelRadius = radius * 0.6;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);

      return {
        ...slice,
        color: this.sliceColor(index, slice),
        startAngle,
        endAngle,
        largeArcFlag,
        path,
        midAngle,
        labelX,
        labelY,
        percentage: valueRatio * 100,
      };
    });
  }

  private describeSlice(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const start = this.polarToCartesian(cx, cy, radius, endAngle);
    const end = this.polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';

    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');
  }

  private polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angleInRadians: number
  ): { x: number; y: number } {
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    };
  }

  private updateHoverPosition(event: MouseEvent): void {
    const target = event.currentTarget as SVGElement | null;
    const svgRect = target?.closest('svg')?.getBoundingClientRect();
    if (!svgRect) {
      return;
    }

    this.hoverPosition = {
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top,
    };
  }
}
