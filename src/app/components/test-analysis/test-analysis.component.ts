import { Component, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { TestService } from '../../services/test.service';
import { CommonModule } from '@angular/common';

interface TestExecution {
  id: string;
  test_suite_id: string;
  executed_by: string;
  status: string;
  executed_at: string;
  notes?: string;
}

interface TestResult {
  id: string;
  execution_id: string;
  test_case_name: string;
  status: string;
  executed_at: string;
  error_message?: string;
}

@Component({
  selector: 'app-test-analysis',
  imports: [NgChartsModule, CommonModule],
  templateUrl: './test-analysis.component.html',
  styleUrl: './test-analysis.component.scss'
})
export class TestAnalysisComponent implements OnInit {
  loading = true;
  error: string | null = null;

  // Pie Chart - Distribution
  pieChartLabels: string[] = ['Tests OK', 'Tests KO'];
  pieChartData: ChartData<'pie'> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#22c55e', '#ef4444'],
      },
    ],
  };

  // Bar Chart - OK/KO per day
  barChartLabels: string[] = [];
  barChartData: ChartData<'bar'>['datasets'] = [
    {
      label: 'Tests OK',
      data: [],
      backgroundColor: '#22c55e',
    },
    {
      label: 'Tests KO',
      data: [],
      backgroundColor: '#ef4444',
    },
  ];

  // Line Chart - Total executed per day
  lineChartLabels: string[] = [];
  lineChartData: ChartData<'line'>['datasets'] = [
    {
      label: 'Tests exécutés',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
    },
  ];

  constructor(private testService: TestService) {}

  async ngOnInit() {
    await this.loadTestStatistics();
  }

  async loadTestStatistics() {
    try {
      this.loading = true;
      this.error = null;

      // Fetch test results from the database
      const { data: testResults, error } = await this.testService.getTestResults();

      if (error) {
        throw error;
      }

      if (!testResults || testResults.length === 0) {
        this.error = 'Aucune donnée de test disponible';
        this.loading = false;
        return;
      }

      // Process the data for charts
      this.processPieChartData(testResults);
      this.processBarChartData(testResults);
      this.processLineChartData(testResults);

      this.loading = false;
    } catch (err: any) {
      console.error('Error loading test statistics:', err);
      this.error = 'Erreur lors du chargement des statistiques';
      this.loading = false;
    }
  }

  private processPieChartData(testResults: TestResult[]) {
    const passedTests = testResults.filter(t => t.status === 'passed' || t.status === 'success').length;
    const failedTests = testResults.filter(t => t.status === 'failed' || t.status === 'error').length;

    this.pieChartData = {
      labels: this.pieChartLabels,
      datasets: [
        {
          data: [passedTests, failedTests],
          backgroundColor: ['#22c55e', '#ef4444'],
        },
      ],
    };
  }

  private processBarChartData(testResults: TestResult[]) {
    // Group tests by day of the week for the last 7 days
    const dailyStats = this.groupTestsByDay(testResults, 7);

    this.barChartLabels = dailyStats.labels;
    this.barChartData = [
      {
        label: 'Tests OK',
        data: dailyStats.passed,
        backgroundColor: '#22c55e',
      },
      {
        label: 'Tests KO',
        data: dailyStats.failed,
        backgroundColor: '#ef4444',
      },
    ];
  }

  private processLineChartData(testResults: TestResult[]) {
    // Group tests by day for total execution count
    const dailyStats = this.groupTestsByDay(testResults, 7);

    this.lineChartLabels = dailyStats.labels;
    this.lineChartData = [
      {
        label: 'Tests exécutés',
        data: dailyStats.total,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
      },
    ];
  }

  private groupTestsByDay(testResults: TestResult[], days: number) {
    const labels: string[] = [];
    const passed: number[] = [];
    const failed: number[] = [];
    const total: number[] = [];

    const today = new Date();
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    // Create an array of the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Filter tests for this day
      const testsForDay = testResults.filter(test => {
        const testDate = new Date(test.executed_at);
        return testDate >= date && testDate < nextDate;
      });

      const passedCount = testsForDay.filter(t => t.status === 'passed' || t.status === 'success').length;
      const failedCount = testsForDay.filter(t => t.status === 'failed' || t.status === 'error').length;

      // Use day name for label
      const dayName = dayNames[date.getDay()];
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;

      labels.push(`${dayName} ${dateStr}`);
      passed.push(passedCount);
      failed.push(failedCount);
      total.push(testsForDay.length);
    }

    return { labels, passed, failed, total };
  }
}
