import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoleNavigation } from './components/role-navigation/role-navigation';

@Component({
  selector: 'app-root',
  imports: [RoleNavigation, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
