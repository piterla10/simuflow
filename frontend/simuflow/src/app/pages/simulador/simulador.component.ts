import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../componentes_comunes/navbar/navbar.component';
import { Cell, CellElement, Deposito, Generador } from '../../services/Cell';
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
import { Sistema } from '../../services/Sistema';
import { VelocidadComponent } from "../../componentes_simulacion/velocidad/velocidad.component";

@Component({
  selector: 'app-simulador',
  imports: [NavbarComponent, CommonModule, HerramientasEdicionComponent, HerramientasSimulacionComponent, CrearElementoComponent, ElementoDetallesComponent, BasuraComponent, VelocidadComponent],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss'
})
export class SimuladorComponent implements OnInit {
  // para utilizar las funciones de abrir y cerrar modal 
  @ViewChild('elemento') modalCrearElemento!: CrearElementoComponent;
  @ViewChild('basura') modalBasura!: BasuraComponent;
  @ViewChild('elementoDetalles') modalElementoDetalles!: ElementoDetallesComponent;
  @ViewChild('navbar') modalNavbar!: NavbarComponent;
  @ViewChild('herrSim') herramientaSim!: HerramientasSimulacionComponent;
  @ViewChild('velocidad') modalVelocidad!: VelocidadComponent;

  constructor(private simulacionService: SimulacionService){}
  
  // Esta variable es para guardar la suscripción del observable que
  // se utiliza para guardar los datos del grid y tal. Se podría
  // hacer sin variable pero al utilizarla luego se puede destruir
  // en ngOnDestroy y se evitan fugas de memoria.
  private guardarDatos!: Subscription;
  private cargarDatos!: Subscription;  
  // ahora las de las constantes
  private suscripcionPorBombeo!: Subscription;
  private suscripcionPorConsumo!: Subscription;


  // para el manejo del Grid
  // publico para que se pueda acceder desde el html
  public filas!: number;
  public columnas!: number;
  public celdaSeleccionada: Cell | null = null;
  private idElemento: number = 0;
  private idSistema!: number;
  
  // información que recibimos de inicio o vamos rellenando
  private info: any;
  public datosGrid: Cell[] = [];

  // para cambiar las herramientas seleccionadas
  public modoActivo: 'edicion' | 'simulacion' = 'edicion';
  public herramientaEdicion: Herramienta = 'seleccionar'
  public elemento: Elemento = 'generador';

  // para controlar la simulación
  public timeoutID: any;
  public timerActive: boolean = false;
  public tiempoCiclo: number = 1000; // ms
  public tiempoTranscurrido: number = 600000; // 10min en ms
  public index: number = 0;
  // variable que controla que se pueda seguir ejecutando la simulación porque las 
  // zonas de consumo aun tienen valores
  public valido: boolean = true;
  // Parametros para simular la evolución de la presión
    // esto es lo máximo que puede llegar a bajar la presión por consumo
  public constantePorConsumo = 15;
    // maximo que puede subir la presión por bombeo
  public constantePorBombeo = 15;


  // arrays para almacenar los valores de las láminas y de producción en la simulacion
  public produccion: {id: number, valor: number[]}[] = [];
  public laminas: {id: number, valor: number[]}[] = [];

  // variable para controlar el modal activo
  private modalActual: string | null = null;

  // variable para almacenar los sistemas que se vayan creando con los elementos
  public sistemas: Sistema[] = [];

  ngOnInit(){
    // cargamos los datos de localstorage si los hay
    this.cargarDatosLocalStorage();

    // guardamos la suscripción en la variable y le asignamos que llame a 
    // guardarDatosSimulación() cuando se haga .next() en el service
    this.guardarDatos = this.simulacionService.guardarDatos$.subscribe(() => {
      this.guardarDatosSimulacion();
    });

    // cargamos los datos de un archivo cuando se nos pase uno
    this.cargarDatos = this.simulacionService.cargarDatos$.subscribe(datos =>{
      if(datos){
        this.info = datos.info;
        this.filas = datos.info.filas;
        this.columnas = datos.info.columnas;
        this.datosGrid = datos.grid;
        this.idElemento = datos.idElemento;
        this.idSistema = datos.idSistema;
        this.constantePorConsumo = datos.constantes.constantePorConsumo;
        this.constantePorBombeo = datos.constantes.constantePorBombeo;
        // la función es para que al cargar el archivo se cambien los valores de las
        // variables de constantes.component
        this.simulacionService.recibirConstantesCargadas(datos.constantes);
        this.tiempoCiclo = datos.reloj.tiempoCiclo;
        this.tiempoTranscurrido = datos.reloj.tiempoTranscurrido;
        
        this.sistemas = datos.sistemas.map((d: any) => {
          const sistema = new Sistema(
            d.id,
            d.tuberia,      // temporal, será revinculado
            d.depositos,    // temporal
            d.generadores,  // temporal
            d.consumo       // temporal
          );
          sistema.valido = d.valido ?? true;
          return sistema;
        });

        // guardamos en el localstorage los datos nuevos
        this.guardarGrid();
        this.guardarSistemas();
        this.guardarConstantes();
        this.guardarReloj();

        this.revincularSistemas();

        // rellenamos los arrays de lamina y producción
        this.registrarEnArrayCargando();

        localStorage.setItem('infoGrid', JSON.stringify(this.info));
      }
    });

    this.suscripcionPorConsumo = this.simulacionService.constantePorConsumo$.subscribe(datos =>{
      this.constantePorConsumo = datos;
      // guardamos los datos en localstorage
      this.guardarConstantes();
    });

    this.suscripcionPorBombeo = this.simulacionService.constantePorBombeo$.subscribe(datos =>{
      this.constantePorBombeo = datos;
      // guardamos los datos en localstorage
      this.guardarConstantes();
    });



  }

