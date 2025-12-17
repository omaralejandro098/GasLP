import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Clientes } from 'src/app/services/clientes';
import { Domicilio } from 'src/app/services/domicilio';
import { Servicios } from 'src/app/services/servicios';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: false
})
export class ClientesPage implements OnInit {
  // ==================== CAMPOS PARA NUEVO SERVICIO ====================
  nuevaRuta: any = null;
  nuevoTipoServicio: any = null;
  nuevoEstadoServicio: any = null;
  nuevaObservacion = '';
  nuevaNota = '';
  nuevaFechaProgramado: string | null = null;
  nuevaFechaSurtido: string | null = null;
  nuevaFechaCancelado: string | null = null;

  isModalAgregarServicioOpen = false;
  rutas: any[] = [];
  tipos_servicio: any[] = [];
  estados_servicio: any[] = [];


  // ==================== ESTADOS ====================
  clientes: any[] = [];
  cliente: any = null;

  domicilios: any[] = [];
  domicilioSeleccionado: any = null;
  // Propiedad para almacenar el domicilio seleccionado para el formulario de servicio
  domicilioFormulario: any = null;


  servicios: any[] = [];
  serviciosasignados: any[] = []
  serviciosprogramados: any[] = []
  serviciossurtidos: any[] = []
  servicioscancelados: any[] = [];

  servicios1: any[] = [];
  // Crear un objeto servicio para trabajar con los datos en el modal
  servicio: any = {
    ruta: null,
    tipo_servicio: null,
    estado_servicio: 3,
    observacion: '',
    nota: '',
    fecha_programado: null,
    fecha_surtido: null,
    fecha_cancelado: null
  };
  pedididos: any[] = []
  pedido: any = {
    ruta: null,
    estado_pedido: null,
    observacion: '',
    nota: ''
  };

  // ==================== FORMULARIOS ====================
  nombre = '';
  apellidos = '';
  telefono = '';

  // Campos para nuevo domicilio
  nuevaCalle = '';
  nuevoNumero = '';
  nuevaColonia = '';
  nuevoCP = '';
  nuevaReferencia = '';

  // ==================== MODALES ====================
  isModalOpen = false;             // Modal agregar cliente
  isModalDomicilioOpen = false;    // Modal agregar domicilio
  isModalServiciosOpen = false;    // Modal ver servicios
  isModalAgregarDomicilioOpen = false; //Modal para agregar domicilio
  isModalFormularioServicioOpen = false;//Modal para agregar servicio
  isModalAsignarServicioOpen = false;


  constructor(
    private api: Clientes,
    private apidom: Domicilio,
    private apiser: Servicios,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.getClientes();
    this.verservicio()
    this.verrutas();
    this.vertiposservicios();
    this.verestadoservicio();
    this.verservicioasignados();
    this.verservicioprogramados();
    this.verserviciossurtidos();
    this.verserviciocancelados()
  }

