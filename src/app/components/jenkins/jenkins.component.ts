import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JenkinsService, JenkinsJob, JenkinsBuild, JenkinsCredentials } from '../../services/jenkins.service';

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

  credentials: JenkinsCredentials = {
    username: '',
    token: '',
    baseUrl: 'http://localhost:8080/job/brain-tests'
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
      },
      error: (err) => {
        this.error = this.getErrorMessage(err);
        this.loading = false;
      }
    });
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
        setTimeout(() => {
          this.loadJobInfo();
        }, 2000);
      },
      error: (err) => {
        this.error = this.getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  getBuildStatusColor(result: string | null, building: boolean): string {
    if (building) return 'bg-blue-500';
    if (!result) return 'bg-gray-400';

    switch (result) {
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
    return result || 'Unknown';
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
