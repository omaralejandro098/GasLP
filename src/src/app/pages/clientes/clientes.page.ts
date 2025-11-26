import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import { OverlayEventDetail } from '@ionic/core/components';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: false
})
export class ClientesPage implements OnInit {

  constructor(
    private api: AuthService,
    private router: Router,
    private alert: AlertController
  ) { }


  isModalOpen = false;
  isModalClienteOpen = false;




  nombre = '';
  apellido = '';
  telefono = '';
  calle = '';
  colonia = '';
  numero = ''
  cp = '';
  referencia = '';


  token = localStorage.getItem('token')
  clientes: any[] = [];
  cliente: any = null;



  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  setOpenCliente(open: boolean, cliente?: any) {
    this.isModalClienteOpen = open;
    this.cliente = open ? cliente : null;
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    this.isModalOpen = false;
    this.isModalClienteOpen = false;
  }

  ngOnInit() {
    this.getClientes()
  }

  user = ""

  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alert.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['Aceptar'],
      mode: 'ios'
    });

    await alert.present();
  }

  async createCliente() {
    try {
      const data = {
        data: {
          nombre: this.nombre,
          apellido: this.apellido,
          telefono: this.telefono,
          calle: this.calle,
          colonia: this.colonia,
          numero: this.numero,
          cp: this.cp,
          referencia: this.referencia
        }
      }
      const res = await this.api.createClinte(data);

      this.presentAlert('Éxito', `ID: ${res.data.data.id || 'N/A'}`, `El nuevo cliente ${res.data.data.nombre} ha sido registrado correctamente en el sistema.`)

      console.log('Cliente creado:', res.data.data);

      this.nombre = '';
      this.apellido = '';
      this.telefono = '';
      this.calle = '';
      this.colonia = '';
      this.numero = ''
      this.cp = '';
      this.referencia = '';


      this.getClientes();

    } catch (error: any) {
      console.error('Error al crear cliente:', error);
      if (error.response?.data?.error.message == 'This attribute must be unique') {
        this.presentAlert('Error', 'El telefono ya existe', 'Intentalo con otro')
        return;
      }
      if (error.code == 'ERR_BAD_REQUEST') {
        this.presentAlert('Error', 'Credenciales Invalidas', 'Verifica tu informacion')
        return;
      }
      if (error.code == 'ERR_NETWORK') {
        this.presentAlert('Error', 'No se puede conectar al servidor', 'Intentalo mas tarde')
        return;
      }

    }
  }

  async getClientes() {
    try {
      const res = await this.api.getClientes();
      console.log('Clientes obtenidos:', res.data.data);
      this.clientes = res.data.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  }


  async getClienteById(id: any) {
    try {
      const res = await this.api.getClienteById(id);
      console.log('Cliente Seleccionado: ', res.data.data)
      this.cliente = res.data.data;

    } catch (error) {
      console.log(error)
    }
  }

  async deleteClientes(id: any) {
    console.log('Funcionando')
    try {
      const res = await this.api.deleteCliente(id);
      console.log('Cliente Eliminado: ', res)
      // console.log(res)
      this.getClientes();
      this.presentAlert('Éxito', '', 'El cliente ha sido eliminado correctamente')
    } catch (error) {
      console.log(error)
    }
  }
  goToDetails() {
    // 🎯 FIX: Use Optional Chaining (?.) to safely access documentId
    const documentId = this.cliente?.documentId;

    if (documentId) {
      // 1. Cierra el modal de detalles primero
      // 2. Navega a la ruta de detalles
      this.router.navigate(['/clientes/detalles', documentId]);
    } else {
      console.error('Error: No se puede navegar. ID de cliente no disponible. Cliente actual:', this.cliente);
      // Opcional: Mostrar un Toast al usuario para indicar que hubo un problema.
    }
  }

}