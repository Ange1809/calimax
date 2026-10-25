import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { StaffModeration } from './staff-moderation';

describe('StaffModeration', () => {
  let component: StaffModeration;
  let fixture: ComponentFixture<StaffModeration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffModeration],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffModeration);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/moderacion/pendientes')
      .flush({ datos: [] });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
