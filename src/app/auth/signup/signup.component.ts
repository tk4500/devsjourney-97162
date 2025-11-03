import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// --- Form and UI Imports ---
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password'; // Great for password strength

// --- Firebase Imports ---
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    PasswordModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'] // We can share CSS with login
})
export class SignupComponent {
  private auth: Auth = inject(Auth);
 @Output() authSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  email = '';
  password = '';
  confirmPassword = ''; // For validation
  isLoading = false;
  errorMessage: string | null = null;

    onSwitchToLogin() {
    this.switchToLogin.emit();
  }

  async signup() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;

    // --- Basic Client-Side Validation ---
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.isLoading = false;
      return;
    }

    try {
      // Use the Firebase SDK to create a new user
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);

      console.log('Sign-up successful, user is now logged in!', userCredential.user);
      // After successful sign-up, Firebase automatically logs the user in.
      // So we can navigate them directly to the game.
      this.authSuccess.emit();

    } catch (error: any) {
      console.error('Sign-up failed:', error);
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'This email address is already taken.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'The password is too weak. It should be at least 6 characters.';
      } else {
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
