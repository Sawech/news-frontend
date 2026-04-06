import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { AdminUser } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly adminBase = environment.apiUrl.replace('/api', '') + '/api/admin';

  readonly currentUser = signal<AdminUser | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  async restoreSession(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: AdminUser }>(`${this.adminBase}/auth/me`, {
          withCredentials: true,
        }),
      );
      this.currentUser.set(res.data);
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ user: AdminUser }>(
        `${this.adminBase}/auth/login`,
        { email, password },
        { withCredentials: true },
      ),
    );
    this.currentUser.set(res.user);
  }

  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.adminBase}/auth/login`, { withCredentials: true }),
    );
    this.currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }
}
