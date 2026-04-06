import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-settings',
  imports: [],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css',
})
export class AdminSettingsComponent {
  private readonly auth = inject(AuthService);

  readonly name = () => this.auth.currentUser()?.name ?? 'Admin';
  readonly email = () => this.auth.currentUser()?.email ?? '—';
  readonly role = () => this.auth.currentUser()?.role ?? '—';
  readonly initial = () => (this.auth.currentUser()?.name ?? 'A')[0].toUpperCase();
}
