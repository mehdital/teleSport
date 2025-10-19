import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
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
export class LineChartComponent implements AfterViewInit, OnDestroy {
  @Input() points: LineChartPoint[] = [];
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef<HTMLDivElement>;

  readonly colorScheme: Color = {
    name: 'countryTrend',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#0ea5e9'],
  };

  chartView: [number, number] = [560, 320];
  private resizeObserver?: ResizeObserver;
  private readonly windowResizeHandler = () => this.updateChartDimensions();

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    setTimeout(() => this.updateChartDimensions(), 0);
    this.observeContainer();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  }

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

  private observeContainer(): void {
    if (!this.chartContainer) {
      return;
    }

    const hostElement = this.chartContainer.nativeElement;

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === hostElement) {
            const width =
              entry.contentRect?.width ?? hostElement.getBoundingClientRect().width;
            this.updateChartDimensions(width);
          }
        }
      });
      this.resizeObserver.observe(hostElement);
      return;
    }

    window.addEventListener('resize', this.windowResizeHandler, { passive: true });
  }

  private updateChartDimensions(explicitWidth?: number): void {
    if (!this.chartContainer) {
      return;
    }

    const hostElement = this.chartContainer.nativeElement;
    const containerWidth =
      explicitWidth ?? hostElement.getBoundingClientRect().width;

    if (!containerWidth) {
      return;
    }

    const width = Math.max(Math.round(containerWidth), 220);
    const height = Math.max(260, Math.round(width * 0.6));
    const nextView: [number, number] = [width, height];
    const [currentWidth, currentHeight] = this.chartView;

    if (currentWidth === nextView[0] && currentHeight === nextView[1]) {
      return;
    }

    this.ngZone.run(() => {
      this.chartView = nextView;
    });
  }
}
