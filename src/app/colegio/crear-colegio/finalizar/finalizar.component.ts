import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ExcelService } from './services/excel.service';

import {
  Aula,
  Colegio,
  Curso,
  Materia,
  Profesor,
  Turno,
  Modulo,
  // ProfesorReducido,
  // HorarioModulo,
  // MateriaReducido,
} from 'src/app/shared/interface/user.interface';
import { ColegioService } from '../../services/colegio.service';
import { MercadopagoService } from 'src/app/mercado-pago/service/mercadopago.service';

declare const MercadoPago: any;

@Component({
  selector: 'app-finalizar',
  templateUrl: './finalizar.component.html',
  styleUrls: ['./finalizar.component.scss'],
})
export class FinalizarComponent implements OnInit {
  // clickMoreInfoSchool: boolean = false;
  horariosHechos: any = {};
  horariosAulasHechos: any = {};
  materiasProfesoresHechos: any = {};

  constructor(
    public colegioSvc: ColegioService,
    private http: HttpClient,
    private afs: AngularFirestore,
    private _mercadopago: MercadopagoService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this._mercadopago
      .createPreference(
        this.colegioSvc.cursoArray.length,
        this.colegioSvc.nombreColegio
      )
      .then((res) => {
        const mp = new MercadoPago(
          'APP_USR-0cdb1915-b8d1-4dd1-8e25-90db91a59232',
          {
            locale: 'es-AR',
          }
        );

        // Inicializa el checkout
        mp.checkout({
          preference: {
            id: res.id,
          },
          render: {
            container: '.mercadoPagoBoton', // Indica el nombre de la clase donde se mostrará el botón de pago
            label: 'Pagar', // Cambia el texto del botón de pago (opcional)
          },
        });
      });
  }

  // _______________________________________FINALIZAR____________________________________________________________
  botonPresionado: boolean = false;
  async finalizar() {
    const token: any = (
      await this.afs.firestore.collection('secrets').doc('token').get()
    ).data();
    let res: any = await this.http
      .post(
        'https://s4s-algoritmo.herokuapp.com/algoritmo?idColegio=' +
          this.colegioSvc.nombreColegio,
        { token: token['token'] },
        { responseType: 'text' }
      )
      .toPromise()
      .then();
    console.log(res);
    this.afs
      .doc(
        'horariosHechos/' + this.colegioSvc.nombreColegio + '/horarios/' + res
      )
      .snapshotChanges()
      .pipe(
        map((horariosReady) => {
          if (horariosReady.payload.exists) {
            // console.log('ejecuta el obvserver');
            this.colegioSvc.horarioGenerado = true;
            let horariosHechos = horariosReady.payload.get('horarios');
            let horariosAulasHechos =
              horariosReady.payload.get('horariosAulas');
            let materiasProfesoresHechos =
              horariosReady.payload.get('materiasProfesores');

            this.colegioSvc.cursoArray.forEach((curso) => {
              this.horariosHechos[curso.nombre] = {};
              this.colegioSvc.dias.forEach((dia) => {
                this.horariosHechos[curso.nombre][dia] = {};
                this.colegioSvc.turnoArray.forEach((turno) => {
                  this.horariosHechos[curso.nombre][dia][turno.turno] = {};
                  turno.modulos.forEach((modulo) => {
                    if (
                      horariosHechos[curso.nombre][dia][turno.turno][
                        turno.modulos.indexOf(modulo) + 1
                      ].split('-')[0] == 'Hueco'
                    ) {
                      this.horariosHechos[curso.nombre][dia][turno.turno][
                        modulo.inicio
                      ] = '';
                    } else {
                      this.horariosHechos[curso.nombre][dia][turno.turno][
                        modulo.inicio
                      ] =
                        horariosHechos[curso.nombre][dia][turno.turno][
                          turno.modulos.indexOf(modulo) + 1
                        ].split('-')[0];
                    }
                  });
                });
              });
            });

            this.colegioSvc.cursoArray.forEach((curso) => {
              this.horariosAulasHechos[curso.nombre] = {};
              this.colegioSvc.dias.forEach((dia) => {
                this.horariosAulasHechos[curso.nombre][dia] = {};
                this.colegioSvc.turnoArray.forEach((turno) => {
                  this.horariosAulasHechos[curso.nombre][dia][turno.turno] = {};
                  turno.modulos.forEach((modulo) => {
                    if (
                      horariosAulasHechos[curso.nombre][dia][turno.turno][
                        turno.modulos.indexOf(modulo) + 1
                      ] == 'Hueco'
                    ) {
                      this.horariosAulasHechos[curso.nombre][dia][turno.turno][
                        modulo.inicio
                      ] = '';
                    } else {
                      this.horariosAulasHechos[curso.nombre][dia][turno.turno][
                        modulo.inicio
                      ] =
                        horariosAulasHechos[curso.nombre][dia][turno.turno][
                          turno.modulos.indexOf(modulo) + 1
                        ];
                    }
                  });
                });
              });
            });

            this.colegioSvc.materiaArray.forEach((materia) => {
              this.materiasProfesoresHechos[
                materia.nombre + '-' + materia.curso
              ] =
                materiasProfesoresHechos[materia.nombre + '-' + materia.curso];
            });
            this.colegioSvc.horarioGenerado = true;
          }
        })
      )
      .subscribe();
    this.colegioSvc.botonPresionado = true;
  }
  exportAsExcelFile() {
    let jsonMaterias: any = [];
    this.colegioSvc.cursoArray.forEach((curso) => {
      jsonMaterias.push({ nombre: curso.nombre });
      let horarioCurso: any = [];
      this.colegioSvc.turnoArray.forEach((turno) => {
        turno.modulos.forEach((modulo) => {
          horarioCurso.push({
            modulo: modulo.inicio + ' - ' + modulo.final,
            lunes: '',
            martes: '',
            miercoles: '',
            jueves: '',
            viernes: '',
          });
          this.colegioSvc.dias.forEach((dia) => {
            console.log(
              horarioCurso[horarioCurso.length - 1],
              horarioCurso[horarioCurso.length - 1]["lunes"]
            );
            horarioCurso[horarioCurso.length - 1][dia] =
              this.horariosHechos[curso.nombre][turno.turno][dia][
                modulo.inicio
              ];
          });
        });
      });
    });
    this.excelService.exportAsExcelFile(jsonMaterias, 'export-to-excel');
  }
}
