import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';     // Required for *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; 
import { SupabaseService } from '../../services/supabase.service';
import { TestService } from '../../services/test.service';

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent {
users: any[] = [];
  loading = false;
  showAddUserModal = false;

  newUser = {
    email: '',
    password: '',
    full_name: '',
    role: 'tester'
  };

  constructor(private testService: TestService) {}

  async ngOnInit() {
    await this.fetchUsers();
  }

  async fetchUsers() {
    this.loading = true;
    const { data, error } = await this.testService.getProfiles();
    this.users = data || [];
    this.loading = false;
  }

  async addUser() {
    const { error } = await this.testService.createUser(this.newUser);
    if (!error) {
      this.showAddUserModal = false;
      this.newUser = { email: '', password: '', full_name: '', role: 'tester' };
      await this.fetchUsers();
    } else {
      console.error(error);
await this.fetchUsers();    }
  }
  deleteUser(id:any){
    this.testService.deleteProfile(id);
  }
}