  // destructor de la variable que estaba pendiente de si se clica el guardar
  ngOnDestroy() {
    this.guardarDatos?.unsubscribe();
    this.cargarDatos?.unsubscribe();
    this.suscripcionPorBombeo?.unsubscribe();
    this.suscripcionPorConsumo?.unsubscribe();
  }

  // --------------------------------------- SELECCIÓN DE MODO Y CAMBIO DE HERRAMIENTA ---------------------------------------

  // Función para cambiar de modo
  setModo(modo: 'edicion' | 'simulacion'){
    this.modoActivo = modo;
    
    // cerramos los modales que pudieran estar abiertos
    if(this.modalActual){
      this.cerrarModales(this.modalActual);
    }
    this.celdaSeleccionada = null;
    if(modo === 'simulacion'){  
      // de momento esto lo dejamos vacío 
    }
    if(modo === 'edicion'){
      this.herramientaEdicion = 'seleccionar';
      this.stop();
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
      // ++++++++++++++++++++++  MODO EDICIÓN  ++++++++++++++++++++++
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
      // ++++++++++++++++++++++  MODO SIMULACIÓN  ++++++++++++++++++++++
      case 'play':
          this.play();
        break;
      case 'pause':
          this.pause();
        break;
      case 'stop':
        // paramos la simulación y reiniciamos todos sus valores
        this.stop();
        break;
      case 'step':
        // si el timer está parado entonces que le deje ejecutar el siguiente paso
        if(!this.timerActive)
          this.step();
        break;
      case 'reloj':
        this.abrirModales('velocidad');
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
          this.cerrarModales(this.modalActual);
          this.celdaSeleccionada = null;
        }
        break;
      case 'velocidad':
        this.modalVelocidad.abrirModal();
        break;
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
      case 'velocidad':
        this.modalVelocidad.cerrarModal();
        break;
      case '':
        // este caso es para cerrar todos los modales que puedan estar abiertos
        this.modalCrearElemento.cerrarModal();
        this.modalBasura.cerrarModal();
        this.modalElementoDetalles.cerrarModal();
        this.modalNavbar.cerrarModal();
        this.modalVelocidad.cerrarModal();
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
      // cuando esté parada la simulación que pueda seleccionar los atributos
      if(!this.timerActive){
        this.seleccionar(cell);
      }
    }
  }

  // para ver el contenido de una celda
  seleccionar(cell: Cell){
    if(this.celdaSeleccionada === cell){
      //desde aquí se cierra el modal
      this.cerrarModales('elementoDetalles')
      this.celdaSeleccionada = null;
    }else if(cell.content){
      this.cerrarModales('');
      this.celdaSeleccionada = cell;
      this.abrirModales('elementoDetalles');
    }

    // esto es para tener en localstorage los datos de los elementos antes de la simulación
    if(this.modoActivo !== 'simulacion'){
      // guardamos en localstorage
      this.guardarGrid();
    }
  }

  // para mover el contenido de una celda a otra
  mover(cell: Cell){
    // si ya teníamos una celda previamente seleccionada y la que hemos clicado no 
    // tiene contenido entonces se le cambia de la anterior a esa
    if (this.celdaSeleccionada && !cell.content) {
      // if necesario para el correcto funcionamiento de la asignación de sistemas
      if(this.celdaSeleccionada.content?.tipo !== 'tuberia'){
        this.desasignarTodo(this.celdaSeleccionada);
      }

      // Lógica para mover el contenido si hay uno seleccionado
      cell.content = this.celdaSeleccionada.content;
      this.celdaSeleccionada.content = null;
      this.celdaSeleccionada = null;

      // si no teníamos una seleccionada, la seleccionamos
    } else if (!this.celdaSeleccionada && cell.content) {
      this.celdaSeleccionada = cell;

      // si tenemos una seleccionada y la queremos cambiar por otra con contenido
    } else if(this.celdaSeleccionada && cell.content && this.celdaSeleccionada !== cell){
      // if necesario para el correcto funcionamiento de la asignación de sistemas
      if(this.celdaSeleccionada.content?.tipo !== 'tuberia'){
        this.desasignarTodo(this.celdaSeleccionada);
        if(cell.content?.tipo === 'tuberia'){
          this.borrarSistema(cell);
        }else{
          this.desasignarTodo(cell);
        }
      }else{
        this.borrarSistema(this.celdaSeleccionada);
        if(cell.content?.tipo === 'tuberia'){
          this.borrarSistema(cell);
        }else{
          this.desasignarTodo(cell);
        }
      }

      const aux = this.celdaSeleccionada.content;
      this.celdaSeleccionada.content = cell.content;
      cell.content = aux;
      this.celdaSeleccionada = null;

      // si la celda que hemos seleccionado es la misma que teníamos ya seleccionada
      // ponemos la celda seleccionada a null
    } else if(this.celdaSeleccionada == cell){
      this.celdaSeleccionada = null;
    }

    // comprobamos el estado de los sistemas actual
    this.estadoSistemas();

    // guardamos en localstorage
    this.guardarGrid();
  }

  // función para seleccionar el elemento a poner en el canvas
  cambioElemento(elemento: Elemento){
    this.elemento = elemento;
  }

  // para crear elementos en el sistema
  lapiz(cell:Cell){
    // si la celda no tiene un elemento ya
    if(!cell.content){
      // creamos el contenido a introducir en la celda
      let contenido: CellElement;
      switch(this.elemento){
      case 'consumo':
        contenido = {
            id: this.generarId(),
            tipo: 'consumo',
            imagen: 'assets/elementos/consumo_blanco.png',
            datosSimulacion: [0],
            consumoMaximo: 100,
            sistema: []
          };
        break;
      case 'deposito':
        contenido = {
            id: this.generarId(),
            tipo: 'deposito', 
            solera: 1,
            alturaActual: 2,
            capacidad: 100,
            alturaMax: 4,
            imagen: 'assets/elementos/deposito_blanco_4.png',
            volumenxPct: 100 * 0.01,
            pctActual: 2 / 4,
            sistema: []
        };
        break;
      case 'generador':
          contenido = {
            id: this.generarId(),
            tipo: 'generador',
            produccion: 0,
            cantidadMax: 30,
            imagen: 'assets/elementos/desaladora_blanco.png',
            sistema: []
          };
        break;
      case 'tuberia':
        contenido = {
            id: this.generarId(),
            tipo: 'tuberia',
            presionMax: 10,
            presionMin: 1,
            presionActual: -1,
            imagen: 'assets/elementos/tuberia_blanco.png',
            sistema: []
          };
        break;
      }
      
      cell!.content = contenido;

      // comprobamos el estado de los sistemas actual
      this.estadoSistemas();

      // guardamos en localstorage
      this.guardarGrid();
    }
  }

  // funcion del borrador de eliminar el contenido de una celda
  borrador(cell:Cell){
    if(cell.content?.tipo === "tuberia"){
      this.borrarSistema(cell);
    }else{
      this.desasignarTodo(cell);
    }
    cell.content = null;
    
    // comprobamos el estado de los sistemas actual
    this.estadoSistemas();
    
    // guardamos en localstorage
    this.guardarGrid();
  }

  // función de la basura para eliminar todo el contenido 
  confirmarBorrado(){
    // recorrer el array de this.datosGrid y vaciarlo entero
    for (let i = 0; i < this.datosGrid.length; i++) {
      this.datosGrid[i].content = null;
    }

    // vaciamos los arrays de simulación
    this.laminas = [];
    this.produccion = [];

    // vaciamos el array de sistemas
    this.sistemas = [];
    
    // guardamos en localstorage
    this.guardarGrid();
    this.guardarSistemas();
  }

  // información que muestra cada elemento a la izquierda
  infoElemento(elemento: CellElement): string{
    const format = (num: number) => Number(num).toFixed(2);

    switch (elemento.tipo) {
      case 'generador':
        // aquí sería la potencia a la que está encendida la bomba
        return `${format(elemento.produccion * 100)}%`;
      case 'deposito':
        // altura del agua actual (nivel del agua en metros)
        return `${format(elemento.alturaActual)}(m)
                ${format(elemento.pctActual * 100)}%`;
      case 'consumo':
        // consumo actual
        if(elemento.datosSimulacion[this.index] == 0){
          return '0';
        }
        if(!elemento.datosSimulacion[this.index]){
          return '-1';
        }
          return `${format(elemento.datosSimulacion[this.index])}`;
      case 'tuberia':
        // presión actual
        return `${format(elemento.presionActual)}`;
    }
  }

  // para cambair los valores del reloj
  procesarTiempoCiclo(numero: number){
    this.tiempoCiclo = numero;
    // guardamos los datos en localstorage;
    this.guardarReloj();
  }
  procesarTiempoTranscurrido(numero: number){
    this.tiempoTranscurrido = numero;
    this.guardarReloj();
  }

