// simulation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulacionService {
  private datosSimulacion = new BehaviorSubject<any>(null);
  currentDatosSimulacion = this.datosSimulacion.asObservable();

  // Para llamar a la función de simulador
  private saveRequested = new Subject<void>();
  saveRequested$ = this.saveRequested.asObservable();
  
  // Función que llama el navbar para que cambie la variable y 
  // detecte el cambio el simulador
  requestSave() {
    this.saveRequested.next();
  }

  // Esta función creo que la eliminaré y haré otra logica mas 
  // sencilla para las llamadas a la api y lo mismo con la 
  // declaración de datosSimulacion y tal
  updateDatosSimulacion(data: any) {
    this.datosSimulacion.next(data);

  }
  

  // (Más adelante añadiremos métodos para BD)
}