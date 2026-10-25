import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '../../services/auth';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let httpTesting: HttpTestingController;

  const profileResponse = {
    id: 7,
    email: 'usuario@example.com',
    rol: 'USER',
    nombrePublico: null,
    fotoPerfilUrl: null,
    biografia: null,
    puntosAporte: 0,
    calidadPromedio: null,
    publisherLinks: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: { obtenerRol: () => 'USER' } },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTesting.expectOne('/api/perfil').flush({ perfil: profileResponse });
    await fixture.whenStable();
  });

  afterEach(() => httpTesting.verify());

  it('loads the authenticated user profile', () => {
    expect(component.perfil?.email).toBe('usuario@example.com');
    expect(component.nombreVisible).toBe('usuario@example.com');
  });

  it('sends editable profile fields and shows a success message', () => {
    component.nombrePublico = 'Mi nombre';
    component.biografia = 'Mi descripción';
    component.fotoPerfilUrl = 'https://images.example.com/avatar.png';

    component.guardar();

    const request = httpTesting.expectOne('/api/perfil');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      nombrePublico: 'Mi nombre',
      biografia: 'Mi descripción',
      fotoPerfilUrl: 'https://images.example.com/avatar.png',
    });
    request.flush({
      perfil: {
        ...profileResponse,
        nombrePublico: 'Mi nombre',
        biografia: 'Mi descripción',
        fotoPerfilUrl: 'https://images.example.com/avatar.png',
      },
    });

    expect(component.mensaje).toBe('Tu perfil se actualizó correctamente.');
    expect(component.guardando).toBe(false);
  });

  it('rejects an image URL without HTTPS before sending a request', () => {
    component.fotoPerfilUrl = 'http://images.example.com/avatar.png';

    component.guardar();

    expect(component.error).toContain('HTTPS');
    expect(component.guardando).toBe(false);
  });
});
