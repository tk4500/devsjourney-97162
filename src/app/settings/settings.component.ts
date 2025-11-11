import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-settings',
  standalone: true, // <-- Make it standalone
  imports: [CommonModule, SliderModule, FormsModule], // <-- Add necessary modules
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private audioService = inject(AudioService);

  musicVolume: number = 50;
  sfxVolume: number = 80;

  ngOnInit(): void {
    // Initialize sliders with current volume levels
    this.musicVolume = this.audioService.getMusicVolume() * 100;
    this.sfxVolume = this.audioService.getSfxVolume() * 100;
  }

  onMusicVolumeChange(): void {
    this.audioService.setMusicVolume(this.musicVolume / 100);
  }

  onSfxVolumeChange(): void {
    this.audioService.setSfxVolume(this.sfxVolume / 100);
    // Play a sound so the user can hear the new volume
    this.audioService.playSfx('ui_click');
  }
}
