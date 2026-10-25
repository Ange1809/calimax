import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { PublicBoard } from './public-board';

describe('PublicBoard', () => {
  let component: PublicBoard;
  let fixture: ComponentFixture<PublicBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicBoard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/publishers/cartelera')
      .flush({ datos: [] });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
