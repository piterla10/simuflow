import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulacionService {
  // Este observable es capaz de guardar la el ultimo objeto que recibió para que 
  // cuando alguien se suscriba le llegue aunque no se haya enviado uno nuevo 
  private cargarDatos = new BehaviorSubject<any>(null);
  cargarDatos$ = this.cargarDatos.asObservable();

  // Para llamar a la función de simulador
  // Este tipo de observable solo se utiliza como "alarma" cuando se le llama:
  private guardarDatos = new Subject<void>();
  guardarDatos$ = this.guardarDatos.asObservable();

  // para enviar las constantes al simulador
  private constantePorBombeo = new Subject<number>();
  constantePorBombeo$ = this.constantePorBombeo.asObservable();

  private constantePorConsumo = new Subject<number>();
  constantePorConsumo$ = this.constantePorConsumo.asObservable();

  // importante hacerlo con behaviorSubject porque a constantes.component no le da 
  // tiempo a suscribirse antes de que se pasen los datos, pero de esta manera le llegarán
  private constantesCargadas = new BehaviorSubject<any>(null);
  constantesCargadas$ = this.constantesCargadas.asObservable();

  // observable creado para la descarga de los arrays de lamina y producción
  private descargarDatos = new Subject<void>();
  descargarDatos$ = this.descargarDatos.asObservable();


  // Función que llama el navbar para que cambie la variable y 
  // detecte el cambio el simulador
  guardar() {
    // al ser un subject el tipo de observable, llamando a esta función
    // lo que hará es emitir una señal vacía (sin enviar datos) a los 
    // componentes que estén suscritos
    this.guardarDatos.next();
  }

  cargar(data: any) {
    this.cargarDatos.next(data);
  }

  // funciones que envian las constantes
  enviarConstantePorConsumo(data: any){
    this.constantePorConsumo.next(data); 
  }
  enviarConstantePorBombeo(data: any){
    this.constantePorBombeo.next(data); 
  }

  // función para mandar los datos si ya existian a las constantes
  recibirConstantesCargadas(data: any){
    this.constantesCargadas.next(data);
  }

  descargaDatos(){
    this.descargarDatos.next();
  }

}