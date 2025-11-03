import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import {
  Auth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  updateProfile,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ImageUploadService } from '../../services/image-upload.service'; // <-- Import our new service

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DividerModule,
    ButtonModule,
    CardModule,
    MessageModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @Output() authSuccess = new EventEmitter<void>();
  @Output() switchToSignup = new EventEmitter<void>();
  private auth: Auth = inject(Auth);
  private imageUploadService: ImageUploadService = inject(ImageUploadService);
  email = '';
  password = '';
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  async login() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      console.log('Login successful!', userCredential.user);
      this.authSuccess.emit();
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/invalid-credential') {
        this.errorMessage =
          'Incorrect email or password. New user? Please sign up.';
      } else {
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
  async loginWithGoogle() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const provider = new GoogleAuthProvider(); // Create the provider
      const userCredential = await signInWithPopup(this.auth, provider); // Sign in with a popup window
      const additionalInfo = getAdditionalUserInfo(userCredential);

      // --- THIS IS THE NEW LOGIC ---
      // Check if it's a new user and they have a temporary photo from Google
      if (additionalInfo?.isNewUser && userCredential.user.photoURL) {
        console.log(
          'New Google user detected, creating permanent profile picture via Imgur...'
        );

        // Call our client-side service
        const permanentUrl = await this.imageUploadService.getUrlFromUser(
          userCredential.user
        );

        if (permanentUrl) {
          // Update the user's Firebase profile with the new permanent URL
          await updateProfile(userCredential.user, { photoURL: permanentUrl });
          console.log(
            'Firebase profile picture updated successfully with Imgur URL!'
          );
        }
      }

      this.authSuccess.emit(); // This will close the dialog
    } catch (error: any) {
      if (error instanceof DOMException) {
         console.warn("CORS error fetching Google image. This is a browser security feature. The user's profile picture will not be updated, but login will proceed.");
      } else {
        console.error('Google login failed:', error);
        this.errorMessage = 'Could not complete Google Sign-In. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
  onSwitchToSignup() {
    this.switchToSignup.emit();
  }

  async resetPassword() {
    // Basic validation
    if (!this.email) {
      this.errorMessage =
        'Please enter your email address to reset your password.';
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.successMessage =
        'Password reset link sent! Please check your email inbox.';
    } catch (error: any) {
      console.error('Password reset failed:', error);
      this.errorMessage =
        'Could not send reset link. Please ensure the email address is correct.';
    } finally {
      this.isLoading = false;
    }
  }
}
