import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { PublicPublisher } from './public-publisher';

describe('PublicPublisher', () => {
  let component: PublicPublisher;
  let fixture: ComponentFixture<PublicPublisher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicPublisher],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicPublisher);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/publishers/')
      .flush({ perfil: {} });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
