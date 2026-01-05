import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JenkinsService, JenkinsJob, JenkinsBuild, JenkinsCredentials, JenkinsProject } from '../../services/jenkins.service';

@Component({
  selector: 'app-jenkins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jenkins.component.html',
  styleUrls: ['./jenkins.component.scss']
})
export class JenkinsComponent implements OnInit {
  jobInfo: JenkinsJob | null = null;
  builds: JenkinsBuild[] = [];
  selectedBuild: JenkinsBuild | null = null;
  consoleOutput: string = '';
  testResults: any = null;
  loading = false;
  error: string | null = null;
  showCredentialsForm = false;
  showBuildDialog = false;
  showProjectDialog = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  credentials: JenkinsCredentials = {
    username: '',
    token: '',
    baseUrl: 'http://localhost:8080'
  };

  projects: JenkinsProject[] = [];
  selectedProject: JenkinsProject | null = null;

  newProject: JenkinsProject = {
    id: '',
    name: '',
    jobName: '',
    description: ''
  };

  buildParameters: { [key: string]: string } = {};

  constructor(private jenkinsService: JenkinsService) {}

  ngOnInit(): void {
    this.jenkinsService.credentials$.subscribe(credentials => {
      if (credentials) {
        this.credentials = credentials;
        this.showCredentialsForm = false;
        this.loadJobInfo();
      } else {
        this.showCredentialsForm = true;
      }
    });

    this.jenkinsService.projects$.subscribe(projects => {
      this.projects = projects;
    });

    this.jenkinsService.selectedProject$.subscribe(project => {
      this.selectedProject = project;
      if (project) {
        this.loadJobInfo();
      }
    });
  }

  saveCredentials(): void {
    if (this.credentials.username && this.credentials.token && this.credentials.baseUrl) {
      this.jenkinsService.setCredentials(this.credentials);
      this.loadJobInfo();
    } else {
      this.error = 'Please fill in all credential fields';
    }
  }

  clearCredentials(): void {
    this.jenkinsService.clearCredentials();
    this.showCredentialsForm = true;
    this.jobInfo = null;
    this.builds = [];
    this.selectedBuild = null;
  }

