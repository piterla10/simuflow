import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { SimuladorComponent } from './pages/simulador/simulador.component';

export const routes: Routes = [
    {path: "", component: InicioComponent},
    {path: "simulador", component: SimuladorComponent}
];
