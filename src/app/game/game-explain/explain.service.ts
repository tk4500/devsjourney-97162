import { HttpClient } from '@angular/common/http';
import { Explain } from './game-explain.component';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExplainService {
  run:boolean = false;
  task:boolean = false;
  id = signal<number>(0);
  constructor(private http: HttpClient) {}

  getExplain(level: number): Observable<Explain[]> {
    return this.http.get<Explain[]>(`levelexplain/${level}.json`);
  }
  setId(id: number) {
    this.id.set(id);
  }
  isRun(): boolean{
    return this.run;
  }
  isTask(): boolean{
    return this.task;
  }

}
