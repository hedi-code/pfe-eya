import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService } from '../../services/test.service';
import { SupabaseService } from '../../services/supabase.service';
import { ToastrService } from 'ngx-toastr';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Tester {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface TestAssignment {
  id: string;
  test_suite_id: string;
  tester_id: string;
  assigned_by: string;
  assigned_at: string;
  status: string;
  due_date?: string;
  notes?: string;
  test_suite?: TestSuite;
  tester?: Tester;
  assigner?: Tester;
}

@Component({
  selector: 'app-test-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-assignment.component.html',
  styleUrls: ['./test-assignment.component.scss']
})
export class TestAssignmentComponent implements OnInit {
  testSuites: TestSuite[] = [];
  testers: Tester[] = [];
  assignments: TestAssignment[] = [];
  currentUserId: string = '';

  // Modal state
  showAssignModal = false;
  selectedTestSuite: TestSuite | null = null;
  selectedTesterId: string = '';
  dueDate: string = '';
  notes: string = '';

  // Filter
  filterStatus: string = 'all';
  searchTerm: string = '';

  // Loading states
  isLoading = false;
  isSaving = false;

  constructor(
    private testService: TestService,
    private supabaseService: SupabaseService,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    await this.getCurrentUser();
    await this.loadData();
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await this.supabaseService.supabase.auth.getUser();
      if (user) {
        this.currentUserId = user.id;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }

  async loadData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadTestSuites().catch(err => {
          console.error('Failed to load test suites:', err);
          this.testSuites = [];
        }),
        this.loadTesters().catch(err => {
          console.error('Failed to load testers:', err);
          this.testers = [];
        }),
        this.loadAssignments().catch(err => {
          console.error('Failed to load assignments:', err);
          this.assignments = [];
        })
      ]);
    } finally {
      this.isLoading = false;
    }
  }

  async loadTestSuites() {
    const { data, error } = await this.testService.getTestSuites();
    if (!error && data) {
      this.testSuites = data;
    } else {
      console.error('Error loading test suites:', error);
      this.testSuites = [];
    }
  }

  async loadTesters() {
    const { data, error } = await this.testService.getTestersByRole();
    if (!error && data) {
      this.testers = data;
    } else {
      console.error('Error loading testers:', error);
      this.testers = [];
    }
  }

  async loadAssignments() {
    const { data, error } = await this.testService.getTestAssignments();
    if (!error && data) {
      this.assignments = data;
    } else {
      console.error('Error loading assignments:', error);
      this.assignments = [];
    }
  }

  openAssignModal(suite: TestSuite) {
    this.selectedTestSuite = suite;
    this.selectedTesterId = '';
    this.dueDate = '';
    this.notes = '';
    this.showAssignModal = true;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedTestSuite = null;
    this.selectedTesterId = '';
    this.dueDate = '';
    this.notes = '';
  }

  async assignTest() {
    if (!this.selectedTestSuite || !this.selectedTesterId) {
      this.toastr.warning('Veuillez sélectionner un testeur.', 'Attention');
      return;
    }

    // Check if already assigned
    const existingAssignment = this.assignments.find(
      a => a.test_suite_id === this.selectedTestSuite!.id &&
           a.tester_id === this.selectedTesterId &&
           a.status !== 'cancelled'
    );

    if (existingAssignment) {
      this.toastr.warning('Ce test est déjà assigné à ce testeur.', 'Attention');
      return;
    }

    this.isSaving = true;

    const assignment = {
      test_suite_id: this.selectedTestSuite.id,
      tester_id: this.selectedTesterId,
      assigned_by: this.currentUserId,
      due_date: this.dueDate || undefined,
      notes: this.notes || undefined
    };

    const { error } = await this.testService.assignTestToTester(assignment);

    if (error) {
      console.error('Error assigning test:', error);
      this.toastr.error('Erreur lors de l\'assignation du test.', 'Erreur');
    } else {
      this.toastr.success('Le test a été assigné avec succès au testeur.', 'Succès');
      await this.loadAssignments();
      this.closeAssignModal();
    }

    this.isSaving = false;
  }

  async deleteAssignment(assignmentId: string) {
    if (!confirm('Voulez-vous vraiment supprimer cette assignation?')) {
      return;
    }

    const { error } = await this.testService.deleteAssignment(assignmentId);

    if (error) {
      console.error('Error deleting assignment:', error);
      this.toastr.error('Erreur lors de la suppression de l\'assignation.', 'Erreur');
    } else {
      this.toastr.success('L\'assignation a été supprimée avec succès.', 'Succès');
      await this.loadAssignments();
    }
  }

  async updateStatus(assignmentId: string, newStatus: string) {
    const { error } = await this.testService.updateAssignmentStatus(assignmentId, newStatus);

    if (error) {
      console.error('Error updating status:', error);
      this.toastr.error('Erreur lors de la mise à jour du statut.', 'Erreur');
    } else {
      this.toastr.success('Le statut a été mis à jour avec succès.', 'Succès');
      await this.loadAssignments();
    }
  }

  getAssignmentsForSuite(suiteId: string): TestAssignment[] {
    return this.assignments.filter(a => a.test_suite_id === suiteId);
  }

  getFilteredTestSuites(): TestSuite[] {
    if (!this.searchTerm) {
      return this.testSuites;
    }
    const term = this.searchTerm.toLowerCase();
    return this.testSuites.filter(suite =>
      suite.name.toLowerCase().includes(term) ||
      suite.description?.toLowerCase().includes(term)
    );
  }

  getFilteredAssignments(): TestAssignment[] {
    let filtered = this.assignments;

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === this.filterStatus);
    }

    return filtered;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'assigned':
        return 'badge-assigned';
      case 'in_progress':
        return 'badge-progress';
      case 'completed':
        return 'badge-completed';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'assigned':
        return 'Assigné';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  trackByAssignmentId(index: number, assignment: TestAssignment): string {
    return assignment.id;
  }

  trackBySuiteId(index: number, suite: TestSuite): string {
    return suite.id;
  }
}
