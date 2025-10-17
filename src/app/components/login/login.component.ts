import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loginInProgress = false;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router
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
      // Just trigger login; do NOT immediately redirect
      await this.supabase.signIn(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
        this.supabase.supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      if (user) {
        try {
          const role = await this.supabase.getUserRole(user.id);
          console.log('User role:', role);

          // Redirect based on role
        
         this.router.navigate(['/dashboard']);
        } catch (err) {
          this.errors.push(JSON.stringify(err))
          console.log(this.errors)
        }
      }
    });
    } catch (error: any) {          
      this.errors.push(JSON.stringify(error))
      console.log(this.errors)
    } finally {
      this.loginInProgress = false;
    }
  }
}
