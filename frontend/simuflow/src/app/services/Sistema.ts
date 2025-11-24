import { Cell, Deposito, Generador, Tuberia, ZonaConsumo } from "./Cell";

export class Sistema {
// --------------------------- PARÁMETROS DESDE SIMULACIÓN ---------------------------
    constructor(
        public id: number,
        public tuberia: Cell,
        public depositos: Cell[],
        public generadores: Cell[],
        public consumo: Cell[]
    ) {}

// --------------------------- PARÁMETROS PROPIOS DEL SISTEMA ---------------------------
    // Parametros para calcular el agua que sobra o falta en cada paso
    aguaDesdeBomba = 0; // WPF
    aguaDesdeDeposito = 0; // -WTF
    aguaHaciaDeposito = 0 // +WTF
        // esto se utiliza para saber cuanta agua se ha generado en cada paso junto con 
        // otra variable que se pilla del simulador para que sea configurable 
    miliSegundosPorHora = 60 * 60 * 1000;

    // Parámetro para el control de la simulación
    valido: boolean = true;


    // habrá que añadir aquí una instancia de cada agente

    

// --------------------------- FUNCIONES PARA LA SIMULACIÓN ---------------------------
    emitir(paso: number, tiempoTranscurrido: number, produccion: {id: number, valor: number[]}[], constPorCons: number, constPorBomb: number){
        // esta comprobación de los pasos servirá para indicarle al simulador que en el siguiente paso
        // este sistema no tendrá más valores para simular, de forma que se ejecute una ultima vez 
        // antes de el sistema pare la simulación
        this.consumo.forEach(con => {
            const consumo = con.content as ZonaConsumo;
            if(consumo.datosSimulacion.length <= paso + 1) this.valido = false;
        })
        // habrá que indicar en el simulador que después de ejecutar los emitir() de los sistemas, 
        // después compruebe la variable valido de cada uno para mirar si se va a poder seguir ejecutando
        this.calcularFlujos(paso, tiempoTranscurrido, produccion, constPorCons, constPorBomb);

        // codigo de los agentes

        this.influenciaSobreMotor();
    }

