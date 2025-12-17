import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Domicilio } from 'src/app/services/domicilio';
import { Servicios } from 'src/app/services/servicios';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  servicios: any[] = [];

  programados: any[] = [];
  asignados: any[] = [];
  surtidos: any[] = [];

  estados_servicio: any[] = [];

  segmentoActivo: 'asignados' | 'surtidos' | 'programados' = 'asignados';

  constructor(
    private router: Router,
    private apiser: Servicios,
    private apidom: Domicilio,
    private alertCtrl: AlertController
  ) {}

  // 🚀 INIT
  async ngOnInit() {
    await this.cargarEstados();
    await this.cargarServicios();
  }

  // 🔵 Cargar servicios
  async cargarServicios() {
    try {
      const response = await this.apiser.verserviciobyruta();
      this.servicios = response?.data?.data ?? [];
      this.filtrarServicios();
    } catch (error) {
      console.error('❌ Error cargando servicios', error);
      this.servicios = [];
    }
  }

  // 🔵 Cargar estados
  async cargarEstados() {
    try {
      const res: any = await this.apidom.getestadoservicio();
      this.estados_servicio = res?.data?.data ?? [];
    } catch (error) {
      console.error('❌ Error cargando estados', error);
      this.estados_servicio = [];
    }
  }

  // 🟢 Marcar como surtido
  async marcarComoSurtido(servicio: any) {

    const servicioId =
      servicio?.documentId ||
      servicio?.id ||
      servicio?.attributes?.documentId;

    if (!servicioId) {
      this.alertSimple('Error', 'No se encontró el ID del servicio');
      return;
    }

    const estadoSurtido = this.estados_servicio.find(
      e => e?.tipo === 'Surtido' || e?.attributes?.tipo === 'Surtido'
    );

    if (!estadoSurtido) {
      this.alertSimple('Error', 'El estado "Surtido" no existe');
      return;
    }

    try {
      await this.apiser.editarservicio(servicioId, {
        estado_servicio: estadoSurtido.documentId || estadoSurtido.id,
        fecha_surtido: new Date().toISOString()
      });

      await this.alertSimple('Éxito', 'Servicio marcado como surtido');

      // 🔄 RECARGAR TODO
      await this.cargarServicios();

    } catch (error) {
      console.error('❌ Error surtido', error);
      this.alertSimple('Error', 'No se pudo actualizar el servicio');
    }
  }

  // 🔎 Filtrar por estado
  filtrarServicios() {
    this.programados = this.servicios.filter(
      s => s?.estado_servicio?.tipo === 'Programado'
    );

    this.asignados = this.servicios.filter(
      s => s?.estado_servicio?.tipo === 'Asignado'
    );

    this.surtidos = this.servicios.filter(
      s => s?.estado_servicio?.tipo === 'Surtido'
    );
  }

  cambiarSegmento(event: any) {
    this.segmentoActivo = event.detail.value;
  }

  // 🚪 Logout
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  // 🧩 Alerta reutilizable
  async alertSimple(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
