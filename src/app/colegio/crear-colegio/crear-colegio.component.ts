import { Time } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import {
  Aula,
  Colegio,
  Curso,
  HorarioModulo,
  Materia,
  // MateriaReducido,
  // Modulo,
  Profesor,
  ProfesorReducido,
  Turno,
} from 'src/app/shared/interface/user.interface';

@Component({
  selector: 'app-crear-colegio',
  templateUrl: './crear-colegio.component.html',
  styleUrls: ['./crear-colegio.component.scss'],
  providers: [AuthService],
})
export class CrearColegioComponent implements OnInit {
  nombreColegio: string;
  nombreDocumento: string;
  duracionModulo: number;
  minutos: number;
  horas: number;
  horasI: number;
  horasF: number;
  horarioFinalizacionModulo: string = '';
  // conjuntoDeTurnos : Array<HorarioModulo> = [];
  // modulos: number;
  horarios: Array<string> = [];
  inicioHorario: Time;
  finalizacionHorario: Time;
  turnos: number;
  aulas: number;
  materias: number;
  cursos: number;
  profesores: number;
  // materiasArrayCursos: Array<MateriaReducido> = [];
  profesoresArrayMaterias: Array<ProfesorReducido> = [];
  crearHorarioManana: boolean = false;
  crearHorarioTarde : boolean = false;
  crearHorarioNoche : boolean = false;
  manana: Turno = new Turno();
  tarde: Turno = new Turno();
  noche: Turno = new Turno();
  mananaPrimerHorario: boolean = true;
  tardePrimerHorario: boolean = true;
  nochePrimerHorario: boolean = true;
  cantidadTurnos: Array<Turno> = [];
  totalCursosColegio: Array<string> = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authSvc: AuthService,
    private afs: AngularFirestore
  ) {
    authSvc.afAuth.authState.subscribe((user) => {
      if (user) {
        this.afs
          .collection('schools', (ref) =>
            ref.where('userAdmin', '==', user.uid)
          )
          .snapshotChanges()
          .pipe(
            map((schools) => {
              const school = schools[0].payload.doc.data() as Colegio;
              this.nombreColegio = school.nombre;
              this.nombreDocumento = school.id;
              this.duracionModulo = school.duracionModulo;
              this.inicioHorario = school.inicioHorario;
              this.finalizacionHorario = school.finalizacionHorario;
              this.horarios.push(String(this.inicioHorario));
              this.horasI = Number(String(this.inicioHorario).split(':')[0]);
              this.horasF = Number(String(this.finalizacionHorario).split(':')[0]);
              // this.minutos = Number(String(this.inicioHorario).split(':')[1]);
              // this.modulos = school.modulos.length;
              this.turnos = school.turnos.length;
              this.aulas = school.aulas.length;
              this.materias = school.materias.length;
              this.cursos = school.cursos.length;
              this.profesores = school.profesores.length;
              school.profesores.forEach((profesor) => {
                let profesorAux: ProfesorReducido = {
                  nombre: profesor.nombre,
                  valor: false,
                };
                this.profesoresArrayMaterias.push(profesorAux);
              });
              school.cursos.forEach((cursos) => {
                this.totalCursosColegio.push(cursos.nombre);
              })
            })
          )
          .subscribe();
      }
    });
  }

  ngOnInit(): void {}

  // _______________________________________TURNOS______________________________________________________________

  // moduloArray: Modulo[] = [];

  // selectedModulo: Modulo = new Modulo();

  // openForEditModulo(modulo: Modulo) {
  //   this.selectedModulo = modulo;
  // }

  // addOrEditModulo() {
  //   this.horarioFinalizacionModulo = String(this.selectedModulo.inicio);
  //   this.horas = Number(this.horarioFinalizacionModulo.split(':')[0]);
  //   this.minutos =
  //     Number(this.horarioFinalizacionModulo.split(':')[1]) +
  //     this.duracionModulo;

  //   while (this.minutos >= 60) {
  //     this.minutos = this.minutos - 60;
  //     this.horas = this.horas + 1;
  //     if (this.horas == 24) {
  //       this.horas = 0;
  //     }
  //   }

  //   this.horarioFinalizacionModulo =
  //     String(this.horas) + ':' + String(this.minutos);
  //   if (this.selectedModulo.id == 0) {
  //     this.selectedModulo.id = this.moduloArray.length + 1;
  //     this.moduloArray.push(this.selectedModulo);

  //     // console.log(this.horarioFinalizacionModulo);
  //   }
  //   this.selectedModulo = new Modulo();
  // }

  // deleteModulo() {
  //   if (confirm('¿Estas seguro/a que quieres eliminar este modulo?')) {
  //     this.moduloArray = this.moduloArray.filter(
  //       (x) => x != this.selectedModulo
  //     );
  //     this.selectedModulo = new Modulo();
  //   }
  // }

  // async goFormAula() {
  //   let moduloArrayDiccionario: Array<any> = [];
  //   this.moduloArray.forEach((modulo) => {
  //     moduloArrayDiccionario.push({
  //       id: modulo.id,
  //       dia: modulo.dia,
  //       inicio: modulo.inicio,
  //     });
  //   });
  //   this.afs.collection('schools').doc(this.nombreDocumento).update({
  //     modulos: moduloArrayDiccionario,
  //   });
  // }

  // _______________________________________MODULOS______________________________________________________________

  turnoArray: HorarioModulo[] = [];
  selectedTurno: HorarioModulo = new HorarioModulo();

  addTurno() {

    if (this.horarios[this.horarios.length-1] <= String(this.selectedTurno.inicio)){

      this.horarioFinalizacionModulo = String(this.selectedTurno.inicio);
      this.horas = Number(this.horarioFinalizacionModulo.split(':')[0]);
      this.minutos = Number(this.horarioFinalizacionModulo.split(':')[1]) + this.duracionModulo;

      while (this.minutos >= 60) {
        this.minutos = this.minutos - 60;
        this.horas = this.horas + 1;
        if (this.horas == 24) {
          this.horas = 0;
        }
      }
      
      let hsAux:string   = String(this.horas);
      let minsAux:string = String(this.minutos);

      if(hsAux.length == 1)   hsAux = '0' + hsAux;
      if(minsAux.length == 1) minsAux = '0' + minsAux;

      this.horarioFinalizacionModulo = hsAux + ':' + minsAux;
      this.horarios.push(this.horarioFinalizacionModulo);

      if(this.crearHorarioManana){
        this.selectedTurno.horariosFinalManana.push(String(this.selectedTurno.inicio) + " - " + this.horarioFinalizacionModulo);
        if(this.mananaPrimerHorario){
          this.manana.turno = "manana";
          this.cantidadTurnos.push(this.manana);
          this.mananaPrimerHorario = false;
        }
        this.cantidadTurnos[0].cantModulos += 1;
      }
      else if(this.crearHorarioTarde){
        this.selectedTurno.horariosFinalTarde.push(String(this.selectedTurno.inicio) + " - " + this.horarioFinalizacionModulo);
        if(this.tardePrimerHorario){
          this.tarde.turno="tarde";
          this.cantidadTurnos.push(this.tarde);
          this.tardePrimerHorario = false;
        }
        this.cantidadTurnos[1].cantModulos += 1;
      }
      else{
        this.selectedTurno.horariosFinalNoche.push(String(this.selectedTurno.inicio) + " - " + this.horarioFinalizacionModulo);
        if(this.nochePrimerHorario){
          this.noche.turno="noche";
          this.cantidadTurnos.push(this.noche);
          this.nochePrimerHorario = false;
        }
        this.cantidadTurnos[2].cantModulos += 1;
      }
      // this.conjuntoDeTurnos.push(this.selectedTurno);
      // this.turnoArray.push(this.conjuntoDeTurnos[this.conjuntoDeTurnos.length-1]);
      this.turnoArray.push(this.selectedTurno)
      this.selectedTurno = new HorarioModulo();
    }
    else{
      confirm('Ingrese un horario mayor de inicio');
    }

    this.crearHorarioManana = false;
    this.crearHorarioTarde = false;
    this.crearHorarioNoche = false;
  }

  
  makeSchedulerManana() {
    this.crearHorarioManana = true;    
  }

  makeSchedulerTarde() {
    this.crearHorarioTarde = true;
  }

  makeSchedulerNoche() {
    this.crearHorarioNoche = true;
  }

  async goFormAula() {
    let turnoArrayDiccionario: Array<any> = [];
    this.cantidadTurnos.forEach((turno) => {
      turnoArrayDiccionario.push({
        cantModulos: turno.cantModulos,
        turno: turno.turno,
      });
    });
    this.afs.collection('schools').doc(this.nombreDocumento).update({
      turnos: turnoArrayDiccionario,
    });
  }

  // _________________________________________AULAS____________________________________________________________

  aulaArray: Aula[] = [];

  selectedAula: Aula = new Aula();

  openForEditAula(aula: Aula) {
    this.selectedAula = aula;
  }

  addOrEditAula() {
    if (this.selectedAula.id == 0) {
      this.selectedAula.id = this.aulaArray.length + 1;
      this.aulaArray.push(this.selectedAula);
    }
    if(this.selectedAula.tipo == "Normal"){
      this.selectedAula.otro = "Se selecciono el tipo normal";
    }
    this.selectedAula = new Aula();
  }

  deleteAula() {
    if (confirm('¿Estas seguro/a que quieres eliminar este aula?')) {
      this.aulaArray = this.aulaArray.filter((x) => x != this.selectedAula);
      this.selectedAula = new Aula();
    }
  }

  async goFormCurso() {
    let aulaArrayDiccionario: Array<any> = [];
    this.aulaArray.forEach((aula) => {
      aulaArrayDiccionario.push({
        // id: aula.id,
        nombre: aula.nombre,
        tipo: aula.tipo,
        otro: aula.otro,
      });
    });
    this.afs.collection('schools').doc(this.nombreDocumento).update({
      aulas: aulaArrayDiccionario,
    });
  }

  // _______________________________________CURSOS______________________________________________________________

  cursoArray: Curso[] = [];

  selectedCurso: Curso = new Curso();

  openForEditCurso(curso: Curso) {
    this.selectedCurso = curso;
  }

  addOrEditCurso() {
    if (this.selectedCurso.id == 0) {
      this.selectedCurso.id = this.cursoArray.length + 1;
      // this.materiasArrayCursos.forEach((materia) => {
      //   if (materia.valor == true) {
      //     this.selectedCurso.materiasCurso.push(materia.nombre);
      //   }
      // });
      this.cursoArray.push(this.selectedCurso);
    }
    this.selectedCurso = new Curso();
  }

  // clicked(nombreMateria: string) {
  //   for (let i = 0; i < this.materiasArrayCursos.length; i++) {
  //     if (
  //       this.materiasArrayCursos[i].nombre == nombreMateria &&
  //       this.materiasArrayCursos[i].valor == false
  //     ) {
  //       this.materiasArrayCursos[i].valor = true;
  //     } else if (
  //       this.materiasArrayCursos[i].nombre == nombreMateria &&
  //       this.materiasArrayCursos[i].valor == true
  //     ) {
  //       this.materiasArrayCursos[i].valor = false;
  //     }
  //   }
  // }

  deleteCurso() {
    if (confirm('¿Estas seguro/a que quieres eliminar este curso?')) {
      this.cursoArray = this.cursoArray.filter((x) => x != this.selectedCurso);
      this.selectedCurso = new Curso();
    }
  }

  async goFormProfesor() {
    let CursoArrayDiccionario: Array<any> = [];
    this.cursoArray.forEach((curso) => {
      CursoArrayDiccionario.push({
        // id: curso.id,
        nombre: curso.nombre,
        // turnoPreferido: curso.turnoPreferido,
        // cantAlumnos: curso.cantAlumnos,
        // materiasCurso: curso.materiasCurso,
      });
    });
    this.afs.collection('schools').doc(this.nombreDocumento).update({
      cursos: CursoArrayDiccionario,
    });
  }

  // _______________________________________PROFESORES__________________________________________________________

  profesorArray: Profesor[] = [];

  selectedProfesor: Profesor = new Profesor();

  openForEditProfesor(profesor: Profesor) {
    this.selectedProfesor = profesor;
  }

  addOrEditProfesor() {
    if (this.selectedProfesor.id == 0) {
      this.selectedProfesor.id = this.profesorArray.length + 1;
      this.profesorArray.push(this.selectedProfesor);
    }
    this.selectedProfesor = new Profesor();
  }

  deleteProfesor() {
    if (confirm('¿Estas seguro/a que quieres eliminar este profesor/a?')) {
      this.profesorArray = this.profesorArray.filter(
        (x) => x != this.selectedProfesor
      );
      this.selectedProfesor = new Profesor();
    }
  }

  async goFormMateria() {
    let ProfesorArrayDiccionario: Array<any> = [];
    this.profesorArray.forEach((profesor) => {
      ProfesorArrayDiccionario.push({
        // id: profesor.id,
        nombre: profesor.nombre,
        // dni: profesor.dni,
        // 'materias capacitado': profesor.materiasCapacitado,
        // turnoPreferido: profesor.turnoPreferido,
        // condiciones: profesor.condiciones,
      });
    });
    this.afs.collection('schools').doc(this.nombreDocumento).update({
      profesores: ProfesorArrayDiccionario,
    });
  }

  // _______________________________________MATERIAS____________________________________________________________

  materiaArray: Materia[] = [];

  selectedMateria: Materia = new Materia();

  openForEditMateria(materia: Materia) {
    this.selectedMateria = materia;
  }

  addOrEditMateria() {
    if (this.selectedMateria.id == 0) {
      this.selectedMateria.id = this.materiaArray.length + 1;
      this.profesoresArrayMaterias.forEach((profesor) => {
        if (profesor.valor == true) {
          this.selectedMateria.profesoresCapacitados.push(profesor.nombre);
        }
      });
      this.materiaArray.push(this.selectedMateria);
    }
    this.selectedMateria = new Materia();
  }

  clicked(nombreProfesor: string) {
    for (let i = 0; i < this.profesoresArrayMaterias.length; i++) {
      if (
        this.profesoresArrayMaterias[i].nombre == nombreProfesor &&
        this.profesoresArrayMaterias[i].valor == false
      ) {
        this.profesoresArrayMaterias[i].valor = true;
      } else if (
        this.profesoresArrayMaterias[i].nombre == nombreProfesor &&
        this.profesoresArrayMaterias[i].valor == true
      ) {
        this.profesoresArrayMaterias[i].valor = false;
      }
    }
  }

  deleteMateria() {
    if (confirm('¿Estas seguro/a que quieres eliminar esta materia?')) {
      this.materiaArray = this.materiaArray.filter(
        (x) => x != this.selectedMateria
      );
      this.selectedMateria = new Materia();
    }
  }

  async goFormFinalizar() {
    let materiaArrayDiccionario: Array<any> = [];
    this.materiaArray.forEach((materia) => {
      materiaArrayDiccionario.push({
        id: materia.id,
        nombre: materia.nombre,
        cantidadDeModulosTotal: materia.cantidadDeModulosTotal,
        curso: materia.cursoDado,
        // cantProfesores: materia.cantProfesores,
        // espacioEntreDias: materia.espacioEntreDias,
        // tipoAula: materia.tipo,
        // otro: materia.otro,
        profesoresCapacitados: materia.profesoresCapacitados,
        cantidadMaximaDeModulosPorDia: materia.cantidadMaximaDeModulosPorDia,
      });
    });
    this.afs.collection('schools').doc(this.nombreDocumento).update({
      materias: materiaArrayDiccionario,
    });
  }

}
