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
  try {
    // 1. Create auth user using signUp (which doesn't require admin)
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: user.email,
      password: user.password,
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
  } catch (err) {
    console.error('Error creating user:', err);
    return { error: err };
  }
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

  // ---------- Test Assignments ----------
  async getTestAssignments() {
    return this.supabase
      .from('test_assignments')
      .select(`
        *,
        test_suite:test_suites(*),
        tester:profiles!test_assignments_tester_id_fkey(id, email, full_name),
        assigner:profiles!test_assignments_assigned_by_fkey(id, email, full_name)
      `)
      .order('assigned_at', { ascending: false });
  }

  async getAssignmentsByTesterId(testerId: string) {
    return this.supabase
      .from('test_assignments')
      .select(`
        *,
        test_suite:test_suites(*)
      `)
      .eq('tester_id', testerId)
      .order('assigned_at', { ascending: false });
  }

  async getAssignmentsByTestSuiteId(testSuiteId: string) {
    return this.supabase
      .from('test_assignments')
      .select(`
        *,
        tester:profiles!test_assignments_tester_id_fkey(id, email, full_name)
      `)
      .eq('test_suite_id', testSuiteId);
  }

  async assignTestToTester(assignment: {
    test_suite_id: string;
    tester_id: string;
    assigned_by: string;
    due_date?: string;
    notes?: string;
  }) {
    return this.supabase.from('test_assignments').insert([{
      test_suite_id: assignment.test_suite_id,
      tester_id: assignment.tester_id,
      assigned_by: assignment.assigned_by,
      due_date: assignment.due_date,
      notes: assignment.notes,
      status: 'assigned'
    }]);
  }

  async updateAssignmentStatus(id: string, status: string) {
    return this.supabase
      .from('test_assignments')
      .update({ status })
      .eq('id', id);
  }

  async updateAssignment(id: string, updates: any) {
    return this.supabase
      .from('test_assignments')
      .update(updates)
      .eq('id', id);
  }

  async deleteAssignment(id: string) {
    return this.supabase.from('test_assignments').delete().eq('id', id);
  }

  async getTestersByRole() {
    return this.supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('role', 'tester')
      .order('full_name');
  }
}