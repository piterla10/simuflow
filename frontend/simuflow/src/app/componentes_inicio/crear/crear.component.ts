import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-crear',
  imports: [ReactiveFormsModule],
  templateUrl: './crear.component.html',
  styleUrl: './crear.component.scss'
})
export class CrearComponent implements OnInit{
  constructor( private router: Router) {  }
  @Output() cambiar = new EventEmitter<number>();
  
  cambiarComp(n: number) {
    this.cambiar.emit(n); 
  }
  
  form!: FormGroup;
  
  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl('', Validators.required),
      filas: new FormControl('', Validators.required),
      columnas: new FormControl('', Validators.required),
    });
  }


  enviarFormulario() {
     if (this.form.valid) {
      localStorage.setItem('infoGrid', JSON.stringify(this.form.value));
      this.router.navigate(['/simulador']);
    }
  }

}
