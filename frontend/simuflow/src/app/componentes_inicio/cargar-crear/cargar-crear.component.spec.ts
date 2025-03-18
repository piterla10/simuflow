import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarCrearComponent } from './cargar-crear.component';

describe('CargarCrearComponent', () => {
  let component: CargarCrearComponent;
  let fixture: ComponentFixture<CargarCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargarCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
