import { Injectable } from "@angular/core";

@Injectable({providedIn:'root'})

export class ArchivoService {
  private archivo: File | null = null;

  setArchivo(file: File) {
    this.archivo = file;
    console.log(this.archivo)
  }

  getArchivo(): File | null {
    return this.archivo;
  }
}