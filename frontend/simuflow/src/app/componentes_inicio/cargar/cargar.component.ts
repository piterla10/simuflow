import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-cargar',
  imports: [],
  templateUrl: './cargar.component.html',
  styleUrl: './cargar.component.scss'
})
export class CargarComponent {
  @Output() cambiar = new EventEmitter<number>();

  cambiarComp() {
    this.cambiar.emit(0);
  }
}