    // función que calcula qué ocurre con el agua producida en cada paso
    // y calcula la presión. (en general actualiza los parámetros del sistema)
    // tiempoTranscurrido es la duración del paso en milisegundos, 1 min = 60000 ms
    calcularFlujos(paso: number, tiempoTranscurrido: number, produccion: {id: number, valor: number[]}[], constPorCons: number, constPorBomb: number){
        // calculamos el agua que ha producido cada generador en este paso, lo ponemos a 0 para que se 
        // recalcule en cada paso
        this.aguaDesdeBomba = 0;
        this.generadores.forEach(gen => {
            // esto sirve para poder acceder a las propiedades de, en este caso, generador
            const generador = gen.content as Generador;
            // este find sirve para encontrar qué porcentaje tiene asignado para este sistema el generador
            const porcentaje = generador.sistema.find(g => g.id === this.id);
            const produccionReal = produccion.find(g => g.id === generador.id);
            this.aguaDesdeBomba += produccionReal!.valor[paso] * generador.cantidadMax * (porcentaje!.porcentaje / 100);
        });
        
        // calculamos si el agua que ha producido el generador ha sido suficiente para cubrir las necesidades del
        // area de consumo o no, si ha dado de sobra entonces consumoInfraestructuras será - y si no será +
        // si justo ha dado la cantidad exacta entonces será 0
        let consumoInfraestructuras = 0;
        this.consumo.forEach(con => {
            const consumo = con.content as ZonaConsumo;
            // de nuevo calculamos el porcentaje del sistema
            const porcentaje = consumo.sistema.find(c => c.id === this.id);
            consumoInfraestructuras += consumo.datosSimulacion[paso] * (porcentaje!.porcentaje / 100);
        });
        // restamos el agua que se ha generado al que se ha consumido para obtener si nos sobra o nos falta
        consumoInfraestructuras -= this.aguaDesdeBomba;

        // en el caso de que no haya producido suficiente agua
        if(consumoInfraestructuras > 0){
            // aguaDesde Deposito (-WTF) sería igual al agua restante que necesita el area de consumo
            this.aguaDesdeDeposito = consumoInfraestructuras;
            // aguaHaciaDeposito (+WTF) se pone a 0 ya que el depósito no va a recibir agua en este paso
            this.aguaHaciaDeposito = 0;
        }else if(consumoInfraestructuras < 0){
            // aquí se haría justo lo contrario al caso anterior, -WTF a 0 ya que no va a dar agua en este paso
            this.aguaDesdeDeposito = 0;
            // y +WTF se iguala a la cantidad de agua que le ha sobrado al area de consumo en este paso
            // se pone -consumoInfraestructuras porque cuando sobraba, el dato era -.
            this.aguaHaciaDeposito = -consumoInfraestructuras;
        }else{
            this.aguaDesdeDeposito = 0;
            this.aguaHaciaDeposito = 0;
        }

        // este cálculo representa la cantidad de agua correspondiente a un paso, durando el paso 
        // lo que dure el ciclo 
        let modificarLamina = consumoInfraestructuras / this.miliSegundosPorHora * tiempoTranscurrido;

        // si solo tenemos un depósito se le resta o suma el agua correspondiente a ese paso según 
        // consumoInfraestructuras sea negativo (recibe el depósito) o positivo (da el depósito)
        if(this.depositos.length == 1){
            const dep = this.depositos[0].content as Deposito;
            const area = dep.capacidad / dep.alturaMax;
            const deltaAltura = modificarLamina / area;
            dep.alturaActual -= deltaAltura;
            dep.alturaActual = Math.max(0, Math.min(dep.alturaActual, dep.alturaMax));
            dep.pctActual = dep.alturaActual / dep.alturaMax;
        }else{
            // hay que sumarle agua a los depósitos
            if(modificarLamina < 0){
                // ordenamos los depósitos para ir llenandolos en orden
                let depositosOrdenados = this.depositos.map(d => d.content as Deposito)
                                        .sort((a, b) => a.pctActual - b.pctActual);

                let aguaRestante = Math.abs(modificarLamina);

                while (aguaRestante > 0) {
                    // obtenemos el menor % actual de los depósitos
                    let minPct = depositosOrdenados[0].pctActual;

                    // buscamos todos los depósitos que tienen este % mínimo
                    let grupos = depositosOrdenados.filter(d => d.pctActual === minPct);

                    // si todos los depósitos están al 100%, salimos
                    if (grupos.every(d => d.pctActual >= 1)) break;

                    // miramos cuál es el siguiente depósito en % después del grupo actual
                    let siguientePct = depositosOrdenados.find(d => d.pctActual > minPct)?.pctActual ?? 1;

                    // cuánto % queremos subir en esta iteración
                    let deltaPct = siguientePct - minPct;

                    // calculamos cuánta agua necesitaríamos para subir todos los depósitos del grupo a ese %
                    let aguaNecesaria = grupos.reduce((sum, d) => sum + d.volumenxPct * deltaPct * 100, 0);

                    if (aguaRestante >= aguaNecesaria) {
                        // podemos igualar al siguiente depósito
                        grupos.forEach(d => {
                            d.alturaActual += deltaPct * d.alturaMax;
                            d.pctActual = siguientePct;
                        });
                        aguaRestante -= aguaNecesaria;
                    } else {
                        // no hay suficiente agua, repartir proporcionalmente
                        grupos.forEach(d => {
                            let fraccion = d.volumenxPct / grupos.reduce((sum, dd) => sum + dd.volumenxPct, 0);
                            let aguaParaDeposito = aguaRestante * fraccion;
                            let deltaPct = aguaParaDeposito / d.volumenxPct / 100;
                            let deltaAltura = deltaPct * d.alturaMax;
                            d.alturaActual = Math.min(d.alturaMax, d.alturaActual + deltaAltura);
                            d.pctActual = d.alturaActual / d.alturaMax;
                        });
                        // ya repartimos toda el agua
                        break;
                    }

                    // ordenamos otra vez para la siguiente iteración
                    depositosOrdenados.sort((a, b) => a.pctActual - b.pctActual);
                }
            } else if (modificarLamina > 0){
                let depositosOrdenados = this.depositos.map(d => d.content as Deposito)
                                        .sort((a, b) => b.pctActual - a.pctActual); // ordenamos de mayor a menor %
                let aguaRestante = modificarLamina; // cantidad de agua que hay que sacar

                while(aguaRestante > 0){
                    // obtenemos el mayor % actual
                    let maxPct = depositosOrdenados[0].pctActual;

                    // buscamos todos los depósitos que tienen este % máximo
                    let grupos = depositosOrdenados.filter(d => d.pctActual === maxPct);

                    // si todos los depósitos están vacíos, salimos
                    if(grupos.every(d => d.pctActual <= 0)) break;

                    // buscamos el siguiente depósito con menor %
                    let siguientePct = depositosOrdenados.find(d => d.pctActual < maxPct)?.pctActual ?? 0;

                    // cuánto % queremos bajar en esta iteración
                    let deltaPct = maxPct - siguientePct;

                    // cuánta agua necesitamos para bajar todos los depósitos del grupo a ese %
                    let aguaNecesaria = grupos.reduce((sum, d) => sum + d.volumenxPct * deltaPct * 100, 0);

                    if(aguaRestante >= aguaNecesaria){
                        // podemos bajar al siguiente depósito
                        grupos.forEach(d => {
                            d.alturaActual -= deltaPct * d.alturaMax;
                            d.pctActual = siguientePct;
                        });
                        aguaRestante -= aguaNecesaria;
                    } else {
                        // repartir proporcionalmente la cantidad que queda
                        grupos.forEach(d => {
                            let fraccion = d.volumenxPct / grupos.reduce((sum, dd) => sum + dd.volumenxPct, 0);
                            let aguaParaDeposito = aguaRestante * fraccion;
                            let deltaPct = aguaParaDeposito / d.volumenxPct / 100;
                            let deltaAltura = deltaPct * d.alturaMax;
                            d.alturaActual = Math.max(0, d.alturaActual - deltaAltura);
                            d.pctActual = d.alturaActual / d.alturaMax;
                        });
                        // ya hemos repartido toda el agua
                        break;
                    }

                    // ordenamos otra vez para la siguiente iteración
                    depositosOrdenados.sort((a, b) => b.pctActual - a.pctActual);
                }
            }
        }
        
        // el tema de guardar el valor de la lámina de agua de los depósitos en un array 
        // como hace jose vicente, sería mejor hacerlo desde el simulador porque en el caso de que
        // un depósito esté en dos sistemas distintos, si se guarda el valor aquí, un depósito tendría
        // dos láminas distintas en el mismo paso. Lo mejor sería después de hacer el emitir de 
        // todos los sistemas, que el simulador recorra los depósitos y guarde los valores de sus láminas

        // calculamos la presión
        this.calculoPresion(paso, produccion, constPorCons, constPorBomb);
    }

