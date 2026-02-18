import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [HttpClientModule, CommonModule], // Added HttpClientModule and CommonModule
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  isModalOpen = false;
  rulesContent: string = '';

  constructor(private http: HttpClient) {}

  openRulesModal(event: Event): void {
    event.preventDefault();
    this.isModalOpen = true;

    // Load rules from rules.md file
    this.http.get('assets/docs/rules.md', { responseType: 'text' }).subscribe({
      next: (data) => {
        this.rulesContent = this.convertMarkdownToHtml(data);
      },
      error: (err) => {
        console.error('Failed to load game rules:', err);
        this.rulesContent = '<p>Failed to load game rules.</p>';
      }
    });
  }

  closeRulesModal(): void {
    this.isModalOpen = false;
  }

  private convertMarkdownToHtml(markdown: string): string {
    // Simple Markdown to HTML converter (can be replaced with library, e.g., marked.js)
    return markdown.replace(/\n/g, '<br>').replace(/## (.+)/g, '<h2>$1</h2>');
  }
}