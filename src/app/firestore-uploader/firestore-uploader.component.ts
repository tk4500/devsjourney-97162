import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-firestore-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Textarea, ButtonModule, ToastModule],
  providers: [MessageService], // Toast requires this
  template: `
    <div class="uploader-container">
      <h2>Firestore JSON Uploader</h2>
      <p>Paste your JSON data to upload/update a document in Firestore.</p>

      <div class="p-fluid">
        <div class="field">
          <label for="collection">Collection Path</label>
          <input id="collection" type="text" pInputText [(ngModel)]="collectionPath" placeholder="e.g., levels or tutorials">
        </div>
        <div class="field">
          <label for="document">Document ID</label>
          <input id="document" type="text" pInputText [(ngModel)]="documentId" placeholder="e.g., level_1 or an Auto-ID">
        </div>
        <div class="field">
          <label for="jsonData">JSON Data</label>
          <textarea id="jsonData" pInputTextarea [(ngModel)]="jsonData" rows="15" placeholder="Paste your valid JSON object here"></textarea>
        </div>
      </div>
      <p-button label="Upload to Firestore" icon="pi pi-upload" (click)="upload()" [loading]="isLoading"></p-button>
    </div>
    <p-toast></p-toast>
  `
})
export class FirestoreUploaderComponent {
  private firestore: Firestore = inject(Firestore);
  private messageService: MessageService = inject(MessageService);

  collectionPath = '';
  documentId = '';
  jsonData = '';
  isLoading = false;

  async upload() {
    if (!this.collectionPath || !this.documentId || !this.jsonData) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Info', detail: 'Please fill all fields.' });
      return;
    }

    this.isLoading = true;
    try {
      const dataObject = JSON.parse(this.jsonData);
      const docRef = doc(this.firestore, `${this.collectionPath}/${this.documentId}`);
      await setDoc(docRef, dataObject, { merge: true }); // Use merge to avoid overwriting everything

      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Document '${this.documentId}' updated in '${this.collectionPath}'.` });
    } catch (e: any) {
      this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: e.message });
    } finally {
      this.isLoading = false;
    }
  }
}
