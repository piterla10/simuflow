import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../componentes_comunes/navbar/navbar.component';
import { Cell, CellElement } from '../../services/Cell';
import { CommonModule } from '@angular/common';
import { SimulacionService } from '../../services/SimulacionService';
import { Subscription } from 'rxjs';
import { HerramientasEdicionComponent } from "../../componentes_edicion/herramientas_edicion/herramientas-edicion.component";
import { HerramientasSimulacionComponent } from "../../componentes_simulacion/herramientas-simulacion/herramientas-simulacion.component";
import { Herramienta } from '../../services/Herramienta';
import { Elemento } from '../../services/Elemento';
import { CrearElementoComponent } from "../../componentes_edicion/crear-elemento/crear-elemento.component";
import { ElementoDetallesComponent } from "../../componentes_edicion/elemento-detalles/elemento-detalles.component";
import { BasuraComponent } from '../../componentes_edicion/basura/basura.component';

@Component({
  selector: 'app-simulador',
  imports: [NavbarComponent, CommonModule, HerramientasEdicionComponent, HerramientasSimulacionComponent, CrearElementoComponent, ElementoDetallesComponent, BasuraComponent],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss'
})
export class SimuladorComponent implements OnInit {
  // para utilizar las funciones de abrir y cerrar modal 
  @ViewChild('elemento') modalCrearElemento!: CrearElementoComponent;
  @ViewChild('basura') modalBasura!: BasuraComponent;
  @ViewChild('elementoDetalles') modalElementoDetalles!: ElementoDetallesComponent;
  @ViewChild('navbar') modalNavbar!: NavbarComponent;

  constructor(private simulacionService: SimulacionService){}
  
  // Esta variable es para guardar la suscripción del observable que
  // se utiliza para guardar los datos del grid y tal. Se podría
  // hacer sin variable pero al utilizarla luego se puede destruir
  // en ngOnDestroy y se evitan fugas de memoria.
  private guardarDatos!: Subscription;
  private cargarDatos!: Subscription;

  // para el manejo del Grid
  // publico para que se pueda acceder desde el html
  public filas!: number;
  public columnas!: number;
  public celdaSeleccionada: Cell | null = null;
  private idElemento: number = 0;
  
  // información que recibimos de inicio o vamos rellenando
  private info: any;
  public datosGrid: Cell[] = [];


  // para cambiar las herramientas seleccionadas
  public modoActivo: 'edicion' | 'simulacion' = 'edicion';
  public herramientaEdicion: Herramienta = 'seleccionar'
  public elemento: Elemento = 'generador';

  // variable para controlar el modal activo
  private modalActual: string | null = null;

  ngOnInit(){


    // guardamos los datos del sistema
    const infoJSON = localStorage.getItem('infoGrid');
    if(infoJSON){
      this.info = JSON.parse(infoJSON);
      this.filas = this.info.filas;
      this.columnas = this.info.columnas;
    }

    const datosGridJSON = localStorage.getItem('datosGrid');
    if (datosGridJSON) {
      this.datosGrid = JSON.parse(datosGridJSON);
    } else {
      this.createGrid();
      // guardo por primera vez en localStorage
      this.guardarGrid();
    }

    // guardamos la suscripción en la variable y le asignamos que llame a 
    // guardarDatosSimulación() cuando se haga .next() en el service
    this.guardarDatos = this.simulacionService.guardarDatos$.subscribe(() => {
      this.guardarDatosSimulacion();
    });

    this.cargarDatos = this.simulacionService.cargarDatos$.subscribe(datos =>{
      if(datos){
        this.info = datos.info;
        this.datosGrid = datos.grid;
        this.filas = datos.info.filas;
        this.columnas = datos.info.columnas;
        // guardamos en el localstorage los datos nuevos
        this.guardarGrid();
        localStorage.setItem('infoGrid', JSON.stringify(this.info));
      }
    })
  }

  // destructor de la variable que estaba pendiente de si se clica el guardar
  ngOnDestroy() {
    this.guardarDatos?.unsubscribe();
    this.cargarDatos?.unsubscribe();
  }

  // --------------------------------------- SELECCIÓN DE MODO Y CAMBIO DE HERRAMIENTA ---------------------------------------

  // Función para cambiar de modo
  setModo(modo: 'edicion' | 'simulacion'){
    this.modoActivo = modo;
    if(modo === 'simulacion'){
      this.celdaSeleccionada = null;

      // cerramos los modales que pudieran estar abiertos
      if(this.modalActual){
        this.cerrarModales(this.modalActual);
      }
    }
    if(modo === 'edicion'){
      this.herramientaEdicion = 'seleccionar';
    }
  }

