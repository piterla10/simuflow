import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalOpcionesComponent } from "../modal-opciones/modal-opciones.component";

@Component({
  selector: 'app-navbar',
  imports: [ModalOpcionesComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @ViewChild('modal') modal!: ModalOpcionesComponent;
  @Output() abrir = new EventEmitter<void>();

  abrirModal() {
    this.modal.abrirModal();
    this.abrir.emit();
  }
  
  cerrarModal(){
    this.modal.cerrarModal();
  }

  cerrarConstantes(){
    this.modal.cerrarConstantes();
  }

}
