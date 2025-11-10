import { Injectable } from '@angular/core';

type MusicTrack = 'menu' | 'level_select' | 'gameplay' | 'win' ;
type SfxTrack = 'ui_confirm' | 'ui_click' | 'dialog_open' | 'dialog_close' | 'code_run' | 'keyboard_tick' | 'task_complete' | 'level_fail' | 'drink_coffee' | 'focus_break';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private music: HTMLAudioElement | null = null;
  private sfxPool: HTMLAudioElement[] = [];
  private readonly POOL_SIZE = 10; // Allows up to 10 sounds to play at once

  private musicVolume = 0.5;
  private sfxVolume = 0.8;

  private currentMusicTrack: MusicTrack | null = null;

  constructor() {
    // Create a pool of audio elements for sound effects
    for (let i = 0; i < this.POOL_SIZE; i++) {
      this.sfxPool.push(new Audio());
    }
    this.loadSettings();
  }

  // --- MUSIC CONTROLS ---

  public playMusic(track: MusicTrack): void {
    if (this.currentMusicTrack === track && this.music && !this.music.paused) {
      return; // Music is already playing
    }

    this.currentMusicTrack = track;
    const trackUrl = this.getMusicUrl(track);

    if (this.music) {
      this.fadeOut().then(() => {
        this.music!.src = trackUrl;
        this.fadeIn();
      });
    } else {
      this.music = new Audio(trackUrl);
      this.music.loop = true;
      this.fadeIn();
    }
  }

  public stopMusic(): void {
    if (this.music) {
      this.fadeOut().then(() => {
        this.music?.pause();
        this.currentMusicTrack = null;
      });
    }
  }

  // --- SFX CONTROLS ---

  public playSfx(track: SfxTrack, volume: number = 1.0): void {
    const sfx = this.sfxPool.find(audio => audio.paused); // Find an available audio element
    if (sfx) {
      sfx.src = this.getSfxUrl(track);
      sfx.volume = this.sfxVolume * volume;
      sfx.play();
    }
  }

  // --- VOLUME & SETTINGS ---

  public setMusicVolume(volume: number): void {
    this.musicVolume = volume;
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
    this.saveSettings();
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = volume;
    this.saveSettings();
  }

  public getMusicVolume = (): number => this.musicVolume;
  public getSfxVolume = (): number => this.sfxVolume;

  private saveSettings(): void {
    localStorage.setItem('audioSettings', JSON.stringify({ music: this.musicVolume, sfx: this.sfxVolume }));
  }

  private loadSettings(): void {
    const settings = localStorage.getItem('audioSettings');
    if (settings) {
      const { music, sfx } = JSON.parse(settings);
      this.musicVolume = music ?? 0.5;
      this.sfxVolume = sfx ?? 0.8;
    }
  }

  // --- HELPER METHODS ---

  private getMusicUrl(track: MusicTrack): string {
    const filenames = {
      menu: 'music_title_screen.mp3',
      level_select: 'music_level_select.mp3',
      gameplay: 'music_gameplay_loop.mp3',
      win: 'music_win_jingle.mp3'
    };
    return `soundtrack/${filenames[track]}`;
  }

  private getSfxUrl(track: SfxTrack): string {
    return `sfx/${track}.mp3`;
  }

  private fadeOut(duration: number = 500): Promise<void> {
    return new Promise(resolve => {
        if (!this.music || this.music.volume === 0) return resolve();
        const interval = 50;
        const step = this.music.volume / (duration / interval);
        const fade = setInterval(() => {
            if (this.music!.volume > step) {
                this.music!.volume -= step;
            } else {
                this.music!.volume = 0;
                clearInterval(fade);
                resolve();
            }
        }, interval);
    });
  }

  private fadeIn(duration: number = 500): Promise<void> {
      return new Promise(resolve => {
          if (!this.music) return resolve();
          this.music.volume = 0;
          this.music.play();
          const targetVolume = this.musicVolume;
          const interval = 50;
          const step = targetVolume / (duration / interval);
          const fade = setInterval(() => {
              if (this.music!.volume < targetVolume - step) {
                  this.music!.volume += step;
              } else {
                  this.music!.volume = targetVolume;
                  clearInterval(fade);
                  resolve();
              }
          }, interval);
      });
  }
}
