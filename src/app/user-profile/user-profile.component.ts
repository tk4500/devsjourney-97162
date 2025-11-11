import { Component, inject, Input, OnInit, Output, EventEmitter, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, Auth, updateProfile, updatePassword, GoogleAuthProvider, linkWithPopup, reauthenticateWithCredential, EmailAuthProvider } from '@angular/fire/auth';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { PlayerProgressService } from '../services/player-progress.service'; // <-- Import
import { PlayerProgress } from '../models/player-progress.model';
import { ImageUploadService } from '../services/image-upload.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ CommonModule, FormsModule, ButtonModule, InputTextModule, AvatarModule, MessageModule, PasswordModule ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy{
  ngOnDestroy(): void {
    this.progressSubscription?.unsubscribe();
  }
  @Input() user!: User;
  @Output() profileUpdated = new EventEmitter<void>();

  public playerProgressService: PlayerProgressService = inject(PlayerProgressService);
  private auth: Auth = inject(Auth);
  private imageUploadService: ImageUploadService = inject(ImageUploadService);
  public leaderboardRank = signal<string>('--');
  isEditMode = false;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  public playerProgress: PlayerProgress | null = null;
  private progressSubscription: any;

  // Form fields for edit mode
  newDisplayName = '';
  newPassword = '';
  confirmPassword = '';
  newProfilePictureFile: File | null = null;
  profilePicturePreview: string | null = null;

  ngOnInit(): void {
    this.resetEditFields();
    this.progressSubscription = this.playerProgressService.progress$.subscribe(progress => {
      this.playerProgress = progress;
    });
    this.fetchPlayerRank();
  }

  async fetchPlayerRank(): Promise<void> {
    console.log('Fetching player rank for user:', this.user.uid);
    this.leaderboardRank.set('...'); // Show a loading indicator
    const rank = await this.playerProgressService.getPlayerRank(this.user.uid, 'totalScore');
    if (rank !== null) {
      this.leaderboardRank.set(`#${rank}`);
    } else {
      this.leaderboardRank.set('N/A'); // Not ranked or not in top 1000
    }
  }

  resetEditFields() {
    this.newDisplayName = this.user.displayName || '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.newProfilePictureFile = null;
    this.profilePicturePreview = this.user.photoURL;
  }

  toggleEditMode(editing: boolean) {
    this.isEditMode = editing;
    if (editing) {
      this.resetEditFields();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newProfilePictureFile = input.files[0];

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => this.profilePicturePreview = e.target?.result as string;
      reader.readAsDataURL(this.newProfilePictureFile);
    }
  }

  async saveProfileChanges() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      // 1. Update Display Name if changed
      if (this.newDisplayName !== this.user.displayName) {
        await updateProfile(this.user, { displayName: this.newDisplayName });
      }

      // 2. Update Password if provided
      if (this.newPassword) {
        if (this.newPassword !== this.confirmPassword) throw new Error("Passwords do not match.");
        await updatePassword(this.user, this.newPassword);
      }

      // 3. Update Profile Picture if a new one was selected
      if (this.newProfilePictureFile) {
        const newUrl = await this.imageUploadService.getUrlFromImage(this.newProfilePictureFile, this.user);
        if (newUrl) {
          await updateProfile(this.user, { photoURL: newUrl });
        } else {
          throw new Error("Image upload failed.");
        }
      }
    this.playerProgress!.displayName = this.user.displayName || this.playerProgress!.displayName;
    this.playerProgress!.photoURL = this.user.photoURL || this.playerProgress!.photoURL;
      this.successMessage = "Profile updated successfully!";
      this.profileUpdated.emit();
      this.playerProgressService.saveProgress(this.playerProgress!); // Save any changes to progress as well
      setTimeout(() => this.toggleEditMode(false), 1500);

    } catch (error: any) {
      console.error("Profile update failed:", error);
      this.errorMessage = error.message;
      // Handle re-authentication for sensitive operations like password change
      if (error.code === 'auth/requires-recent-login') {
        this.errorMessage = "This action is sensitive and requires recent authentication. Please log out and log back in to change your password.";
      }
    } finally {
      this.isLoading = false;
    }
  }

  get isGoogleLinked(): boolean {
    return this.user.providerData.some(provider => provider.providerId === 'google.com');
  }

  async linkGoogleAccount() {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(this.user, provider);
      this.successMessage = "Google account linked successfully!";
      this.profileUpdated.emit();
    } catch (error: any) {
      console.error("Failed to link Google account:", error);
      this.errorMessage = "Could not link Google account. It might already be in use by another user.";
    } finally {
      this.isLoading = false;
    }
  }
    getUserInitial(user: User | null): string {
    return user?.email ? user.email[0].toUpperCase() : 'G';
  }
}