    calculoPresion(paso: number, produccion: {id: number, valor: number[]}[], constPorCons: number, constPorBomb: number){
        // calculamos la suma de las alturas de los depositos y la cantidad total de agua que tienen todos
        let alturaDepositos = 0;
        let laminasDepositos = 0;
        this.depositos.forEach(dep => {
            const deposito = dep.content as Deposito;
            alturaDepositos += deposito.solera;
            laminasDepositos += deposito.alturaActual;
        });

        // (potencia de las bombas * presion que ejercerían las bombas encendidas al máximo)
        let presionBombas = 0;
        this.generadores.forEach(gen =>{
            const generador = gen.content as Generador;
            const porcentaje = generador.sistema.find(g => g.id === this.id);
            const produccionReal = produccion.find(g => g.id === generador.id);
            presionBombas += produccionReal!.valor[paso] * porcentaje!.porcentaje / 100 * constPorBomb;
        });

        // (el mínimo entre la cantidad máx que puede llegar a bajar la presión por consumo
        // y la cantidad máx que puede bajar la presion por consumo * CC de este paso / consumo máximo)
        let presionConsumo = 0;
        this.consumo.forEach(con => {
            const consumo = con.content as ZonaConsumo;
            const porcentaje = consumo.sistema.find(g => g.id === this.id);
            presionConsumo += Math.min(constPorCons, constPorCons * 
                            (consumo.datosSimulacion[paso] / consumo.consumoMaximo * porcentaje!.porcentaje / 100));
        });
        
        // simular la presión
        // las alturas de las láminas de los depósitos más las alturas de los depósitos
        // más una presión en función de los estados de bombeo 
        // menos una presión en función del consumo 
        
        const tub = this.tuberia.content as Tuberia;
        tub.presionActual = alturaDepositos + laminasDepositos + presionBombas - presionConsumo;
    }

    // función que se encargar de encender o apagar más las bombas
    influenciaSobreMotor(){

    }
};

// si tienes un depósito conectado a dos sistemas y se está llenando, ¿se apagarían
// las bombas de los dos sistemas? 
