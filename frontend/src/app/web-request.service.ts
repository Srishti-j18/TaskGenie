import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  readonly ROOT_URL;

  constructor(private http: HttpClient) {
    this.ROOT_URL = 'http://localhost:3000';
  }

  get<T>(uri: string): Observable<T> {
    return this.http.get<T>(`${this.ROOT_URL}/${uri}`);
  }

  post<T>(uri: string, payload: Object): Observable<T> {
    return this.http.post<T>(`${this.ROOT_URL}/${uri}`, payload);
  }

  patch<T>(uri: string, payload: Object): Observable<T> {
    return this.http.patch<T>(`${this.ROOT_URL}/${uri}`, payload);
  }

  delete<T>(uri: string): Observable<T> {
    return this.http.delete<T>(`${this.ROOT_URL}/${uri}`);
  }
}
