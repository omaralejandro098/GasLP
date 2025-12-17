import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  access_token: string = '';
  constructor(private router: Router, private api: AuthService, private alert: AlertController, private act: ActivatedRoute) {
    console.log(this.act.snapshot.queryParams)
    this.access_token = this.act.snapshot.queryParams['access_token'];
    console.log(this.access_token)



  }

  identifier: string = "callcenter";
  password: string = "12345678";

  ngOnInit() {
    console.log('cargando')
    if (this.access_token) {
      this.loginGoogle();
    }

  }

  async loginGoogle() {
    try {
      const res = await this.api.loginGoogle(this.access_token)
      console.log(res)
      this.saveToken(res)


    } catch (error: any) { }
  }

  async login() {
    try {
      const res = await this.api.login(this.identifier, this.password)
      console.log(res)
      this.saveToken(res)
    } catch (error: any) {
      console.log(error.code)
      if (error.code == 'ERR_BAD_REQUEST') {
        this.presentAlert('Error', 'Credenciales invalidas', 'Verifica tus datos')
        return
      }
      if (error.code == 'ERR_NETWORK') {
        this.presentAlert('Error', 'No se puede conectar al servidor', 'Intentalo mas tarde')
        return

      }

    }



  }

  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alert.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['Aceptar'],
      mode: 'ios'
    });

    await alert.present()

  }

  async saveToken(data: any) {
    try {
      const token = data.data.jwt;
      const user = data.data.user;
      const username = user?.username;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      await this.presentAlert(
        'Éxito',
        'Inicio de sesión exitoso',
        'Bienvenido ' + user.username
      );

      setTimeout(() => {

        // 🟡 OPERADOR → dashboard
        if (username === 'operador') {
          this.router.navigateByUrl('/dashboard');
          return;
        }

        // 🟢 OTROS ROLES
        this.router.navigateByUrl('/clientes');

      }, 1500);

    } catch (error) {
      this.presentAlert(
        'Error',
        'No se pudo guardar la sesión',
        'Intenta más tarde'
      );
    }
  }

}
