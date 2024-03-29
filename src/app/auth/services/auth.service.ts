import { first, switchMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  Aula,
  Colegio,
  Turno,
  User,
} from 'src/app/shared/interface/user.interface';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import firebase from 'firebase/app';
import { Router } from '@angular/router';
import { ServiceSpinnerService } from 'src/app/shared/loading-spinner/service-spinner.service';

@Injectable()
export class AuthService {
  public userData: any;
  ingresoEmailCompleto: boolean = false;
  nombresDeEscuelas: Array<any> = [];
  existeEscuela: boolean = false;
  dirigir: string = '';

  constructor(
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private spinnerSvc: ServiceSpinnerService
  ) {
    this.spinnerSvc.mostrarSpinnerUser = true;
    this.spinnerSvc.mostrarSpinnerColegio = true;

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.afs.firestore
          .collection('schools')
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              this.nombresDeEscuelas.push(doc.data().nombre);
            });
          });

        this.afs
          .doc<User>(`users/${user.uid}`)
          .get()
          .toPromise()
          .then((res) => {
            this.userData = res.data();
            if (this.userData && this.userData.emailVerified) {
              this.dirigir = 'menu-principal';
            } else {
              this.dirigir = 'verificacion-email';
            }
            this.spinnerSvc.mostrarSpinnerUser = false;
          });
      } else {
        // console.log(this.spinnerSvc.mostrarSpinnerUser);

        this.userData = null;
        this.spinnerSvc.mostrarSpinnerUser = false;
        // console.log(this.spinnerSvc.mostrarSpinnerUser);

        this.dirigir = 'login';
        // console.log(this.dirigir);
      }
    });
  }

  async isLoggedIn(): Promise<boolean> {
    let user = await this.afAuth.authState.toPromise();
    if (!user) {
      return false;
    }
    let userData = await this.afs
      .doc<User>(`users/${user.uid}`)
      .get()
      .toPromise();
    if (userData.data()?.emailVerified) {
      return true;
    }
    return false;
  }

  //joya
  async login(email: string, password: string) {
    // if(this.userData == null) {
    //   alert("No existe una cuenta con ese email, por favor registrese");
    //   this.router.navigate(['/register']);
    // }
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (querySnapshot) => {
        const { user } = querySnapshot;
        return user;
      })
      .catch((error) => {
        alert('No existe una cuenta con ese email, por favor registrese');
        return null;
      });

    // if (user?.emailVerified) {
    //   this.updateUserData(user);
    // }
  }

  //joya
  async loginGoogle() {
    const { user } = await this.afAuth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    );
    if (user) {
      this.updateUserData(user);
    }
    return user;
  }

  //joya
  async register(email: string, password: string) {
    // const { user } = await firebase
    //   .auth()
    //   .createUserWithEmailAndPassword(email, password)
    //   .catch((error) => {
    //     alert(
    //       'El email que esta ingresando ya esta siendo utilizado, por favor pruebe otro'
    //     );
    //   });

    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async (querySnapshot) => {
        const { user } = querySnapshot;
        this.updateUserData(user);
        this.sendVerificationEmail();
        return user;
      })
      .catch((error) => {
        alert(
          'El email que esta ingresando ya esta siendo utilizado, por favor pruebe otro'
        );
        return null;
      });

    // const { user } = await this.afAuth.createUserWithEmailAndPassword(
    //   email,
    //   password
    // );

    // return user;
  }

  resetPassword(email: string) {
    var auth = firebase.auth();
    return auth
      .sendPasswordResetEmail(email)
      .then(() => console.log('email enviado'))
      .catch((error) => console.log(error));
  }

  //joya
  async sendVerificationEmail() {
    return (await this.afAuth.currentUser)?.sendEmailVerification();
  }

  //joya
  async logout() {
    await this.afAuth.signOut();
  }

  // joinSchool(idColegio: string){
  //   // const schoolJoined: Colegio = {
  //   //   id: idColegio
  //   // }
  // }

  //joya
  async createSchool(
    nombre: string,
    color: string,
    provincia: string,
    localidad: string,
    telefono: string,
    // duracionModulo: number,
    // inicioHorario: string,
    // finalizacionHorario: string,
    id: string
  ) {
    const school: Colegio = {
      id: id,
      userAdmin: this.userData.uid,
      nombre: nombre,
      color: color,
      // ejecutado: "no",
      localidad: localidad,
      provincia: provincia,
      telefono: telefono,
      duracionModulo: 40,
      // inicioHorario: " ",
      // finalizacionHorario: " ",
      // botonesCrearColegio: 1,
      usuariosExtensiones: [],
      aulas: [],
      turnos: [],
      // modulos: [],
      materias: [],
      cursos: [],
      profesores: [],
    };

    if (
      String(school.nombre).length === 0 ||
      String(school.provincia).length === 0 ||
      String(school.localidad).length === 0 ||
      String(school.telefono).length === 0
      // ||
      // String(school.duracionModulo).length === 0 ||
      // String(school.inicioHorario).length === 0 ||
      // String(school.finalizacionHorario).length === 0 ||
      // String(school.inicioHorario).length === 0 ||
      // String(school.finalizacionHorario).length === 0
    ) {
      alert('Completar los casilleros obligatorios');
      // Poner los valores que se piden
    } else if (String(school.nombre).length > 50) {
      alert('El nombre del colegio debe ser menor a los 50 caracteres');
    } else if (String(school.telefono).length != 8) {
      alert(
        'El numero de telefono no es igual a los 8 digitos, recuerda que no debe contener ningun espacio, ningun signo y debe ser de tamaño 8'
      );
    } else {
      let existe: boolean = false;
      this.nombresDeEscuelas.forEach((nombreEscuela) => {
        if (school.nombre.toLowerCase() == nombreEscuela.toLowerCase()) {
          alert('El nombre ya esta utilizado, por favor ingrese otro');
          existe = true;
        }
      });
      if (!existe) {
        if (String(school.color) == '') {
          school.color = '#2196f3';
        }
        this.SchoolData(school);
        this.router.navigate(['menu-principal']);

        // this.router.navigate([school.nombre, 'crear-colegio', 'turnos']);
      }

      // confirm("Poner los valores que se piden");
    }
  }

  //joya
  private updateUserData(user: any) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data: User = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.email.split('@')[0],
    };

    return userRef.set(data, { merge: true });
  }

  //joya
  private SchoolData(school: any) {
    const schoolRef: AngularFirestoreDocument<Colegio> = this.afs.doc(
      `schools/${school.nombre}`
    );

    let turnoArrayDiccionario: Array<any> = [];
    [new Turno('manana'), new Turno('tarde'), new Turno('noche')].forEach(
      (turno) => {
        let modulosTurno: Array<any> = [];
        turno.modulos.forEach((modulo) => {
          modulosTurno.push({
            inicio: modulo.inicio,
            final: modulo.final,
            // tipo: modulo.tipo,
          });
        });
        if (turno.turno == 'manana') {
          turnoArrayDiccionario.push({
            turno: turno.turno,
            inicio: '05:00',
            finalizacion: '12:00',
            habilitado: false,
            modulos: modulosTurno,
          });
        } else if (turno.turno == 'tarde') {
          turnoArrayDiccionario.push({
            turno: turno.turno,
            inicio: '12:00',
            finalizacion: '18:00',
            habilitado: false,
            modulos: modulosTurno,
          });
        } else if (turno.turno == 'noche') {
          turnoArrayDiccionario.push({
            turno: turno.turno,
            inicio: '18:00',
            finalizacion: '23:00',
            habilitado: false,
            modulos: modulosTurno,
          });
        }
      }
    );

    const data: Colegio = {
      id: school.id,
      userAdmin: school.userAdmin,
      nombre: school.nombre,
      color: school.color,
      provincia: school.provincia,
      localidad: school.localidad,
      telefono: '11' + school.telefono,
      duracionModulo: school.duracionModulo,
      usuariosExtensiones: [],
      aulas: [],
      turnos: turnoArrayDiccionario,
      materias: [],
      cursos: [],
      profesores: [],
    };

    return schoolRef.set(data, { merge: true });
  }
}
