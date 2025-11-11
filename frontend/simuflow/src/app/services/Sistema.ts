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

// Primero acabar las conexiones y luego empezar a crear las funciones que van a hacer que 
// con cada paso del sistema se rellenen los depósitos y demás. Partiendo de unos valores 
// que han generao las bombas, unos valores de consumo y ya con la diferencia que se llenen
// o se vacíen los depósitos correctamente.

// quizá habría que hacer una "copia de seguridad" de todos los datos del grid antes de empezar
// la simulación o los "pasos" para que cuando se vuelva al modo edición se pueda volver a 
// simular con los parámetros y tal que se tenía antes.
// Dónde se podría hacer: variable que guarde los datos o en localstorage la ultima versión 
// de los cambios, de forma que cuando se vuelva al modo edición se vuelva a cargar el sistema
// cargando las cosas de localstorage en su sitio

// hay que en algún lado tener los factores que alterarán los parámetros de los elementos
// por un lado el agua que generan las bombas y por otro cuanta es la demanda de las areas de 
// consumo y una vez se tenga eso se reparte el agua entre los depósitos que hayan disponibles
// Habría que mirar cómo hacer para que el agua se le de al depósito que tenga menos agua y 
// posteriormente repartir el agua sobrante en los dos si se da el caso de tener más de uno