// --------------------------------------- LOGICA DE LAS TUBERÍAS --------------------------------------- 
  // función que se encarga de crear las conexiones entre elementos y las guarda en sistemas
  estadoSistemas(){
    // variable auxiliar para la comprobación de las celdas adyacentes
    const vecinos = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const cell of this.datosGrid) {
    // el continue sirve para hacer que se pase a la siguiente iteración del bucle sin ejecutar lo que 
    // queda dentro del mismo
      // si encontramos una tubería
      if (cell.content?.tipo !== 'tuberia') continue;
      
      let auxGeneradores: Cell[] = [];
      let auxDepositos: Cell[] = [];
      let auxAreas: Cell[] = [];
      
      // comprobamos sus vecinos guardando los que encontremos en los arrays de arriba
      for (const [dx, dy] of vecinos) {
  
        const nf = cell.fila + dx;
        const nc = cell.columna + dy;
  
        const vecino = this.getCell(nf, nc);
        if (!vecino || !vecino.content) continue;
  
        switch (vecino.content.tipo) {
          case 'generador':
            auxGeneradores.push(vecino);
            break;
          case 'deposito':
            auxDepositos.push(vecino);
            break;
          case 'consumo':
            auxAreas.push(vecino);
            break;
        }
      }

      // si pertenece a un sistema
      if(cell.content.sistema.length === 1){
        
        // comprobamos cual es el id del sistema al que queremos acceder viendo el sistema al que 
        // pertenece la tubería
        const sistemaId = cell.content!.sistema[0].id;
        // una vez lo tenemos buscamos el sistema en el array de sistemas para hacer las comprobaciones
        const sistema = this.sistemas.find(s => s.id === sistemaId);
        // esto es solo por seguridad 
        if(!sistema) continue;

        // se comprueba si el sistema es válido
        if(auxGeneradores.length > 0 && auxDepositos.length > 0 && auxAreas.length > 0){
          // comprobamos si hay algún elemento que ya no se encuentra en el sistema y lo guardamos
          let depositosCambiados = this.encontrarElementos(sistema!.depositos, auxDepositos);
          let generadoresCambiados = this.encontrarElementos(sistema!.generadores, auxGeneradores);
          let areasCambiadas = this.encontrarElementos(sistema!.consumo, auxAreas);

          // borramos los sistemas de los elementos viejos
          this.desasignarSistemaElemento(depositosCambiados, sistemaId);
          this.desasignarSistemaElemento(generadoresCambiados, sistemaId);
          this.desasignarSistemaElemento(areasCambiadas, sistemaId);
          

          // Borramos del sistema los elementos que ya no están de esta forma al volver a llamar a
          // encontrarElementos ya te devolvería solo los elementos que se han añadido nuevos ya que
          // son los que NO se encuentran en el sistema
          sistema!.depositos = this.limpiarSistema(sistema!.depositos, depositosCambiados);
          sistema!.generadores = this.limpiarSistema(sistema!.generadores, generadoresCambiados);
          sistema!.consumo = this.limpiarSistema(sistema!.consumo, areasCambiadas);


          // buscamos los elementos nuevos que se puedan haber añadido al sistema
          depositosCambiados = this.encontrarElementos(auxDepositos, sistema!.depositos);
          generadoresCambiados = this.encontrarElementos(auxGeneradores, sistema!.generadores);
          areasCambiadas = this.encontrarElementos(auxAreas, sistema!.consumo);


          // añadimos los sistemas a los elementos nuevos
          this.asignarSistemaElemento(depositosCambiados, sistemaId);
          this.asignarSistemaElemento(generadoresCambiados, sistemaId);
          this.asignarSistemaElemento(areasCambiadas, sistemaId);


          // registramos los elementos en los arrays de la simulación
          this.registrarEnArray(auxGeneradores, auxDepositos);

          
          // añadimos los elementos nuevos al sistema
          sistema!.depositos = auxDepositos;
          sistema!.generadores = auxGeneradores;
          sistema!.consumo = auxAreas;

        // si el sistema no es valido 
        }else{
          // se elimina el sistema de todos los elementos incluido la tubería
          this.desasignarSistemaElemento(sistema!.depositos, sistema!.id);
          this.desasignarSistemaElemento(sistema!.generadores, sistema!.id);
          this.desasignarSistemaElemento(sistema!.consumo, sistema!.id);
          this.desasignarSistemaElemento([cell], sistema!.id);

          // se elimina el sistema del array de sistemas
          this.sistemas = this.sistemas.filter(s => s.id !== sistema!.id);
        }
      }else{
        // si no pertenece a un sistema, comprueba si sería válido y lo crearía en caso de que así sea,
        // si no es válido simplemente no se crearía nada
        if (auxGeneradores.length > 0 && auxDepositos.length > 0 && auxAreas.length > 0) {
          // creamos una instancia de la clase Sistema y rellenamos sus parámetros
          let sistemaNuevo = new Sistema(
            this.idSistema,
            cell,
            auxDepositos,
            auxGeneradores,
            auxAreas
          );
          
          // añadimos al depósito el sistema al que pertenece
          this.asignarSistemaElemento(auxDepositos);
  
          // añadimos al generador el sistema al que pertenece
          this.asignarSistemaElemento(auxGeneradores);
  
          // añadimos a la zona de consumo el sistema al que pertenece
          this.asignarSistemaElemento(auxAreas);

          // añadimos a la tubería el sistema al que pertenece
          this.asignarSistemaElemento([cell]);


          // registramos los elementos en los arrays de la simulación
          this.registrarEnArray(auxGeneradores, auxDepositos);
  
          this.sistemas.push(sistemaNuevo);
          this.generarIdSistema();
        }
      }        
    }

    // guardamos los sistemas en localstorage
    this.guardarSistemas();
  }

  // función auxiliar para asignar un nuevo sistema a un elemento
  // Según se le pase identificador o no, servirá para cuando se le esté añadiendo un sistema nuevo 
  // o para cuando se esté añadiendo un sistema que ya estaba creado al elemento
  asignarSistemaElemento(elemento: Cell[], identificador?: number){
    for(const el of elemento){
      // recorremos el elemento, si pertenece ya a algún sistema
      if(el.content?.sistema.length! > 0){
        // recorremos su array de sistemas
        for(const aux of el.content?.sistema!){
        // y actualizamos su porcentaje dividiendolo entre el número nuevo de sistemas a los que pertenece
          aux.porcentaje = 100 / (el.content?.sistema.length! + 1);
        }
      }
      // después se añade el nuevo sistema a su array de sistemas con el porcentaje correcto
      el.content?.sistema.push({id: identificador !== undefined ? identificador : this.idSistema, porcentaje: 100 / (el.content?.sistema.length + 1)});
    }
  }

  // función auxiliar para eliminar un sistema de un elemento
  desasignarSistemaElemento(elemento: Cell[], identificador: number){
    for(const el of elemento){
      // recorremos el elemento, si pertenece a más de un sistema
      if(el.content?.sistema.length! > 1){
        // recorremos su array de sistemas
        for(const aux of el.content?.sistema!){
        // y actualizamos su porcentaje dividiendolo entre el número nuevo de sistemas a los que pertenece
          aux.porcentaje = 100 / (el.content?.sistema.length! - 1);
        }
      }else{
        // eliminamos los elementos del array donde estén si se da el caso de que solo pertenecen a un sistema
        if (el.content?.tipo === 'generador') {
          this.produccion = this.produccion.filter(p => p.id !== el.content!.id);
        }

        if (el.content?.tipo === 'deposito') {
          this.laminas = this.laminas.filter(l => l.id !== el.content!.id);
        }
      }
      // borramos el sistema al que pertenecía anteriormente
      el.content!.sistema = el.content!.sistema.filter(
        s => s.id !== identificador
      );
    }
  }

  // función auxiliar para encontrar los elementos del array actual que no están en nuevos
  encontrarElementos(actual: Cell[], nuevos: Cell[]){
    return actual.filter(a => !nuevos.some(n => n.content?.id === a.content?.id));
  }

  // función auxiliar para eliminar del sistema los elementos que se le pasan en removidos
  limpiarSistema(original: Cell[], removidos: Cell[]): Cell[] {
    return original.filter(
      o => !removidos.some(r => r.content!.id === o.content!.id)
    );
  }

  // función para borrar un sistema en caso de que el elemento que se borre sea una tuberia
  borrarSistema(cell: Cell){
    // si pertenece a un sistema
    if(cell.content!.sistema.length === 1){
      // comprobamos cual es el id del sistema al que queremos acceder viendo el sistema al que 
      // pertenece la tubería
      const sistemaId = cell.content!.sistema[0].id;
      // una vez lo tenemos buscamos el sistema en el array de sistemas para hacer las comprobaciones
      const sistema = this.sistemas.find(s => s.id === sistemaId);
  
      // se elimina el sistema de todos los elementos, la tubería no hace falta porque se va a 
      // borrar el elemento entero, así que lo mismo da que tenga un sistema u otro
      this.desasignarSistemaElemento(sistema!.depositos, sistema!.id);
      this.desasignarSistemaElemento(sistema!.generadores, sistema!.id);
      this.desasignarSistemaElemento(sistema!.consumo, sistema!.id);
      // se borra también en el caso de que se llame a la función desde mover
      this.desasignarSistemaElemento([sistema!.tuberia], sistema!.id);
  
      // se elimina el sistema del array de sistemas
      this.sistemas = this.sistemas.filter(s => s.id !== sistema!.id);
    }
  }

  // función que se llama desde el html para indicar el numero de sistema al que pertenece el elemento
  infoSistema(cell: Cell): number[]{
    if (!cell.content?.sistema?.length) return [];

    // ordenamos por id y los devolvemos
    return cell.content.sistema
      .map(s => s.id)
      .sort((a, b) => a - b);
  }

  // función auxiliar que se llama cuando se mueve o elimina un objeto que sirve para eliminar el sistema 
  // del mismo y el propio elemento de su sistema. De esta forma cuando se ejecute estadoSistema no dará error
  desasignarTodo(cell: Cell){
    // si no pertenece a ningún sistema salimos
    if(!cell.content!.sistema) return;
    
    // encontramos el o los sistemas al que pertenece la cell 
    const sistemasIds = cell.content!.sistema.map(s => s.id);
    
    // por cada sistema
    for (const id of sistemasIds) {
      // buscamos el que coincide
      const sistema = this.sistemas.find(s => s.id === id);
      if (!sistema) continue;

      // --- BORRAR DE SUS ARRAYS SEGÚN EL TIPO ---
      switch (cell.content!.tipo) {
        case 'deposito':
          sistema.depositos = sistema.depositos.filter(
            d => d.content?.id !== cell.content!.id
          );

      // si los elementos solo pertenecían a un sistema y se borra desde aquí, también los sacamos de los arrays
          if(cell.content?.sistema.length ==  1){
            this.laminas = this.laminas.filter(l => l.id !== cell.content!.id);
          }
          break;

        case 'generador':
          sistema.generadores = sistema.generadores.filter(
            g => g.content?.id !== cell.content!.id
          );
          
      // si los elementos solo pertenecían a un sistema y se borra desde aquí, también los sacamos de los arrays
          if(cell.content?.sistema.length ==  1){
            this.produccion = this.produccion.filter(p => p.id !== cell.content!.id);
          }
          break;

        case 'consumo':
          sistema.consumo = sistema.consumo.filter(
            c => c.content?.id !== cell.content!.id
          );
          break;
      }
    }
      // eliminamos el sistema al que pertenece si se da el caso
      cell.content!.sistema = [];
    
  }

