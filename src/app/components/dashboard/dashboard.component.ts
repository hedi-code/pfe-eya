import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service'
import { Router } from '@angular/router';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { TesterDashboardComponent } from './tester-dashboard/tester-dashboard.component'


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TesterDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user$ = new BehaviorSubject<User | null>(null);

  constructor(private supabase: SupabaseService, private router: Router) {
    this.user$ = supabase.user$;
  }

  ngOnInit(): void {
    this.user$ = this.supabase.user$;
  }

  logout() {
    this.supabase.signOut().then(() => this.router.navigate(['/login']));
  }
}
