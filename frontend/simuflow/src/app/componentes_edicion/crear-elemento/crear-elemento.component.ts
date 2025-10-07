import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Elemento } from '../../services/Elemento';

@Component({
  selector: 'app-crear-elemento',
  imports: [CommonModule],
  templateUrl: './crear-elemento.component.html',
  styleUrl: './crear-elemento.component.scss'
})
export class CrearElementoComponent {
  @Output() elemento = new EventEmitter<Elemento>();
  visible = false;
  elementoSeleccionado: Elemento = 'generador';

  abrirModal(){
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

  // función para controlar el css de cual está seleccionado
  setElemento(elemento: Elemento){
    if(elemento !== this.elementoSeleccionado){
      this.elementoSeleccionado = elemento;
      this.cambiarElemento(elemento);
    }
  }

  // función para mandarle el nuevo elemento seleccionado al simulador
  cambiarElemento(elemento: Elemento) {
    this.elemento.emit(elemento);
  }
}
