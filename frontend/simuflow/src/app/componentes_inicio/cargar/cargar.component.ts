import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SimulacionService } from '../../services/SimulacionService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cargar',
  imports: [CommonModule],
  templateUrl: './cargar.component.html',
  styleUrl: './cargar.component.scss'
})
export class CargarComponent {
  constructor( private router: Router, private simulacionService: SimulacionService) {}
  @Output() cambiar = new EventEmitter<number>();

  archivoSeleccionado: File | null = null;
  nombreArchivo: string | null = null;
  errorSinArchivo = false;
  errorArchivoVacio = false;

  cargarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] ?? null;

     if (this.archivoSeleccionado) {
      this.nombreArchivo = this.archivoSeleccionado.name;
    } else {
      this.nombreArchivo = null;
    }
  }

  procesarArchivo(){
    if(!this.archivoSeleccionado){
      this.mostrarErrorTemporal(1);
      return;
    }

    const lector = new FileReader();
    
    lector.onload = (e:ProgressEvent<FileReader>) => {
      try{
        const contenido = e.target?.result as string;
        const datos = JSON.parse(contenido);

        if (!datos.info || !datos.grid || !datos.sistemas) {
          this.mostrarErrorTemporal(2);
          return;
        } 
        this.simulacionService.cargar(datos);
        
        this.router.navigate(['/simulador']);
      }catch (error){
        this.mostrarErrorTemporal(2);
      }
    };

    lector.readAsText(this.archivoSeleccionado);
  }

  cambiarComp(n: number) {
    this.nombreArchivo = null
    this.cambiar.emit(n); 
  }

  // esto es solo para mostrar los errores
  mostrarErrorTemporal(numero: number) {
    if(numero === 1){
      this.errorSinArchivo = true;
    }else{
      this.errorArchivoVacio = true;
    }

    setTimeout(() => {
      if(numero === 1){
        this.errorSinArchivo = false;
      }else{
        this.errorArchivoVacio = false;
      }
    }, 3000); // coincide con los 3s del fade
  }

}