  // para que el clicar en una herramienta haga que el modo edición se 
  // comporte de una forma u otra
  cambioHerramienta(herramienta: Herramienta){
    // cerramos el modal que pueda estar abierto cuando se cambie de herramienta
    if(this.modalActual){
      this.cerrarModales(this.modalActual);
    }
    // si celdaSeleccionada tiene contenido la ponemos a null
    this.celdaSeleccionada && (this.celdaSeleccionada = null);

    switch(herramienta){
      case 'seleccionar':
        this.herramientaEdicion = herramienta;
        break;
      case 'mover':
        this.herramientaEdicion = herramienta;
        break;
      case 'lapiz':
        this.abrirModales('crearElemento');
        this.herramientaEdicion = herramienta;
        break;
      case 'borrador':
        this.herramientaEdicion = herramienta;
        break;
      case 'basura':
        this.abrirModales('basura');
        break;
    }
  }

  // --------------------------------------- CONTROLADORES PARA ABRIR Y CERRAR MODALES ---------------------------------------

  // no es perfecto porque si por ejemplo un modal se cierra desde la x, la variable modalActual 
  // no se habrá actualizado pero aun así funcionaría ya que al abrir otro modal, se intentaría 
  // volver a cerrar el que ya estaba cerrado y se abriría el nuevo
  abrirModales(nombreModal: string){
    switch(nombreModal){
      case 'crearElemento':
        this.modalCrearElemento.abrirModal();
        break;
      case 'basura':
        this.modalBasura.abrirModal();
        break;
      case 'elementoDetalles':
        this.modalElementoDetalles.abrirModal();
        break;
      case 'navbar':
        if(this.modalActual && this.modalActual !== 'navbar'){
          this.cerrarModales(this.modalActual)
        }
    }
    this.modalActual = nombreModal;
  }

  cerrarModales(nombreModal: string){
    switch(nombreModal){
      case 'crearElemento':
        this.modalCrearElemento.cerrarModal();  
        break;
      case 'basura':
        this.modalBasura.cerrarModal();
        break;
      case 'elementoDetalles':
        this.modalElementoDetalles.cerrarModal();
        break;
      case 'navbar':
        this.modalNavbar.cerrarModal();
        break;
      case '':
        // este caso es para cerrar todos los modales que puedan estar abiertos
        this.modalCrearElemento.cerrarModal();
        this.modalBasura.cerrarModal();
        this.modalElementoDetalles.cerrarModal();
        this.modalNavbar.cerrarModal();
        break;
    }
      this.modalActual = null;
  }

// --------------------------------------- GESTIÓN DEL CLICK EN EL CANVAS Y LAS FUNCIONES DE LAS HERRAMIENTAS ---------------------------------------

  // Controlador del comportamiento de los clicks en el canvas según 
  // la herramienta seleccionada
  controladorCanvas(cell: Cell){
    if(this.modoActivo === 'edicion'){
      switch(this.herramientaEdicion){
        case 'seleccionar':
          this.seleccionar(cell);
          break;
        case 'mover':
          this.mover(cell);
          break;
        case 'lapiz':
          this.lapiz(cell);
          break;
        case 'borrador':
          this.borrador(cell);
          break;
      }
    }else{
      // en este caso se seleccionaría el elemento y se podrían ver sus
      // detalles con el modal correspondiente, quizá capando la opción
      // de editar sus datos, con otro modal o modificando el que exista
    }
  }

  // para ver el contenido de una celda
  seleccionar(cell: Cell){
    if(this.celdaSeleccionada === cell){
      //desde aquí se cierra el modal
      this.cerrarModales('elementoDetalles')
      this.celdaSeleccionada = null;
    }else if(cell.content){
      this.celdaSeleccionada = cell;
      this.abrirModales('elementoDetalles');
    }
    
    // guardamos en localstorage
    this.guardarGrid();

  }

