import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class Domicilio {
  private apiUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }
  /**
  * Obtener todos los clientes
  */
  async getdomicilio(documentId: string) {
    return await axios.get(`${this.apiUrl}/domicilios?filters[cliente][documentId][$eq]=${documentId}&populate=*`, {
      headers: this.getAuthHeaders()
    });
  }
  async guardardomicilio(data: any) {
    return await axios.post(`${this.apiUrl}/domicilios`, { data }, {
      headers: this.getAuthHeaders()
    })
  }
  async deletedomicilio(documentId: string) {
    return await axios.delete(`${this.apiUrl}/domicilios/${documentId}`, {
      headers: this.getAuthHeaders()
    })
  }
  async getrutas() {
    return await axios.get(`${this.apiUrl}/rutas`, {
      headers: this.getAuthHeaders()
    })
  }
  async gettiposervicios() {
    return await axios.get(`${this.apiUrl}/tipo-servicios`, {
      headers: this.getAuthHeaders()
    })
  }
  async getestadoservicio() {
    return await axios.get(`${this.apiUrl}/estado-servicios`, {
      headers: this.getAuthHeaders()
    })
  }
  //  getdomicilio(documentId: string) {
  //   return axios.get(`${this.url}/domicilios?filters[cliente][documentId][$eq]=${documentId}&populate=*`);
  // }

}
