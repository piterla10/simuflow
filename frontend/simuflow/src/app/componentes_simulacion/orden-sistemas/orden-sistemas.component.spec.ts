import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenSistemasComponent } from './orden-sistemas.component';

describe('OrdenSistemasComponent', () => {
  let component: OrdenSistemasComponent;
  let fixture: ComponentFixture<OrdenSistemasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenSistemasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenSistemasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
