import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementoControladorComponent } from './elemento-controlador.component';

describe('ElementoControladorComponent', () => {
  let component: ElementoControladorComponent;
  let fixture: ComponentFixture<ElementoControladorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementoControladorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementoControladorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
