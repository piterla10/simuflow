import { Injectable } from "@angular/core";

@Injectable({providedIn:'root'})

export class InicioService {
  private datosFormulario: any;
  private archivo: File | null = null;

  setArchivo(file: File) {
    this.archivo = file;
    console.log(this.archivo)
  }

  getArchivo(): File | null {
    console.log(this.archivo)
    return this.archivo;
  }

  setDatos(datos: any) {
    this.datosFormulario = datos;
  }

  getDatos() {
    return this.datosFormulario;
  }
}