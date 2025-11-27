export class Agente4{
    mu: number = 0.01;
    memoria: number[] = [];
    percepcion: number[] = [];
    Im: number = 0;
    ponderar: number[] = [0.5, 0.3, 0.2];
                //        Dl   Di   Dp

    percept(Dl: number, Di: number, Dp: number){
        this.percepcion = [];
        this.percepcion.push(Dl); // [0]
        this.percepcion.push(Di); // [1]
        this.percepcion.push(Dp); // [2]
        this.mem();
        this.decision();
        this.exec();
    }

    mem(){
        let valorMemoria = 0;
        let valorPercepcion = 0;
        this.memoria.forEach(valor => valorMemoria += Math.abs(valor));
        this.percepcion.forEach(valor => valorPercepcion += Math.abs(valor));
        let distancia = Math.abs(valorPercepcion - valorMemoria);
        if(distancia >= this.mu){
            this.memoria = this.percepcion;
        }
    }

    decision(){
        this.Im = this.percepcion[0] * this.ponderar[0] +
                  this.percepcion[1] * this.ponderar[1] +
                  this.percepcion[2] * this.ponderar[2];
    }

    exec(){
        // aquí no hay na
    }
}