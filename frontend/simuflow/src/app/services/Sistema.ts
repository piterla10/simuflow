import { Cell } from "./Cell";

export class Sistema {
    id!: number;
    tuberia!: Cell;
    depositos!: Cell[];
    generadores!: Cell[];
    consumo!: Cell[];
    
// habrá que añadir aquí una instancia de cada agente
};

// después los agentes con por lo menos los parametros que tiene cada uno
// habría que ver si añadir '-WTF', 'WPF', '+WTF' en los depósitos

// si tienes un depósito conectado a dos sistemas y se está llenando, ¿se apagarían
// las bombas de los dos sistemas? 

// si tienes un generador conectado a dos sistemas y el sistema 1 está pidiendo que lo
// apagues pero el sistema 2 está pidiendo agua, que pasaría?