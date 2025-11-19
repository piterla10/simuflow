// Definimos los tipos de elementos posibles
export type ElementType = 'generador' | 'deposito' | 'consumo' | 'tuberia';

// Interfaz base común para todos los elementos
interface BaseElement {
  tipo: ElementType;
  id: number;
  sistema: {id: number, porcentaje: number}[];
}

// Interfaces específicas para cada tipo de elemento
export interface Generador extends BaseElement {
  tipo: 'generador';
  produccion: number; // 0-1 fracción de actividad
  cantidadMax: number; // m³/hora cantidad maxima que es capaz de generar abierto al maximo
  // minimoRango: number; // momento en el que se apagaría el generador cuando genera 
                          // por debajo de este porcentaje. De momento no se tendrá en cuenta

  // esto representará también el color, ya que lo que hace cambiarlo es cambiar la imagen
  imagen: string; 
}

export interface Deposito extends BaseElement {
  tipo: 'deposito';
  solera: number; // m
  alturaMax: number;  // m
  capacidad: number;  // m³
  alturaActual: number; // m   laminaAgua
  imagen: string;
  volumenxPct: number; //
  pctActual: number; // 0-1
}

export interface ZonaConsumo extends BaseElement {
  tipo: 'consumo';
  imagen: string;
  datosSimulacion: Array<number>; // m³/hora
  consumoMaximo: number;
}

export interface Tuberia extends BaseElement {
  tipo: 'tuberia';
  presionMax: number;
  presionMin: number; 
  presionActual: number; // metros de columna de agua (m) | 1bar = 10m aprox
  imagen: string;
}


// Tipo union que representa cualquier elemento posible
export type CellElement = Generador | Deposito | ZonaConsumo | Tuberia;

export interface Cell {
  fila: number;
  columna: number;
  content: CellElement | null;
}