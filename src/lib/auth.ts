import { supabase } from './supabase';
import { User, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export class AuthService {
  // Check if email is already registered
  async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    return !!data && !error;
  }

  // Sign up with email and password - modified to use OTP
  async signUp(email: string, password: string, name: string) {
    // Check if email already exists
    const emailExists = await this.checkEmailExists(email);
    if (emailExists) {
      throw new Error('Email address is already registered');
    }

    // Generate OTP
    const otpResponse = await fetch(
      'https://swzypvvwwiqzciwemvxw.supabase.co/functions/v1/e1b30f85-8dd2-431f-b5ad-3f89f4ea15ce',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'generate', 
          email 
        })
      }
    );
    
    const otpData = await otpResponse.json();
    if (!otpData.success) {
      throw new Error(otpData.message || 'Failed to send OTP');
    }
    
    // Store user data temporarily
    localStorage.setItem('pendingUser', JSON.stringify({ email, password, name }));
    
    return { user: null, session: null };
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('pendingUser');
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }

  // Verify OTP and complete signup
  async verifyOTP(email: string, token: string) {
    // Verify OTP with our function
    const verifyResponse = await fetch(
      'https://swzypvvwwiqzciwemvxw.supabase.co/functions/v1/e1b30f85-8dd2-431f-b5ad-3f89f4ea15ce',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'verify', 
          email, 
          otp: token 
        })
      }
    );
    
    const verifyData = await verifyResponse.json();
    if (!verifyData.success) {
      throw new Error(verifyData.message || 'Invalid OTP');
    }
    
    // Get pending user data
    const pendingUserData = localStorage.getItem('pendingUser');
    if (!pendingUserData) {
      throw new Error('No pending user data found');
    }
    
    const { password, name } = JSON.parse(pendingUserData);
    
    // Complete signup with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    if (error) throw error;
    
    // Store user in our users table
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: email,
        name: name
      });
    }
    
    // Clean up
    localStorage.removeItem('pendingUser');
    
    return data;
  }

  // Resend OTP
  async resendOTP(email: string) {
    const otpResponse = await fetch(
      'https://swzypvvwwiqzciwemvxw.supabase.co/functions/v1/e1b30f85-8dd2-431f-b5ad-3f89f4ea15ce',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'generate', 
          email 
        })
      }
    );
    
    const otpData = await otpResponse.json();
    if (!otpData.success) {
      throw new Error(otpData.message || 'Failed to resend OTP');
    }
    
    return otpData;
  }
}

export const authService = new AuthService();