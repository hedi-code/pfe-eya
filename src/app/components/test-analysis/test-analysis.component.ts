import { Component } from '@angular/core';
import { ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-test-analysis',
  imports: [NgChartsModule],
  templateUrl: './test-analysis.component.html',
  styleUrl: './test-analysis.component.scss'
})
export class TestAnalysisComponent {
// Pie Chart - Distribution
  pieChartLabels: string[] = ['Tests OK', 'Tests KO'];
  pieChartData: ChartData<'pie'> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [75, 25],
        backgroundColor: ['#22c55e', '#ef4444'],
      },
    ],
  };

  // Bar Chart - OK/KO per day
  barChartLabels: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  barChartData: ChartData<'bar'>['datasets'] = [
    {
      label: 'Tests OK',
      data: [12, 19, 14, 20, 18],
      backgroundColor: '#22c55e',
    },
    {
      label: 'Tests KO',
      data: [3, 2, 5, 1, 4],
      backgroundColor: '#ef4444',
    },
  ];

  // Line Chart - Total executed per day
  lineChartLabels: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  lineChartData: ChartData<'line'>['datasets'] = [
    {
      label: 'Tests exécutés',
      data: [15, 21, 19, 21, 22],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
    },
  ];
}
