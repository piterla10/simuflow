import { Component, Input, OnInit } from '@angular/core';
import { NavbarComponent } from "../../componentes_comunes/navbar/navbar.component";
import { InicioService } from '../../services/InicioService';
import { Cell } from '../../services/Cell';
import { CommonModule } from '@angular/common';
import { SimulacionService } from '../../services/SimulacionService';
import { Subscription } from 'rxjs';
import { HerramientasEdicionComponent } from "../../componentes_edicion/herramientas_edicion/herramientas-edicion.component";
import { HerramientasSimulacionComponent } from "../../componentes_simulacion/herramientas-simulacion/herramientas-simulacion.component";

@Component({
  selector: 'app-simulador',
  imports: [NavbarComponent, CommonModule, HerramientasEdicionComponent, HerramientasSimulacionComponent],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss'
})
export class SimuladorComponent implements OnInit {
  constructor(private inicioService: InicioService, 
    private simulacionService: SimulacionService){}
  
  // Para el guardado en la bd
  private saveSubscription!: Subscription;

  // para el manejo del Grid
  // publico para que se pueda acceder desde el html
  public filas!: number;
  public columnas!: number;
  public flatGrid: Cell[] = [];
  public celdaSeleccionada: Cell | null = null;
  
  // datos que recibimos de inicio
  private datos: any;
  private archivo: File | null = null;

  // para el cambiar las herramientas seleccionadas
  public modoActivo: 'edicion' | 'simulacion' = 'edicion';

  ngOnInit(){
    // guardamos los datos del sistema
    this.datos = this.inicioService.getDatos();
    this.archivo = this.inicioService.getArchivo();

    if(this.datos){
      this.filas = this.datos.filas;
      this.columnas = this.datos.columnas;
    }
    
    console.log(this.datos);
    console.log(this.archivo);

    // Creamos el grid 
    this.createGrid();

    this.saveSubscription = this.simulacionService.saveRequested$.subscribe(() => {
      this.guardarDatosSimulacion();
    });
  }

  // destructor de la variable que estaba pendiente de si se clica el guardar
  ngOnDestroy() {
    this.saveSubscription.unsubscribe();
  }

  // Función para cambiar de modo
  setModo(modo: 'edicion' | 'simulacion'): void {
    this.modoActivo = modo;
  }

  cambioLogica(herramienta: string){
    console.log(herramienta);
  }

  // función para guardar los datos en ls bd
  guardarDatosSimulacion() {
    // Aquí iría la llamada al servicio para guardar en BD
    // this.simulationService.guardarEnBD(datosParaGuardar);
  }

  // para crear el grid
  createGrid(): void {
    this.flatGrid = [];
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const cell = { fila: i, columna: j, content: null };
        this.flatGrid.push(cell);
      }
    }
  }

  // para mover el contenido de una celda a otra
  onCellClick(cell: Cell): void {
    if (this.celdaSeleccionada) {
      // Lógica para mover el contenido si hay uno seleccionado
      cell.content = this.celdaSeleccionada.content;
      this.celdaSeleccionada.content = null;
      this.celdaSeleccionada = null;
    } else if (cell.content) {
      // Selecciona una celda con contenido
      this.celdaSeleccionada = cell;
    } else {
      // Si está vacía, podrías permitir añadir contenido nuevo
      cell.content = { type: 'objeto1' }; // ejemplo
    }
  }
}
