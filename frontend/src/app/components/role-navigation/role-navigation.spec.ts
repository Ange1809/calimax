import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '../../services/auth';
import { RoleNavigation } from './role-navigation';

describe('RoleNavigation', () => {
  let fixture: ComponentFixture<RoleNavigation>;

  async function renderForRole(rol: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [RoleNavigation],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            obtenerRol: () => rol,
            obtenerToken: () => 'token',
            cerrarSesion: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleNavigation);
    fixture.detectChanges();
  }

  it('keeps shared navigation and Publisher actions visible', async () => {
    await renderForRole('PUBLISHER');

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('nav a'),
      (link) => link.textContent?.trim()
    );
    expect(links).toContain('Catálogo');
    expect(links).toContain('Enviar contenido');
    expect(links.some((text) => text?.includes('Mi perfil'))).toBe(true);
    expect(links).not.toContain('Moderación');
  });

  it('keeps shared navigation and moderation available to staff', async () => {
    await renderForRole('MODERATOR');

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('nav a'),
      (link) => link.textContent?.trim()
    );
    expect(links).toContain('Catálogo');
    expect(links).toContain('Moderación');
    expect(links.some((text) => text?.includes('Mi perfil'))).toBe(true);
    expect(links).not.toContain('Enviar contenido');
  });
});
