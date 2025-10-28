import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulacionService {
  // tipo de observable que guarda el ultimo valor que se le ha pasado:
  private cargarDatos = new BehaviorSubject<any>(null);
  cargarDatos$ = this.cargarDatos.asObservable();

  // Para llamar a la función de simulador
  // Este tipo de observable solo se utiliza como "alarma" cuando se le llama:
  private guardarDatos = new Subject<void>();
  guardarDatos$ = this.guardarDatos.asObservable();
  
  // Función que llama el navbar para que cambie la variable y 
  // detecte el cambio el simulador
  guardar() {
    // al ser un subject el tipo de observable, llamando a esta función
    // lo que hará es emitir una señal vacía (sin enviar datos) a los 
    // componentes que estén suscritos
    this.guardarDatos.next();
  }

  // Esta función creo que la eliminaré y haré otra logica mas 
  // sencilla para las llamadas a la api y lo mismo con la 
  // declaración de datosSimulacion y tal
  cargar(data: any) {
    this.cargarDatos.next(data);

  }
  
}