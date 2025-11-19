import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loginInProgress = false;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Listen to auth state changes safely
  
  }

  async onSubmit() {
    if (this.loginForm.invalid || this.loginInProgress) return;

    this.loginInProgress = true;

    try {
      // Sign in with Supabase
      const result = await this.supabase.signIn(
        this.loginForm.value.email,
        this.loginForm.value.password
      );

      if (result && result.user) {
        // Get user role
        const role = await this.supabase.getUserRole(result.user.id);
        console.log('User role:', role);

        // Show success toast
        this.toastr.success('Connexion réussie ! Bienvenue.', 'Succès');

        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // Login failed - invalid credentials
        this.toastr.error('Email ou mot de passe incorrect.', 'Erreur de connexion');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.toastr.error('Une erreur est survenue lors de la connexion.', 'Erreur');
    } finally {
      this.loginInProgress = false;
    }
  }
}
