import { Component } from '@angular/core';
import { TestService } from '../../../services/test.service';
import { CommonModule } from '@angular/common';     // Required for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';       // Required for [(ngModel)]

@Component({
  selector: 'app-tester-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './tester-dashboard.component.html',
  styleUrl: './tester-dashboard.component.scss',
    standalone: true,

})
export class TesterDashboardComponent {
testSuites: any[] = [];
  selectedSuiteId: string | null = null;
  testExecutions: any[] = [];

  newSuite = { name: '', selenium_script_url: '', description: '' };
  newTest = { test_suite_id: '', selenium_job_id: '', results: {}, error_message: '' };

  constructor(private testService: TestService) {}

  async ngOnInit() {
    await this.loadSuites();
  }
selectedSuite: any = null;

selectSuite(id: string) {
  this.selectedSuiteId = id;
  this.selectedSuite = this.testSuites.find(s => s.id === id);
  this.loadTestsForSuite(id);
}

  async loadSuites() {
    const { data, error } = await this.testService.getTestSuites();
    if (!error) this.testSuites = data || [];
  }

  async loadTestsForSuite(suiteId: string) {
    this.selectedSuiteId = suiteId;
    const { data, error } = await this.testService.supabase
      .from('test_executions')
      .select('*')
      .eq('test_suite_id', suiteId);
    if (!error) this.testExecutions = data || [];
  }

  async createTestSuite() {
    const { error } = await this.testService.createTestSuite(this.newSuite);
    if (!error) {
      this.newSuite = { name: '', selenium_script_url: '', description: '' };
      await this.loadSuites();
    }
  }

  async deleteTestSuite(id: string) {
    await this.testService.deleteTestSuite(id);
    await this.loadSuites();
    this.testExecutions = [];
    this.selectedSuiteId = null;
  }

  async createTestExecution() {
    this.newTest.test_suite_id = this.selectedSuiteId!;
    const { error } = await this.testService.createTestExecution(this.newTest);
    if (!error) {
      this.newTest = { test_suite_id: '', selenium_job_id: '', results: {}, error_message: '' };
      if (this.selectedSuiteId) await this.loadTestsForSuite(this.selectedSuiteId);
    }
  }

  async deleteTestExecution(id: string) {
    await this.testService.deleteTestExecution(id);
    if (this.selectedSuiteId) await this.loadTestsForSuite(this.selectedSuiteId);
  }

  trackBySuiteId(index: number, suite: any): any {
    return suite.id;
  }

  trackByTestId(index: number, test: any): any {
    return test.id;
  }
}