  loadJobInfo(): void {
    this.loading = true;
    this.error = null;

    this.jenkinsService.getJobInfo().subscribe({
      next: (job) => {
        this.jobInfo = job;
        this.loadBuilds();
        this.showToastMessage('Connexion réussie à Jenkins', 'success');
      },
      error: (err) => {
        this.error = this.getErrorMessage(err);
        this.loading = false;

        // Show toast for authentication errors
        if (err.status === 401 || err.status === 403) {
          this.showToastMessage('Identifiants incorrects. Veuillez vérifier votre nom d\'utilisateur et token.', 'error');
        } else {
          this.showToastMessage('Erreur de connexion à Jenkins', 'error');
        }
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  closeToast(): void {
    this.showToast = false;
  }

  loadBuilds(): void {
    if (!this.jobInfo?.builds) {
      this.loading = false;
      return;
    }

    // Clear existing builds to avoid duplicates
    this.builds = [];

    const buildRequests = this.jobInfo.builds.slice(0, 10).map(build =>
      this.jenkinsService.getBuildInfo(build.number)
    );

    // Load builds sequentially to avoid overwhelming the API
    this.loadBuildSequentially(buildRequests, 0);
  }

  private loadBuildSequentially(buildRequests: any[], index: number): void {
    if (index >= buildRequests.length) {
      this.loading = false;
      return;
    }

    buildRequests[index].subscribe({
      next: (build: JenkinsBuild) => {
        this.builds.push(build);
        this.builds.sort((a, b) => b.number - a.number);
        this.loadBuildSequentially(buildRequests, index + 1);
      },
      error: (err: any) => {
        console.error(`Error loading build ${index}:`, err);
        this.loadBuildSequentially(buildRequests, index + 1);
      }
    });
  }

  selectBuild(build: JenkinsBuild): void {
    this.selectedBuild = build;
    this.loadConsoleOutput(build.number);
    this.loadTestResults(build.number);
  }

  loadConsoleOutput(buildNumber: number): void {
    this.jenkinsService.getBuildConsoleOutput(buildNumber).subscribe({
      next: (output) => {
        this.consoleOutput = output;
      },
      error: (err) => {
        console.error('Error loading console output:', err);
        this.consoleOutput = 'Error loading console output';
      }
    });
  }

  loadTestResults(buildNumber: number): void {
    this.jenkinsService.getTestResults(buildNumber).subscribe({
      next: (results) => {
        this.testResults = results;
      },
      error: (err) => {
        console.error('Error loading test results:', err);
        this.testResults = null;
      }
    });
  }

  getArtifactUrl(buildNumber: number, artifactPath: string): string {
    return this.jenkinsService.getArtifactUrl(buildNumber, artifactPath);
  }

  downloadArtifact(buildNumber: number, artifactPath: string): void {
    const url = this.getArtifactUrl(buildNumber, artifactPath);
    window.open(url, '_blank');
  }

  openBuildDialog(): void {
    this.showBuildDialog = true;
  }

  closeBuildDialog(): void {
    this.showBuildDialog = false;
    this.buildParameters = {};
  }

  triggerNewBuild(): void {
    this.loading = true;
    this.error = null;

    this.jenkinsService.triggerBuild(this.buildParameters).subscribe({
      next: () => {
        this.closeBuildDialog();
        this.showToastMessage('Build lancé avec succès', 'success');
        setTimeout(() => {
          this.loadJobInfo();
        }, 2000);
      },
      error: (err) => {
        this.error = this.getErrorMessage(err);
        this.loading = false;
        this.showToastMessage('Erreur lors du lancement du build', 'error');
      }
    });
  }

  getBuildStatusColor(result: string | null, building: boolean): string {
    if (building) return 'bg-blue-500';
    if (!result) return 'bg-gray-400';

    // Override result based on test results if available
    const effectiveResult = this.getEffectiveBuildResult(result);

    switch (effectiveResult) {
      case 'SUCCESS':
        return 'bg-green-500';
      case 'FAILURE':
        return 'bg-red-500';
      case 'UNSTABLE':
        return 'bg-yellow-500';
      case 'ABORTED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  }

  getBuildStatusText(result: string | null, building: boolean): string {
    if (building) return 'Building...';

    // Override result based on test results if available
    const effectiveResult = this.getEffectiveBuildResult(result);
    return effectiveResult || 'Unknown';
  }

  /**
   * Determine the effective build result based on test results
   * If tests passed and no tests failed, mark as SUCCESS
   */
  private getEffectiveBuildResult(originalResult: string | null): string | null {
    // If we have test results for the selected build
    if (this.testResults && this.selectedBuild) {
      const hasPassedTests = this.testResults.passCount > 0;
      const hasNoFailedTests = this.testResults.failCount === 0;

      // If tests passed and no tests failed, override to SUCCESS
      if (hasPassedTests && hasNoFailedTests) {
        return 'SUCCESS';
      }
    }

    // Otherwise, return the original result from Jenkins
    return originalResult;
  }

  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  refresh(): void {
    this.loadJobInfo();
  }

  onProjectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const projectId = selectElement.value;
    const project = this.projects.find(p => p.id === projectId);

    if (project) {
      this.jenkinsService.selectProject(project);
      this.builds = [];
      this.selectedBuild = null;
      this.consoleOutput = '';
      this.testResults = null;
    }
  }

  openProjectDialog(): void {
    this.showProjectDialog = true;
    this.newProject = {
      id: '',
      name: '',
      jobName: '',
      description: ''
    };
  }

  closeProjectDialog(): void {
    this.showProjectDialog = false;
  }

  addProject(): void {
    if (!this.newProject.name || !this.newProject.jobName) {
      this.showToastMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    // Generate ID from job name
    this.newProject.id = this.newProject.jobName.toLowerCase().replace(/\s+/g, '-');

    // Check if project already exists
    if (this.projects.some(p => p.id === this.newProject.id)) {
      this.showToastMessage('Un projet avec ce nom existe déjà', 'error');
      return;
    }

    this.jenkinsService.addProject({ ...this.newProject });
    this.showToastMessage('Projet ajouté avec succès', 'success');
    this.closeProjectDialog();

    // Select the newly added project
    this.jenkinsService.selectProject(this.newProject);
  }

  removeProject(projectId: string): void {
    if (this.projects.length <= 1) {
      this.showToastMessage('Impossible de supprimer le dernier projet', 'error');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.jenkinsService.removeProject(projectId);
      this.showToastMessage('Projet supprimé avec succès', 'success');
    }
  }

  private getErrorMessage(err: any): string {
    if (err.status === 401) {
      return 'Authentication failed. Please check your credentials.';
    } else if (err.status === 403) {
      return 'Access denied. Please check your permissions.';
    } else if (err.status === 404) {
      return 'Jenkins job not found. Please check the URL.';
    } else if (err.status === 0) {
      return 'Cannot connect to Jenkins. Please check if Jenkins is running and the URL is correct.';
    }
    return err.message || 'An error occurred while connecting to Jenkins.';
  }
}
