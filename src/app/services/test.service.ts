import { Injectable } from '@angular/core';
import { SupabaseClient, User, createClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TestService {
 public supabase: SupabaseClient;
  public user$ = new BehaviorSubject<User | null>(null);

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.supabase;
  }
async createUser(user: { email: string, password: string, full_name: string, role: string }) {
  // 1. Create auth user
  const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error('Failed to create auth user:', authError);
    return { error: authError };
  }

  // 2. Insert into profiles table
  const { error: profileError } = await this.supabase.from('profiles').insert({
    id: authData.user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  });

  if (profileError) {
    console.error('Failed to insert into profiles:', profileError);
    return { error: profileError };
  }

  return { success: true };
}

   async getProfiles() {
    return this.supabase.from('profiles').select('*');
  }

  async getProfileById(id: string) {
    return this.supabase.from('profiles').select('*').eq('id', id).single();
  }

  async updateProfile(id: string, updates: any) {
    return this.supabase.from('profiles').update(updates).eq('id', id);
  }

  async deleteProfile(id: string) {
    return this.supabase.from('profiles').delete().eq('id', id);
  }

  // ---------- Test Suites ----------
  async getTestSuites() {
    return this.supabase.from('test_suites').select('*');
  }

  async getTestSuiteById(id: string) {
    return this.supabase.from('test_suites').select('*').eq('id', id).single();
  }

  async createTestSuite(suite: any) {
    return this.supabase.from('test_suites').insert([suite]);
  }

  async updateTestSuite(id: string, updates: any) {
    return this.supabase.from('test_suites').update(updates).eq('id', id);
  }

  async deleteTestSuite(id: string) {
    return this.supabase.from('test_suites').delete().eq('id', id);
  }

  // ---------- Test Executions ----------
  async getTestExecutions() {
    return this.supabase.from('test_executions').select('*');
  }

  async getTestExecutionById(id: string) {
    return this.supabase.from('test_executions').select('*').eq('id', id).single();
  }

  async createTestExecution(execution: any) {
    return this.supabase.from('test_executions').insert([execution]);
  }

  async updateTestExecution(id: string, updates: any) {
    return this.supabase.from('test_executions').update(updates).eq('id', id);
  }

  async deleteTestExecution(id: string) {
    return this.supabase.from('test_executions').delete().eq('id', id);
  }

  // ---------- Test Results ----------
  async getTestResults() {
    return this.supabase.from('test_results').select('*');
  }

  async getTestResultsByExecutionId(execution_id: string) {
    return this.supabase.from('test_results').select('*').eq('execution_id', execution_id);
  }

  async createTestResult(result: any) {
    return this.supabase.from('test_results').insert([result]);
  }

  async updateTestResult(id: string, updates: any) {
    return this.supabase.from('test_results').update(updates).eq('id', id);
  }

  async deleteTestResult(id: string) {
    return this.supabase.from('test_results').delete().eq('id', id);
  }
}