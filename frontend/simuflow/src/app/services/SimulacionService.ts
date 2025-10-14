import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulacionService {
  // tipo de observable que guarda el ultimo valor que se le ha pasado:
  private datosSimulacion = new BehaviorSubject<any>(null);
  datosSimulacion$ = this.datosSimulacion.asObservable();

  // Para llamar a la función de simulador
  // Este tipo de observable solo se utiliza como "alarma" cuando se le llama:
  private saveRequested = new Subject<void>();
  saveRequested$ = this.saveRequested.asObservable();
  
  // Función que llama el navbar para que cambie la variable y 
  // detecte el cambio el simulador
  requestSave() {
    // al ser un subject el tipo de observable, llamando a esta función
    // lo que hará es emitir una señal vacía (sin enviar datos) a los 
    // componentes que estén suscritos
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