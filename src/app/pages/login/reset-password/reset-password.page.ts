import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone:false
})
export class ResetPasswordPage implements OnInit {

  constructor(private api:AuthService, private act:ActivatedRoute, private alert:AlertController ) { 
    this.code = this.act.snapshot.paramMap.get('code') as string;
  }
  code:string=""
  password:string=""
  passwordConfirmation:string=""

  ngOnInit() {
  }

  async resetPassword(){
    
    try{
      const res = await this.api.reset(this.code, this.password, this.passwordConfirmation)
    console.log(res)

    } catch (error:any) {
      console.log(error.code);
      if(error.response?.data?.error.message== 'code is a required field'){
        this.presentAlert('Error', 'Codigo requerido', 'Verifica el enlace que te enviamos por correo')
        return
      }

      if(error.code == 'ERR_BAD_REQUEST'){
        this.presentAlert('Error', 'Credenciales invalidas', 'Verifica tus datos')
        return
      }

       if(error.code == 'ERR_NETWORK'){
        this.presentAlert('Error', 'No se puede conectar al servidor', 'Intentalo mas tarde')
        return

      }

      this.presentAlert('Error', 'Algo salio mal', 'Intentalo mas tarde')
      
      
      
    }
    
    
  }

    async presentAlert(header:string, subHeader:string, message:string) {
    const alert = await this.alert.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['Aceptar'],
      mode: 'ios'
    });

    await alert.present()



}
}
