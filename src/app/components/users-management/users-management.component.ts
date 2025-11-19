import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';     // Required for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { TestService } from '../../services/test.service';
import { ToastrService } from 'ngx-toastr';

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
  showEditUserModal = false;

  newUser = {
    email: '',
    password: '',
    full_name: '',
    role: 'tester'
  };

  editUser = {
    id: '',
    email: '',
    full_name: '',
    role: 'tester'
  };

  constructor(
    private testService: TestService,
    private toastr: ToastrService
  ) {}

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
      this.toastr.success('Le testeur a été créé avec succès.', 'Succès');
      this.showAddUserModal = false;
      this.newUser = { email: '', password: '', full_name: '', role: 'tester' };
      await this.fetchUsers();
    } else {
      console.error(error);
      this.toastr.error('Erreur lors de la création du testeur.', 'Erreur');
      await this.fetchUsers();
    }
  }

  openEditModal(user: any) {
    this.editUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    };
    this.showEditUserModal = true;
  }

  async updateUser() {
    if (!this.editUser.id) {
      this.toastr.error('ID utilisateur manquant.', 'Erreur');
      return;
    }

    const updates = {
      email: this.editUser.email,
      full_name: this.editUser.full_name,
      role: this.editUser.role
    };

    const { error } = await this.testService.updateProfile(this.editUser.id, updates);
    if (!error) {
      this.toastr.success('L\'utilisateur a été modifié avec succès.', 'Succès');
      this.showEditUserModal = false;
      this.editUser = { id: '', email: '', full_name: '', role: 'tester' };
      await this.fetchUsers();
    } else {
      console.error(error);
      this.toastr.error('Erreur lors de la modification de l\'utilisateur.', 'Erreur');
    }
  }

  async deleteUser(id: any) {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur?')) {
      return;
    }

    const { error } = await this.testService.deleteProfile(id);
    if (!error) {
      this.toastr.success('L\'utilisateur a été supprimé avec succès.', 'Succès');
      await this.fetchUsers();
    } else {
      console.error(error);
      this.toastr.error('Erreur lors de la suppression de l\'utilisateur.', 'Erreur');
    }
  }
}
