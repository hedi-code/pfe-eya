import { Component } from '@angular/core';
import { TestService } from '../../../services/test.service';
import { SupabaseService } from '../../../services/supabase.service';
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
  currentUserId: string = '';
  currentUserRole: string = '';
  assignedTestSuiteIds: string[] = [];

  newSuite = { name: '', selenium_script_url: '', description: '' };
  newTest = { test_suite_id: '', selenium_job_id: '', results: {}, error_message: '' };

  constructor(
    private testService: TestService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.getCurrentUser();
    await this.loadSuites();
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabaseService.supabase.auth.getUser();
    if (user) {
      this.currentUserId = user.id;
      const { data: profile } = await this.testService.getProfileById(user.id);
      if (profile) {
        this.currentUserRole = profile.role;
      }
    }
  }
selectedSuite: any = null;

selectSuite(id: string) {
  this.selectedSuiteId = id;
  this.selectedSuite = this.testSuites.find(s => s.id === id);
  this.loadTestsForSuite(id);
}

  async loadSuites() {
    // First get all test suites
    const { data, error } = await this.testService.getTestSuites();
    if (!error) {
      const allSuites = data || [];

      // If user is a tester, filter to show only assigned tests
      if (this.currentUserRole === 'tester') {
        // Get assigned test suite IDs for this tester
        const { data: assignments } = await this.testService.getAssignmentsByTesterId(this.currentUserId);
        if (assignments) {
          this.assignedTestSuiteIds = assignments.map((a: any) => a.test_suite_id);
          // Filter suites to only show assigned ones
          this.testSuites = allSuites.filter((suite: any) =>
            this.assignedTestSuiteIds.includes(suite.id)
          );
        } else {
          this.testSuites = [];
        }
      } else {
        // Admin sees all test suites
        this.testSuites = allSuites;
      }
    }
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