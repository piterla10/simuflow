import { Component, ViewChild } from '@angular/core';
import { ModalOpcionesComponent } from "../modal-opciones/modal-opciones.component";
import { SimulacionService } from '../../services/SimulacionService';

@Component({
  selector: 'app-navbar',
  imports: [ModalOpcionesComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @ViewChild('modal') modal!: ModalOpcionesComponent;
  constructor(private simulacionServicio: SimulacionService) {}

  abrirModal() {
    this.modal.abrirModal();
  }

  onGuardarClick() {
    this.simulacionServicio.requestSave();
  }

  onCargarClick() {
    // Lógica para cargar (se implementará luego)
  }
}
