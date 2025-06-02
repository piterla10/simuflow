import { Component, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-cargar-crear',
  imports: [],
  templateUrl: './cargar-crear.component.html',
  styleUrl: './cargar-crear.component.scss'
})
export class CargarCrearComponent {
  @Output() cambiar = new EventEmitter<number>();

  cambiarComp(n: number) {
    this.cambiar.emit(n);
  }

}
