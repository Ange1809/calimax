import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { PublisherUpload } from './publisher-upload';

describe('PublisherUpload', () => {
  let component: PublisherUpload;
  let fixture: ComponentFixture<PublisherUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherUpload],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
