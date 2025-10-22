import { Component, EventEmitter, Output } from '@angular/core';
import { ArchivoService } from '../../services/ArchivoService';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cargar',
  imports: [FormsModule],
  templateUrl: './cargar.component.html',
  styleUrl: './cargar.component.scss'
})
export class CargarComponent {
  constructor(private archivoService: ArchivoService, private router: Router  ) {}
  @Output() cambiar = new EventEmitter<number>();

  archivoSeleccionado: File | null = null;

  guardarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] ?? null;
   
  }

  enviarFormulario(event: Event) {
    event.preventDefault();
    if (this.archivoSeleccionado) {
      this.archivoService.setArchivo(this.archivoSeleccionado);
      this.router.navigate(['/simulador']);
    }
  }

  cambiarComp(n: number) {
    this.cambiar.emit(n); 
  }
}