// --------------------------------------- LOGICA DE LA SIMULACIÓN ---------------------------------------

  play(){
    this.timerActive = true;
    this.timeoutID = setTimeout(() => {
      // Guardamos los datos actuales correspondientes en los arrays
      this.guardarDatoDeProduccion();
      this.guardarDatoDeLamina();

      if(this.valido){
        // ejecutamos los calculos de todos los sistemas para el siguiente paso
        for(const sistema of this.sistemas){
          sistema.emitir(this.index, this.tiempoTranscurrido, this.produccion, this.constantePorConsumo, this.constantePorBombeo);
          // comprobamos que se pueden seguir ejecutando 
          if(!sistema.valido){
            this.valido = false;
          }
        }
        this.index++;
        this.play()
      }
    }, this.tiempoCiclo);
  }

  pause(){
    this.timerActive = false;
    clearTimeout(this.timeoutID);
  }

  step(){
    // Guardamos los datos actuales correspondientes en los arrays
    this.guardarDatoDeProduccion();
    this.guardarDatoDeLamina();

    // si se puede hacer el step
    if(this.valido){
      for(const sistema of this.sistemas){
        sistema.emitir(this.index, this.tiempoTranscurrido, this.produccion, this.constantePorConsumo, this.constantePorBombeo);
        // comprobamos que se pueden seguir ejecutando 
        if(!sistema.valido){
          this.valido = false;
        }
      }
      this.index++;
    }
  }

  stop(){
    // paramos la ejecución del timeout
    this.timerActive = false;
    clearTimeout(this.timeoutID);
    // cambiamos el icono de pause a play ya que el activo es pause al parar
    this.herramientaSim.herramientaActiva = 'pause';
    // reiniciamos los datos de la simulación
    this.index = 0;
    this.valido = true;

    // reiniciamos los valores del grid y del sistema
    this.cargarDatosLocalStorage();
    
    // esto se hace para que funcione correctamente el if de las funciones de abajo
    for(const dep of this.laminas){
      dep.valor = [0];
    }
    for(const gen of this.produccion){
      gen.valor = [0];
    }

    // Guardamos de nuevo en los arrays el primer valor que tenía cada generador y depósito
    this.guardarDatoDeProduccion();
    this.guardarDatoDeLamina();
  }

  // stepBack(){}

  registrarEnArray(auxGeneradores: Cell[], auxDepositos: Cell[]){
    for(const gen of auxGeneradores){
      const g = gen.content as Generador;
      if(!this.produccion.some(p => p.id === gen.content!.id)){
        this.produccion.push({
          id: gen.content!.id,
          valor: [g.produccion]
        });
      }
    }

    for (const dep of auxDepositos) {
      const d = dep.content as Deposito;
      if (!this.laminas.some(l => l.id === dep.content!.id)) {
        this.laminas.push({
          id: dep.content!.id,
          valor: [d.alturaActual]
        });
      }
    }
  }

  registrarEnArrayCargando(){
    // rellenamos los arrays de lamina y producción
    this.laminas = [];
    this.produccion = [];

    for (const sistema of this.sistemas) {
      for (const dep of sistema.depositos) {
        // Si no está ya añadido
        const d = dep.content as Deposito;
        if (!this.laminas.some(l => l.id === dep.content!.id)) {
          this.laminas.push({ id: dep.content!.id, valor: [d.alturaActual] });
        }
      } 

      for (const gen of sistema.generadores) {
        const g = gen.content as Generador;
        // Si no está ya añadido
        if (!this.produccion.some(p => p.id === gen.content!.id)) {
          this.produccion.push({ id: gen.content!.id, valor: [g.produccion] });
        }
      }
    }
  }

  guardarDatoDeProduccion(){
  // Recorremos el array de producción
    for(const gen of this.produccion){
      // buscamos el valor de producción que tiene cada generador en el paso actual
      const g = this.datosGrid.find(d => d.content?.id == gen.id)!.content as Generador;
      // de forma que si es la primera vez que se hace, que solo se actualice el primer dato de valor
      if(gen.valor.length - 1  == 0 && this.valido){
        gen.valor[this.index] = g.produccion;
      // pero si ya hemos avanzado algún paso en la simulación, que guarde el valor actual en una nueva 
      // posición, para que tenga tantos valores como pasos se vayan a ejecutar. En el paso 2 habrán 2 valores
      }else if(gen.valor.length == this.index){
        gen.valor.push(g.produccion);
      }
    }
  }

  guardarDatoDeLamina(){
  // Recorremos el array de producción
    for(const dep of this.laminas){
      // buscamos el valor de producción que tiene cada generador en el paso actual
      const l = this.datosGrid.find(d => d.content?.id == dep.id)!.content as Deposito;
      // de forma que si es la primera vez que se hace, que solo se actualice el primer dato de valor
      if(dep.valor.length - 1  == 0 && this.valido){
        dep.valor[this.index] = l.alturaActual;
      // pero si ya hemos avanzado algún paso en la simulación, que guarde el valor actual en una nueva 
      // posición, para que tenga tantos valores como pasos se vayan a ejecutar. En el paso 2 habrán 2 valores
      }else if(dep.valor.length == this.index){
        dep.valor.push(l.alturaActual);
      }
    }
  }

