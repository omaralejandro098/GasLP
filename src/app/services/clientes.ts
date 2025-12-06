import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Clientes {
  private apiUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }
   /**
   * Obtener todos los clientes
   */
  async getClientes() {
    return await axios.get(`${this.apiUrl}/clientes`, {
      headers: this.getAuthHeaders()
    });
  }
  async getClienteByPhone(telefono: string) {
    return await axios.get(`${this.apiUrl}/clientes/telefono/${telefono}`, {
      headers: this.getAuthHeaders()
    });
  }
  async guardarcliente(data:any){
    return await axios.post(`${this.apiUrl}/clientes`, {data} ,{
      headers: this.getAuthHeaders()
    })
  }
   /**
   * Actualizar información del cliente
   */
  async updateCliente(documentId: string | string, data: any) {
    return await axios.put(`${this.apiUrl}/clientes/${documentId}`, {
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono
      }
    }, {
      headers: this.getAuthHeaders()
    });
  }
 async getClientesByTelefono(telefono: string) {
    return await axios.get(`${this.apiUrl}/clientes/telefono/${telefono}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Eliminar cliente por documentId
   */
  async deleteCliente(documentId: string) {
    return await axios.delete(`${this.apiUrl}/clientes/${documentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  
  //#endregion
}
