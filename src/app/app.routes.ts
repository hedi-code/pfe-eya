import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { TesterDashboardComponent } from './components/dashboard/tester-dashboard/tester-dashboard.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { TestAnalysisComponent } from './components/test-analysis/test-analysis.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { TestAssignmentComponent } from './components/test-assignment/test-assignment.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent , children: [
    {path:'tester-dashboard', component: TesterDashboardComponent},
    {path:'users', component: UsersManagementComponent},
    {path:'analyse', component: TestAnalysisComponent},
    {path:'chatbot', component: ChatbotComponent},
    {path:'assign-tests', component: TestAssignmentComponent}
  ]
  },
  // { path: '**', redirectTo: 'login' },
];