import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface JenkinsCredentials {
  username: string;
  token: string;
  baseUrl: string;
}

export interface JenkinsBuild {
  number: number;
  url: string;
  result: string | null;
  timestamp: number;
  duration: number;
  building: boolean;
  displayName: string;
  description: string | null;
  artifacts: JenkinsArtifact[];
  actions: any[];
}

export interface JenkinsArtifact {
  displayPath: string;
  fileName: string;
  relativePath: string;
}

export interface JenkinsJob {
  name: string;
  url: string;
  color: string;
  lastBuild: JenkinsBuild | null;
  lastSuccessfulBuild: JenkinsBuild | null;
  lastFailedBuild: JenkinsBuild | null;
  builds: JenkinsBuild[];
  description: string | null;
}

export interface JenkinsJobResponse {
  name: string;
  url: string;
  color: string;
  description: string | null;
  lastBuild: { number: number; url: string } | null;
  lastSuccessfulBuild: { number: number; url: string } | null;
  lastFailedBuild: { number: number; url: string } | null;
  builds: { number: number; url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class JenkinsService {
  private credentialsSubject = new BehaviorSubject<JenkinsCredentials | null>(null);
  public credentials$ = this.credentialsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load credentials from localStorage if available
    const savedCredentials = localStorage.getItem('jenkinsCredentials');
    if (savedCredentials) {
      this.credentialsSubject.next(JSON.parse(savedCredentials));
    } else {
      // Set default credentials
      const defaultCredentials: JenkinsCredentials = {
        username: 'admin',
        token: 'eyaelouni',
        baseUrl: 'http://localhost:8080/job/brain-tests'
      };
      this.setCredentials(defaultCredentials);
    }
  }

  setCredentials(credentials: JenkinsCredentials): void {
    localStorage.setItem('jenkinsCredentials', JSON.stringify(credentials));
    this.credentialsSubject.next(credentials);
  }

  clearCredentials(): void {
    localStorage.removeItem('jenkinsCredentials');
    this.credentialsSubject.next(null);
  }

  getCredentials(): JenkinsCredentials | null {
    return this.credentialsSubject.value;
  }

  private getAuthHeaders(): HttpHeaders {
    const credentials = this.getCredentials();
    if (!credentials) {
      return new HttpHeaders();
    }

    const auth = btoa(`${credentials.username}:${credentials.token}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    });
  }

  private getBaseUrl(): string {
    // Use proxy path to avoid CORS issues
    return '/jenkins/job/brain-tests';
  }

  getJobInfo(): Observable<JenkinsJob> {
    const url = `${this.getBaseUrl()}/api/json?tree=name,url,color,description,builds[number,url],lastBuild[number,url],lastSuccessfulBuild[number,url],lastFailedBuild[number,url]`;
    return this.http.get<JenkinsJobResponse>(url, {
      headers: this.getAuthHeaders(),
      responseType: 'json'
    }).pipe(
      map(response => this.transformJobResponse(response)),
      catchError(error => {
        console.error('Error fetching Jenkins job:', error);
        console.error('Error details:', error.error);
        return throwError(() => error);
      })
    );
  }

  getBuildInfo(buildNumber: number): Observable<JenkinsBuild> {
    const url = `${this.getBaseUrl()}/${buildNumber}/api/json`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() }).pipe(
      map(response => this.transformBuildResponse(response)),
      catchError(error => {
        console.error('Error fetching build info:', error);
        return throwError(() => error);
      })
    );
  }

  getBuildConsoleOutput(buildNumber: number): Observable<string> {
    const url = `${this.getBaseUrl()}/${buildNumber}/consoleText`;
    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Error fetching console output:', error);
        return throwError(() => error);
      })
    );
  }

  getArtifactUrl(buildNumber: number, artifactPath: string): string {
    return `${this.getBaseUrl()}/${buildNumber}/artifact/${artifactPath}`;
  }

  getCrumb(): Observable<{ crumb: string; crumbRequestField: string }> {
    const url = '/jenkins/crumbIssuer/api/json';
    return this.http.get<any>(url, { headers: this.getAuthHeaders() }).pipe(
      map(response => ({
        crumb: response.crumb,
        crumbRequestField: response.crumbRequestField
      })),
      catchError(error => {
        console.error('Error fetching CSRF crumb:', error);
        return throwError(() => error);
      })
    );
  }

  triggerBuild(parameters?: { [key: string]: string }): Observable<any> {
    // First get the CSRF crumb
    return this.getCrumb().pipe(
      switchMap((crumbData: { crumb: string; crumbRequestField: string }) => {
        let url = `${this.getBaseUrl()}/build`;

        if (parameters && Object.keys(parameters).length > 0) {
          url = `${this.getBaseUrl()}/buildWithParameters`;
          const params = new URLSearchParams(parameters).toString();
          url = `${url}?${params}`;
        }

        // Add crumb to headers
        const headers = this.getAuthHeaders().set(crumbData.crumbRequestField, crumbData.crumb);

        return this.http.post(url, null, {
          headers: headers,
          observe: 'response'
        }).pipe(
          catchError(error => {
            console.error('Error triggering build:', error);
            return throwError(() => error);
          })
        );
      }),
      catchError(error => {
        console.error('Error in build trigger process:', error);
        return throwError(() => error);
      })
    );
  }

  private transformJobResponse(response: JenkinsJobResponse): JenkinsJob {
    return {
      name: response.name,
      url: response.url,
      color: response.color,
      description: response.description,
      lastBuild: null,
      lastSuccessfulBuild: null,
      lastFailedBuild: null,
      builds: response.builds.map(b => ({
        number: b.number,
        url: b.url,
        result: null,
        timestamp: 0,
        duration: 0,
        building: false,
        displayName: `#${b.number}`,
        description: null,
        artifacts: [],
        actions: []
      }))
    };
  }

  private transformBuildResponse(response: any): JenkinsBuild {
    return {
      number: response.number,
      url: response.url,
      result: response.result,
      timestamp: response.timestamp,
      duration: response.duration,
      building: response.building,
      displayName: response.displayName,
      description: response.description,
      artifacts: response.artifacts || [],
      actions: response.actions || []
    };
  }

  getTestResults(buildNumber: number): Observable<any> {
    const url = `${this.getBaseUrl()}/${buildNumber}/testReport/api/json`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching test results:', error);
        return throwError(() => error);
      })
    );
  }
}
