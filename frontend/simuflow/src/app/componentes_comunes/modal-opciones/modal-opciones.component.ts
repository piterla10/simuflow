import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal-opciones',
  imports: [CommonModule],
  templateUrl: './modal-opciones.component.html',
  styleUrl: './modal-opciones.component.scss'
})
export class ModalOpcionesComponent {
  visible = false;
  @Output() guardar = new EventEmitter<void>();
  @Output() cargar = new EventEmitter<void>();

  abrirModal() {
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

  guardarSimulacion() {
    this.guardar.emit();
    this.cerrarModal();
  }

  cargarSimulacion() {
    this.cargar.emit();
    this.cerrarModal();
  }
}
