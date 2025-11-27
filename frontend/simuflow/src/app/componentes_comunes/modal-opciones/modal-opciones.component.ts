import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SimulacionService } from '../../services/SimulacionService';
import { ConstantesComponent } from "../constantes/constantes.component";

@Component({
  selector: 'app-modal-opciones',
  imports: [CommonModule, ConstantesComponent],
  templateUrl: './modal-opciones.component.html',
  styleUrl: './modal-opciones.component.scss'
})
export class ModalOpcionesComponent {
  constructor( private router: Router, private simulacionService: SimulacionService) {  }
  @ViewChild('constantes') modal!: ConstantesComponent;

  public errorArchivoVacio = false;
  public visible = false;

  abrirModal() {
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
    this.cerrarConstantes();
  }

  guardarSimulacion() {
    this.simulacionService.guardar();
    this.cerrarModal();
  }

  cargarSimulacion(event: any) {

    const input = event.target as HTMLInputElement;
    const archivoSeleccionado = input.files?.[0];
    if (!archivoSeleccionado) {
      this.mostrarErrorTemporal();
      input.value= '';
      return;
    }

    const lector = new FileReader();

    lector.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const contenido = e.target?.result as string;
        const datos = JSON.parse(contenido);

        if (!datos.info || !datos.grid || !datos.sistemas) {
          this.mostrarErrorTemporal();
          input.value= '';
          return;
        }

        this.simulacionService.cargar(datos);

        this.cerrarModal();

        input.value= '';
      } catch (error) {
        input.value= '';
        this.mostrarErrorTemporal();
      }
    };

    lector.readAsText(archivoSeleccionado);
    
  }

  volverInicio(){
    localStorage.clear();
    this.cerrarModal();
    this.router.navigate(['/']);
    this.simulacionService.cargar(null);
    this.simulacionService.recibirConstantesCargadas(null);
  }

  mostrarErrorTemporal() {
    this.errorArchivoVacio = true;

    setTimeout(() => {
      this.errorArchivoVacio = false;
    }, 3000); // coincide con los 3s del fade
  }

  abrirConstantes(){
    this.modal.abrirModal();
  }

  cerrarConstantes(){
    this.modal.cerrarModal();
  }
}