  // ==================== CLIENTES ====================
  async getClientes() {
    try {
      const response = await this.api.getClientes();
      this.clientes = response.data?.data || [];
      console.log('✅ Clientes cargados:', this.clientes);
    } catch (error) {
      console.error('❌ // clientes:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: '// clientes',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  abrirModalAgregarCliente() { this.isModalOpen = true; }

  cerrarModal() { this.isModalOpen = false; }

  async guardarcliente() {
    if (!this.nombre || !this.apellidos || !this.telefono) {
      const alert = await this.alertCtrl.create({
        header: 'Campos incompletos',
        message: 'Por favor, complete todos los campos del formulario.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      const data = { nombre: this.nombre, apellidos: this.apellidos, telefono: this.telefono };
      const response = await this.api.guardarcliente(data);

      if (response && response.data) {
        this.clientes.push(response.data.data);
        this.nombre = '';
        this.apellidos = '';
        this.telefono = '';
        console.log('✅ Cliente agregado:', response.data.data);

        await this.cargarServicios();
      }

      this.cerrarModal();
    } catch (error) {
      console.error('❌ Error agregando cliente:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo agregar el cliente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async editarcliente(cliente: any) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Cliente',
      inputs: [
        { name: 'nombre', type: 'text', value: cliente.nombre },
        { name: 'apellidos', type: 'text', value: cliente.apellidos },
        { name: 'telefono', type: 'text', value: cliente.telefono }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Actualizar',
          handler: async (data) => {
            try {
              const response = await this.api.updateCliente(cliente.documentId, {
                nombre: data.nombre,
                apellidos: data.apellidos,
                telefono: data.telefono,
              });
              if (response && response.data) {
                const index = this.clientes.findIndex(c => c.documentId === cliente.documentId);
                if (index !== -1) this.clientes[index] = response.data.data;

                const successAlert = await this.alertCtrl.create({
                  header: 'Éxito',
                  message: 'Cliente actualizado correctamente.',
                  buttons: ['OK']
                });
                await successAlert.present();
                console.log('✅ Cliente actualizado:', response.data.data);
              }
            } catch (err) {
              console.error('Error actualizando cliente:', err);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarcliente(documentId: string) {
    const confirmar = confirm('¿Seguro que quieres eliminar este cliente?');
    if (confirmar) {
      try {
        await this.api.deleteCliente(documentId);
        this.clientes = this.clientes.filter(c => c.documentId !== documentId);
        console.log('Cliente eliminado con ID:', documentId);
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar cliente');
      }
    }
  }

  // ==================== DOMICILIOS ====================
  async verDomicilios(cliente: any) {
    this.cliente = cliente;
    this.domicilioSeleccionado = null;
    await this.getDomicilios(cliente.documentId);
    this.isModalDomicilioOpen = true; // ✅ <-- Aquí activamos el modal
  }

  async getDomicilios(documentId: string) {
    try {
      const response = await this.apidom.getdomicilio(documentId);
      this.domicilios = response.data?.data || [];
      console.log('✅ Domicilios cargados:', this.domicilios);
    } catch (error) {
      console.error('❌ // domicilios:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: '// domicilios',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  async getClientesByTelefono(event: any) {
    const TELEFONO = event.target.value.trim();

    if (TELEFONO === '') {
      await this.getClientes();
      return;
    }

    if (TELEFONO.length < 10) {
      this.clientes = [];
      return;
    }

    try {
      const res = await this.api.getClienteByPhone(TELEFONO);

      if (!res.data || Object.keys(res.data).length === 0) {
        // 🚨 No se encontró cliente → mostrar alerta
        const alert = await this.alertCtrl.create({
          header: 'Cliente no encontrado',
          message: `No existe ningún cliente con el teléfono <b>${TELEFONO}</b>. ¿Deseas registrarlo?`,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Registrar',
              handler: () => {
                this.telefono = TELEFONO; // precargar teléfono en el modal
                this.abrirModalAgregarCliente();
              }
            }
          ]
        });
        await alert.present();
      } else {
        this.clientes = [res.data];
      }

    } catch (err) {
      console.error('❌ Cliente no encontrado o error:', err);
      this.clientes = [];

      // 🚨 Mostrar alerta también si hubo error
      const alert = await this.alertCtrl.create({
        header: 'Cliente no encontrado',
        message: `No se pudo obtener el cliente con el teléfono ${TELEFONO}. ¿Deseas registrarlo?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Registrar',
            handler: () => {
              this.telefono = TELEFONO;
              this.abrirModalAgregarCliente();
            }
          }
        ]
      });
      await alert.present();
    }
  }




  seleccionarDomicilio(dom: any) {
    // Guardar el domicilio seleccionado
    this.domicilioSeleccionado = dom;

    // Aquí debes abrir el modal o formulario para registrar el servicio
    this.abrirFormularioServicio(dom);
    
  }

  abrirFormularioServicio(domicilio: any) {
    // Enviar el domicilio seleccionado y abrir el formulario
    this.isModalFormularioServicioOpen = true;
    this.domicilioFormulario = domicilio;  // Guardamos el domicilio para usarlo en el formulario
  }
  cerrarModalDomicilio() {
    this.isModalDomicilioOpen = false;
    this.domicilios = [];  // O puedes limpiar otras variables si lo deseas
  }
  abrirModalAgregarDomicilio() { this.isModalAgregarDomicilioOpen = true; }

  cerrarModalAgregarDomicilio() {
    this.isModalAgregarDomicilioOpen = false;
    this.nuevaCalle = '';
    this.nuevoNumero = '';
    this.nuevaColonia = '';
    this.nuevoCP = '';
    this.nuevaReferencia = '';
  }

  async guardarDomicilio() {
    if (!this.nuevaCalle || !this.nuevoNumero || !this.nuevaColonia || !this.nuevoCP) {
      const alert = await this.alertCtrl.create({
        header: 'Campos incompletos',
        message: 'Por favor completa todos los campos obligatorios',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      const data = {
        cliente: this.cliente.documentId,
        calle: this.nuevaCalle,
        numero: this.nuevoNumero,
        colonia: this.nuevaColonia,
        cp: this.nuevoCP,
        referencia: this.nuevaReferencia
      };

      const response = await this.apidom.guardardomicilio(data);
      if (response && response.data) {
        this.domicilios.push(response.data.data);
        this.seleccionarDomicilio(response.data.data);
      }
      this.cerrarModalAgregarDomicilio();
    } catch (error) {
      console.error('Error guardando domicilio', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo guardar el domicilio',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  async deletedomicilio(documentId: string) {
    const confirmar = confirm('¿Seguro que quieres eliminar este domicilio?');
    if (confirmar) {
      try {
        // Eliminar el domicilio
        await this.apidom.deletedomicilio(documentId);
        console.log('Domicilio eliminado con éxito');

        // Recargar los domicilios del cliente
        await this.getDomicilios(this.cliente.documentId); // Aquí pasamos el documentId del cliente
      } catch (error) {
        console.error('Error al eliminar domicilio:', error);
        alert('Error al eliminar domicilio');
      }
    }
  }
  // ==================== Rutas ====================
  async verrutas() {
    try {
      const response = await this.apidom.getrutas()
      this.rutas = response.data?.data || [];
      console.log('✅ Servicios rutas:', this.rutas);
    } catch (error) {
      console.error('❌ // rutas:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }
  // ==================== Rutas ====================
  async vertiposservicios() {
    try {
      const response = await this.apidom.gettiposervicios()
      this.tipos_servicio = response.data?.data || [];
      console.log('✅ Servicios rutas:', this.tipos_servicio);
    } catch (error) {
      console.error('❌ // rutas:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }
  // ==================== Estado Servicio====================
  async verestadoservicio() {
    try {
      const response = await this.apidom.getestadoservicio()
      this.estados_servicio = response.data?.data || [];
      console.log('✅ Servicios rutas:', this.estados_servicio);
    } catch (error) {
      console.error('❌ // rutas:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }
  // ==================== SERVICIOS ====================
  async verservicios(cliente: any) {
    this.cliente = cliente;
    await this.getservicios(cliente.documentId);
    this.isModalServiciosOpen = true;
  }
  async verservicio() {
    try {
      const response = await this.apiser.verservicio();

      this.servicios1 = Array.isArray(response?.data?.data) ? response.data.data : [];

      if (this.servicios1.length === 0) {
        console.log('ℹNo hay servicios registrados para hoy.');
        return;
      }

      console.log('Servicios registrados:', this.servicios1);
    } catch (error: any) {
      // ⚠️ Si el backend devuelve 404, no mostrar alerta
      if (error?.response?.status === 404) {
        console.log('ℹNo hay servicios registrados para hoy (404 del backend).');
        this.servicios1 = [];
        return;
      }

      // Otros errores sí se muestran
      // console.error('❌ // servicios:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }

  async verservicioasignados() {
    try {
      const response: any = await this.apiser.verservicioasignados();
      console.log(response);

      // Filtramos solo los servicios con estado "Asignado"
      this.serviciosasignados = response.data?.data || [];

      console.log('✅ Servicios asignados:', this.serviciosasignados);

    } catch (error) {
      // console.error('❌ // servicios:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }
  async verservicioprogramados() {
    try {
      const response: any = await this.apiser.verservicioprogramados();
      console.log(response);

      // Filtramos solo los servicios con estado "Asignado"
      this.serviciosprogramados = response.data?.data || [];

      console.log('✅ Servicios asignados:', this.serviciosprogramados);

    } catch (error) {
      // console.error('❌ // servicios:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }
  async getservicios(documentId: string) {
    try {
      const response = await this.apiser.verservicios(documentId);
      this.servicios = response.data?.data || [];
      console.log('✅ Servicios cargados:', this.servicios);
    } catch (error) {
      // console.error('❌ // servicios:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }
  mostrarFechaProgramado = false; // controla si se muestra el campo de fecha

  verificarEstado(event: any) {
    const estadoId = event.detail.value;

    // Buscar el estado según el formato de Strapi
    const estadoSeleccionado = this.estados_servicio.find(
      e => e.id === estadoId || e.documentId === estadoId
    );
    // Obtener el tipo desde el lugar correcto (por compatibilidad con Strapi)
    const tipoEstado = estadoSeleccionado?.tipo || estadoSeleccionado?.attributes?.tipo;

    if (tipoEstado === 'Programado') {
      console.log('✅ Es programado, mostrando fecha');
      this.mostrarFechaProgramado = true;
      
    } else {
      console.log('❌ No es programado');
      this.mostrarFechaProgramado = false;
      this.servicio.fecha_programado = null;
    }
  }


  async guardarServicio() {
    if (!this.servicio.ruta || !this.servicio.tipo_servicio || !this.servicio.estado_servicio) {
      const alert = await this.alertCtrl.create({
        header: 'Campos incompletos',
        message: 'Por favor, complete todos los campos del servicio.',
        buttons: ['OK']
      });
      await alert.present();
      await this.cargarServicios();
      return;
    }
    // Si el estado es Programado, exigir fecha
    if (this.mostrarFechaProgramado && !this.servicio.fecha_programado) {
      const alert = await this.alertCtrl.create({
        header: 'Fecha requerida',
        message: 'Debe seleccionar una fecha para el servicio programado.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    try {
      const data = {
        cliente: this.cliente.documentId,
        ruta: this.servicio.ruta,
        tipo_servicio: this.servicio.tipo_servicio,
        estado_servicio: this.servicio.estado_servicio,
        observacion: this.servicio.observacion,
        nota: this.servicio.nota,
        fecha_programado: this.servicio.fecha_programado,
        fecha_surtido: this.servicio.fecha_surtido,
        fecha_cancelado: this.servicio.fecha_cancelado,
      };

      const response = await this.apiser.crearservicio(data);
      const success = await this.alertCtrl.create({
              header: 'Guardado',
              message: 'El pedido fue guardado correctamente.',
              buttons: ['OK']
            });
            await success.present();

            // 🔄 Recargar listas
            this.verservicio();
            this.verservicioasignados();
            this.verservicioprogramados();
            this.verserviciossurtidos();
            this.verserviciocancelados();
     
      if (response && response.data) {
        this.servicios.push(response.data.data);
        this.servicio = {
          ruta: null,
          tipo_servicio: null,
          estado_servicio: null,
          observacion: '',
          nota: '',
          fecha_programado: null,
          fecha_surtido: null,
          fecha_cancelado: null
        };
        console.log('✅ Servicio creado:', response.data.data);
      }
      this.cerrarModalFormularioServicio();
      this.cerrarModalDomicilio()
    } catch (error) {
      console.error('❌ Error creando servicio:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo crear el servicio.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  abrirModalAsignarServicio(servicioSeleccionado: any) {
    console.log('🟢 Servicio seleccionado para asignar:', servicioSeleccionado);

    this.servicio = {
      documentId: servicioSeleccionado.documentId,
      ruta: servicioSeleccionado.ruta?.documentId || null,
      estado_servicio: servicioSeleccionado.estado_servicio?.documentId || null,
      observacion: servicioSeleccionado.observacion || '',
      nota: servicioSeleccionado.nota || ''
    };

    console.log('📦 Servicio preparado para editar:', this.servicio);
    this.isModalAsignarServicioOpen = true;
  }

  cerrarModalAsignarServicio() {
    this.isModalAsignarServicioOpen = false;
  }

  async asignarServicio() {
    if (!this.servicio.ruta || !this.servicio.estado_servicio) {
      const alert = await this.alertCtrl.create({
        header: 'Campos incompletos',
        message: 'Por favor, seleccione la ruta y el estado del servicio.',
        buttons: ['OK']
      });
      await alert.present();
      
      return;
      await this.cargarServicios();
    }

    const data: any = {
      ruta: this.servicio.ruta,
      estado_servicio: this.servicio.estado_servicio,
      observacion: this.servicio.observacion || '',
      nota: this.servicio.nota || '',
    };

    // ⏰ Solo agregar fecha y hora SI el servicio es programado
    if (this.mostrarFechaProgramado && this.servicio.fecha_programado) {
      // fecha_programado ya trae fecha y hora en formato ISO
      data.fecha_programado = this.servicio.fecha_programado;
      console.log("📅 Fecha y hora programada incluida:", data.fecha_programado);
    }

    console.log(' Enviando datos al backend:', data);

    try {
      console.log('ID del servicio a editar:', this.servicio.documentId);

      const response = await this.apiser.editarservicio(this.servicio.documentId, data);

      console.log('✅ Respuesta del backend:', response);

      const success = await this.alertCtrl.create({
              header: 'Cancelado',
              message: 'El pedido fue asignado correctamente.',
              buttons: ['OK']
            });
            await success.present();

            // 🔄 Recargar listas
            this.verservicio();
            this.verservicioasignados();
            this.verservicioprogramados();
            this.verserviciossurtidos();
            this.verserviciocancelados();

      this.cerrarModalAsignarServicio();
    } catch (error: any) {
      console.error('❌ Error completo asignando servicio:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo asignar el servicio. Revise la consola para más detalles.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  cerrarModalFormularioServicio() {
    this.isModalFormularioServicioOpen = false;
    this.servicio = {
      ruta: null,
      tipo_servicio: null,
      estado_servicio: 4,
      observacion: '',
      nota: '',
      fecha_programado: null,
      fecha_surtido: null,
      fecha_cancelado: null
    };
  }

  cerrarModalServicios() {
    this.isModalServiciosOpen = false;
    this.servicio = [];
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
        await this.cargarServicios();
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
        await this.cargarServicios();
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
      await this.cargarServicios();

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
  async verserviciossurtidos() {
    try {
      const response: any = await this.apiser.verserviciosurtidos();
      console.log(response);

      // Filtramos solo los servicios con estado "Asignado"
      this.serviciossurtidos = response.data?.data || [];

      console.log('✅ Servicios asignados:', this.serviciossurtidos);

    } catch (error) {
      // console.error('❌ // servicios:', error);
      // const alert = await this.alertCtrl.create({
      //   header: 'Error',
      //   message: '// servicios',
      //   buttons: ['OK']
      // });
      // await alert.present();
    }
  }

  async verserviciocancelados() {
  try {
    const response: any = await this.apiser.verserviciocancelados();
    console.log("🚫 Servicios cancelados RESPUESTA:", response);

    this.servicioscancelados = response.data?.data || [];

    console.log("🚫 Servicios cancelados:", this.servicioscancelados);

  } catch (error) {
    // console.error("❌ // servicios cancelados:", error);
    
    // const alert = await this.alertCtrl.create({
    //   header: "Error",
    //   message: "// servicios cancelados",
    //   buttons: ["OK"]
    // });

    // await alert.present();
  }
}
cargarServicios() {
  this.apiser.verservicio().then((res: any) => {
    this.servicios = res.data.data;
  });
}

async cancelarServicio(servicio: any) {
  const alert = await this.alertCtrl.create({
    header: 'Cancelar pedido',
    message: '¿Seguro que deseas cancelar este pedido?',
    buttons: [
      { text: 'No', role: 'cancel' },
      {
        text: 'Sí, cancelar',
        handler: async () => {
          try {
           
            const servicioId =
              servicio.documentId ||
              servicio.id ||
              servicio?.attributes?.documentId ||
              servicio?.attributes?.documentId;

            if (!servicioId) {
              console.error('❌ No se encontró ID del servicio', servicio);
              return;
            }

            // 🔴 Buscar estado Cancelado
            const estadoCancelado = this.estados_servicio.find(
              e => e.tipo === 'Cancelado' || e.attributes?.tipo === 'Cancelado'
            );

            if (!estadoCancelado) {
              const alert = await this.alertCtrl.create({
                header: 'Error',
                message: 'El estado "Cancelado" no existe.',
                buttons: ['OK']
              });
              await alert.present();
              await this.cargarServicios();
              return;
            }

            const estadoId =
              estadoCancelado.documentId || estadoCancelado.id;

            const data = {
              estado_servicio: estadoId,
              fecha_cancelado: new Date().toISOString()
            };

            console.log('🚫 Cancelando servicio:', servicioId, data);

            await this.apiser.editarservicio(servicioId, data);

            const success = await this.alertCtrl.create({
              header: 'Cancelado',
              message: 'El pedido fue cancelado correctamente.',
              buttons: ['OK']
            });
            await success.present();

            // 🔄 Recargar listas
            this.verservicio();
            this.verservicioasignados();
            this.verservicioprogramados();
            this.verserviciossurtidos();
            this.verserviciocancelados();

          } catch (error) {
            console.error('❌ Error cancelando servicio:', error);
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: 'No se pudo cancelar el pedido.',
              buttons: ['OK']
            });
            await alert.present();
          }
        }
      }
    ]
  });

  await alert.present();
}




  


}
