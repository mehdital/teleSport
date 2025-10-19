import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { PieChartSlice } from '../../models/olympic.model';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements AfterViewInit, OnDestroy {
  @Input() slices: PieChartSlice[] = [];
  @Output() sliceClick = new EventEmitter<PieChartSlice>();
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef<HTMLDivElement>;

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

  chartView: [number, number] = [360, 288];
  private resizeObserver?: ResizeObserver;
  private readonly windowResizeHandler = () => this.updateChartDimensions();

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Set initial size once the view is ready
    setTimeout(() => this.updateChartDimensions(), 0);
    this.observeContainer();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  }

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

    const width = Math.max(Math.round(containerWidth), 180);
    const height = Math.max(240, Math.round(width * 0.75));
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
