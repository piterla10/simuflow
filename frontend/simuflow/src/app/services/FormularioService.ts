import { Injectable } from "@angular/core";

@Injectable({providedIn:'root'})

export class FormularioService {
  private datosFormulario: any;

  setDatos(datos: any) {
    this.datosFormulario = datos;
  }

  getDatos() {
    return this.datosFormulario;
  }
}