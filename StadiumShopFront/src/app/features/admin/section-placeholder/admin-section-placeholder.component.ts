import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-section-placeholder',
  standalone: true,
  templateUrl: './admin-section-placeholder.component.html',
  styleUrl: './admin-section-placeholder.component.css',
})
export class AdminSectionPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
}
