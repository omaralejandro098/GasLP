import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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
  segmentoActivo: 'programados' | 'asignados' | 'surtidos' = 'programados';

  constructor(private router: Router, private apiser: Servicios, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.verservicio();
  }

  async verservicio() {
    try {
      const response = await this.apiser.verserviciobyruta();

      this.servicios = Array.isArray(response?.data.data)
        ? response.data.data
        : [];

      this.filtrarServicios();

    } catch (error) {
      console.error('❌ Error cargando servicios', error);
      this.servicios = [];
    }
  }

  async marcarComoSurtido(servicio: any) {
    try {
      console.log("📌 Servicio recibido:", servicio);

      // detectar id real
      const servicioId =
        servicio.documentId ||
        servicio.id ||
        servicio?.attributes?.documentId ||
        servicio?.attributes?.id;

      if (!servicioId) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se encontró el ID del servicio para actualizar.',
          buttons: ['OK']
        });
        await alert.present();
        console.error("❌ No se encontró ID en el servicio:", servicio);
        return;
      }

      // estado surtido
      const estadoSurtido = this.estados_servicio.find(
        e => e.tipo === 'Surtido' || e.attributes?.tipo === 'Surtido'
      );

      if (!estadoSurtido) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'El estado "Surtido" no existe en la base de datos.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

      const estadoId = estadoSurtido.documentId || estadoSurtido.id;

      const data = {
        estado_servicio: estadoId,
        fecha_surtido: new Date().toISOString()
      };

      console.log("🟢 Actualizando servicio:", servicioId, data);

      const response = await this.apiser.editarservicio(servicioId, data);

      console.log("🟩 Respuesta backend:", response);

      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Servicio marcado como surtido.',
        buttons: ['OK']
      });

      await alert.present();

    } catch (error) {
      console.error("❌ Error marcando como surtido:", error);

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo marcar el servicio como surtido.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  filtrarServicios() {
    this.programados = this.servicios.filter(
      s => s.estado_servicio?.tipo === 'Programado'
    );

    this.asignados = this.servicios.filter(
      s => s.estado_servicio?.tipo === 'Asignado'
    );

    this.surtidos = this.servicios.filter(
      s => s.estado_servicio?.tipo === 'Surtido'
    );
  }

  cambiarSegmento(event: any) {
    this.segmentoActivo = event.detail.value;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }
}