  // para mover el contenido de una celda a otra
  mover(cell: Cell){
    // si ya teníamos una celda previamente seleccionada y la que hemos clicado no 
    // tiene contenido entonces se le cambia de la anterior a esa
    if (this.celdaSeleccionada && !cell.content) {
      // Lógica para mover el contenido si hay uno seleccionado
      cell.content = this.celdaSeleccionada.content;
      this.celdaSeleccionada.content = null;
      this.celdaSeleccionada = null;

      // si no teníamos una seleccionada, la seleccionamos
    } else if (!this.celdaSeleccionada && cell.content) {
      this.celdaSeleccionada = cell;

      // si tenemos una seleccionada y la queremos cambiar por otra con contenido
    } else if(this.celdaSeleccionada && cell.content && this.celdaSeleccionada !== cell){
      const aux = this.celdaSeleccionada.content;
      this.celdaSeleccionada.content = cell.content;
      cell.content = aux;
      this.celdaSeleccionada = null;

      // si la celda que hemos seleccionado es la misma que teníamos ya seleccionada
      // ponemos la celda seleccionada a null
    } else if(this.celdaSeleccionada == cell){
      this.celdaSeleccionada = null;
    }
    // guardamos en localstorage
    this.guardarGrid();
  }

  private generarId(): number{
    return this.idElemento++;
  }

  // función para seleccionar el elemento a poner en el canvas
  cambioElemento(elemento: Elemento){
    this.elemento = elemento;
  }

  // para crear elementos en el sistema
  lapiz(cell:Cell){
    if(!cell.content){
      const celdaGrid = this.datosGrid.find(
        (celda) => celda.fila === cell.fila && celda.columna === cell.columna);
        
      let contenido: CellElement;
      switch(this.elemento){
      case 'consumo':
        contenido = {
            id: this.generarId(),
            tipo: 'consumo',
            imagen: 'assets/elementos/consumo_blanco.png',
            datosSimulacion: [0],
            // peligro: null
          };
        break;
      case 'deposito':
        contenido = {
            id: this.generarId(),
            tipo: 'deposito', 
            solera: 1,
            alturaActual: 1,
            capacidad: 5,
            alturaMax: 2.5,
            imagen: 'assets/elementos/deposito_blanco_4.png',
            peligro: null
          };
        break;
      case 'generador':
          contenido = {
            id: this.generarId(),
            tipo: 'generador',
            produccion: 0,
            cantidadMax: 30,
            imagen: 'assets/elementos/desaladora_blanco.png',
            // peligro: null
          };
        break;
      case 'tuberia':
        contenido = {
            id: this.generarId(),
            tipo: 'tuberia',
            presionMax: 10,
            presionMin: 1,
            presionActual: 5,
            imagen: 'assets/elementos/tuberia_blanco.png',
            peligro: null
          };
        break;
      }
      // esto funcionaría para todo menos las tuberías, habrá que tenerlo en cuenta
      
      celdaGrid!.content = contenido;
      // guardamos en localstorage
      this.guardarGrid();
    }
  }

  // funcion del borrador de eliminar el contenido de una celda
  borrador(cell:Cell){
    cell.content = null;
    // guardamos en localstorage
    this.guardarGrid();
  }

  // función de la basura para eliminar todo el contenido 
  confirmarBorrado(){
    // recorrer el array de this.datosGrid y vaciarlo entero
    for (let i = 0; i < this.datosGrid.length; i++) {
      this.datosGrid[i].content = null;
    }
    // guardamos en localstorage
    this.guardarGrid();
  }

  infoElemento(elemento: CellElement): string{
    switch (elemento.tipo) {
      case 'generador':
        // aquí sería la potencia a la que está encendida la bomba
          return `${elemento.produccion * 100}%`;
      case 'deposito':
        // altura del agua actual (nivel del agua en metros)
          return `${elemento.alturaActual}(m)`;
      case 'consumo':
        // consumo actual
        // habrá que arreglar esto cuando nos metamos en el tema simulación
          return `${elemento.datosSimulacion.join(', ')}`;
      case 'tuberia':
        // presión actual
          return `${elemento.presionActual}`;
    }
  }

// --------------------------------------- CREACIÓN DEL GRID Y MANEJO DEL GUARDADO Y CARGA DE DATOS ---------------------------------------
  // función para guardar los datos en la bd
  guardarDatosSimulacion() {
    const datos = {
      info: this.info,
      grid: this.datosGrid
    };

    const contenido = JSON.stringify(datos, null, 2);

    const blob = new Blob([contenido], {type: 'application/json'});

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${datos.info.nombre}.json`;
    enlace.click();

    URL.revokeObjectURL(url);

  }

  // para crear el grid
  createGrid(): void {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const cell = { fila: i, columna: j, content: null };
        this.datosGrid.push(cell);
      }
    }
  }

// -------------------------------- FUNCION PARA EL GUARDADO EN LOCALSTORAGE  ----------------------------

  guardarGrid(){
    localStorage.setItem('datosGrid', JSON.stringify(this.datosGrid));
  }

}

