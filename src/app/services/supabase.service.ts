import { Injectable } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;
  public user$ = new BehaviorSubject<User | null>(null);
signingIn = false;

  constructor() {
    this.supabase = createClient(
      'https://aogtreiqhhyjrzsltadg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ3RyZWlxaGh5anJ6c2x0YWRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3NjYzNywiZXhwIjoyMDcwNzUyNjM3fQ.qkhBPfWFQ0khKaDqxez5FDFbLS9zoSzJxVO6gKxPLzk'
    );
 // Initialize current user

    // Listen to auth changes safely
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user$.next(session?.user ?? null);
    });
  }


  // Sign up
  async signUp(email: string, password: string, role: string): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Wait for session

      if (data.user?.id) {
        await this.supabase
          .from('profiles')
          .insert([{ id: data.user.id, role: role.trim().toLowerCase() }]);
      }
      return {
        user: data.user ?? null,
        session: data.session ?? null
      };
    } catch (err: any) {
      console.error('SignUp Error:', err);
      return { user: null, session: null };
    }
  }

async signIn(email: string, password: string) {
  if (this.signingIn) return; // prevent duplicate calls
  this.signingIn = true;

  try {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session?.user.id)
      .single();

    if (profile && profile.data?.role) {
      const role = profile.data?.role;
      data.user.role = role;
this.user$.next({ ...data.user } as any); // optional cast
    }
else{

  this.user$.next(data.user ?? null);
}

    return {
      user: data.user ?? null,
      session: data.session ?? null,
    };
  } catch (err) {
    console.error('SignIn Error:', err);
    return { user: null, session: null };
  } finally {
    this.signingIn = false;
  }
}

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      this.user$.next(null);
    } catch (err: any) {
      console.error('SignOut Error:', err);
    }
  }

  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data?.role ?? null;
    } catch (err) {
      console.error('GetUserRole Error:', err);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.user$.value;
  }

}