import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './models';

type Params = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Params) {
    return firstValueFrom(this.http.get<ApiResponse<T>>(this.url(path), { params: this.toParams(params) }));
  }

  post<T>(path: string, body: unknown = {}) {
    return firstValueFrom(this.http.post<ApiResponse<T>>(this.url(path), body));
  }

  put<T>(path: string, body: unknown) {
    return firstValueFrom(this.http.put<ApiResponse<T>>(this.url(path), body));
  }

  patch<T>(path: string, body: unknown) {
    return firstValueFrom(this.http.patch<ApiResponse<T>>(this.url(path), body));
  }

  delete<T>(path: string) {
    return firstValueFrom(this.http.delete<ApiResponse<T>>(this.url(path)));
  }

  private url(path: string) {
    return `${this.baseUrl}${path}`;
  }

  private toParams(params?: Params) {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }
}