// --------------------------------------- CREACIÓN DEL GRID Y MANEJO DEL GUARDADO DE DATOS ---------------------------------------
  // función para guardar los datos en un archivo json
  guardarDatosSimulacion() {
    const datos = {
      info: this.info,
      grid: this.datosGrid,
      idElemento: this.idElemento,
      sistemas: this.sistemas,
      idSistema: this.idSistema,
      constantes: {constantePorBombeo: this.constantePorBombeo, constantePorConsumo: this.constantePorConsumo},
      reloj: {tiempoCiclo: this.tiempoCiclo, tiempoTranscurrido: this.tiempoTranscurrido}
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

// --------------------------------------- FUNCIONES PARA EL GUARDADO EN LOCALSTORAGE  ---------------------------------------

  guardarGrid(){
    localStorage.setItem('datosGrid', JSON.stringify(this.datosGrid));
    localStorage.setItem('idElemento', JSON.stringify(this.idElemento));
  }

  guardarSistemas(){
    localStorage.setItem('datosSistemas', JSON.stringify(this.sistemas));
    localStorage.setItem('idSistema', JSON.stringify(this.idSistema));
  }

  guardarConstantes(){
    localStorage.setItem('constantes', JSON.stringify({
      constantePorConsumo: this.constantePorConsumo,
      constantePorBombeo: this.constantePorBombeo
    }));
  }

  guardarReloj(){
    localStorage.setItem('reloj', JSON.stringify({
      tiempoCiclo: this.tiempoCiclo,
      tiempoTranscurrido: this.tiempoTranscurrido
    }));
  }

  cargarDatosLocalStorage(){
    // cargamos los datos del sistema de localstorage
    const infoJSON = localStorage.getItem('infoGrid');
    if(infoJSON){
      this.info = JSON.parse(infoJSON);
      this.filas = this.info.filas;
      this.columnas = this.info.columnas;
    }

    const datosGridJSON = localStorage.getItem('datosGrid');
    if(datosGridJSON) {
      this.datosGrid = JSON.parse(datosGridJSON);
      // si no tenemos en localstorage datosGrid
    } else {
      this.createGrid();
      // guardo por primera vez en localStorage
      this.guardarGrid();
    }
    
    // cargamos los ids
    this.idElemento = JSON.parse(localStorage.getItem('idElemento') || '0');
    this.idSistema = JSON.parse(localStorage.getItem('idSistema') || '1');
    
    const sistemasJSON = localStorage.getItem('datosSistemas');
    if(sistemasJSON){
      const sistemasData = JSON.parse(sistemasJSON);
      
      // Reconstruir instancias de Sistema
      this.sistemas = sistemasData.map((d: any) => {
        const sistema = new Sistema(
          d.id,
          d.tuberia,       // temporal, será revinculado
          d.depositos,     // temporal, será revinculado
          d.generadores,   // temporal, será revinculado
          d.consumo        // temporal, será revinculado
        );
        sistema.valido = d.valido ?? true;
        return sistema;
      });
    }

    // constantes de la simulación
    const constantesJSON = localStorage.getItem('constantes');
    if(constantesJSON){
      const constantes = JSON.parse(constantesJSON);
      this.constantePorConsumo = constantes.constantePorConsumo;
      this.constantePorBombeo = constantes.constantePorBombeo;
      this.simulacionService.recibirConstantesCargadas(constantes);
    }

    const relojJSON = localStorage.getItem('reloj');
    if(relojJSON){
      this.tiempoCiclo = JSON.parse(relojJSON).tiempoCiclo;
      this.tiempoTranscurrido = JSON.parse(relojJSON).tiempoTranscurrido;
    }
    
    this.revincularSistemas();

    // rellenamos los arrays de lamina y producción
    this.registrarEnArrayCargando();
  }

// --------------------------------------- OTRAS FUNCIONES  ---------------------------------------


  private generarId(): number{
    return this.idElemento++;
  }

  private generarIdSistema(): number{
    return this.idSistema++;
  }

  getCell(fila: number, columna: number): Cell | null {
    return this.datosGrid.find(c => c.fila === fila && c.columna === columna) || null;
  }

  private revincularSistemas(){
    for (const sistema of this.sistemas) {
      sistema.depositos = sistema.depositos.map(dep =>
          this.getCell(dep.fila, dep.columna)!
      );

      sistema.generadores = sistema.generadores.map(gen =>
          this.getCell(gen.fila, gen.columna)!
      );

      sistema.consumo = sistema.consumo.map(are =>
          this.getCell(are.fila, are.columna)!
      );

      sistema.tuberia = this.getCell(
          sistema.tuberia.fila,
          sistema.tuberia.columna
      )!;
    }
  }

  imagenDeposito(content: any): string{
    if (content.tipo !== 'deposito') {
      return content.imagen; // para los demás tipos
    }
    // Separamos la imagen en -> ["deposito", "gris", "5.png"]
    const partes = content.imagen.split("_");  

    // La comprobación del min y el max es por si acaso, en principio no va a hacer falta nunca
    const nivel = Math.min(8, Math.max(0, Math.floor(content.pctActual * 9)));

    // Se cambia la parte final y se devuelve la imagen correcta
    partes[partes.length - 1] = `${nivel}.png`;

    return partes.join("_");
  }
}

