import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from 'firebase/auth';

// Interface to match ImgBB's API response structure
interface ImgBBUploadResponse {
  data: {
    id: string;
    title: string;
    url: string;
    display_url: string;
    size: number;
    time: number;
    expiration: string;
    width: number;
    height: number;
    image: {
      url: string;
      filename: string;
      name: string;
      extension: string;
      mime: string;
    };
    thumb: {
      url: string;
      filename: string;
      name: string;
      extension: string;
      mime: string;
    };
    medium: {
      url: string;
      filename: string;
      name: string;
      extension: string;
      mime: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private readonly IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
  private readonly IMGBB_API_KEY = environment.imgbb.apiKey;

  constructor(private http: HttpClient) {}
  async getUrlFromImage(
    image: File | Blob,
    user: User
  ): Promise<string | null> {
    try {
      // 1. Fetch the image from the user's profile as a Blob

      const formData = new FormData();
      formData.append('image', image);

      // 3. Set the required Authorization header for Imgbb
      const params = new HttpParams()
        .set('key', this.IMGBB_API_KEY)
        .set('name', user.displayName || user.email || 'Profile Picture');

      // 4. Upload to Imgbb
      const response = await firstValueFrom(
        this.http.post<ImgBBUploadResponse>(this.IMGBB_UPLOAD_URL, formData, {
          params,
        })
      );

      // 5. Check for success and return the new URL
      if (response.success && response.data.url) {
        console.log('ImgBB upload successful:', response.data.url);
        return response.data.url;
      } else {
        console.error('ImgBB upload failed:', response);
        return null;
      }
    } catch (error) {
      console.error('Failed to process and upload image:', error);
      return null;
    }
  }
  async getUrlFromUser(user: User): Promise<string | null> {
    try{

    const imageBlob = await firstValueFrom(
      this.http.get(user.photoURL!, { responseType: 'blob' })
    );

    return this.getUrlFromImage(imageBlob, user);
    }
    catch(error){
      console.error('Failed to fetch user image:', error);
      return null;
    }
  }
}
