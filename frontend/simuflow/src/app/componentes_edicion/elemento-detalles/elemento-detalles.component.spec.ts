import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementoDetallesComponent } from './elemento-detalles.component';

describe('ElementoDetallesComponent', () => {
  let component: ElementoDetallesComponent;
  let fixture: ComponentFixture<ElementoDetallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementoDetallesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementoDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
