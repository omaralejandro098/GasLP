import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class Servicios {
  private apiUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }
  async verservicios(documentId: string) {
    return await axios.get(`${this.apiUrl}/servicios?filters[cliente][documentId][$eq]=${documentId}&populate=*`, {
      headers: this.getAuthHeaders()
    })
  }
  async crearservicio(data: any) {
    return await axios.post(`${this.apiUrl}/servicios`, { data }, {
      headers: this.getAuthHeaders()
    })
  }
  async verservicio() {
    return await axios.get(
      `${this.apiUrl}/serviciosregistrados`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
    async verserviciobyruta() {
    return await axios.get(
      `${this.apiUrl}/serviciosbyruta`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  async verservicioasignados() {
    return await axios.get(`${this.apiUrl}/serviciosasignados`, {
      headers: this.getAuthHeaders()
    })
  }
  async verserviciosurtidos() {
    return await axios.get(`${this.apiUrl}/serviciossurtidos`, {
      headers: this.getAuthHeaders()
    })
  }
  async verservicioprogramados() {
    return await axios.get(`${this.apiUrl}/serviciosprogramados`, {
      headers: this.getAuthHeaders()
    })
  }
  async editarservicio(documentId: string, data: any) {
    console.log(data)
    return await axios.put(`${this.apiUrl}/servicios/${documentId}`, { data }, {
      headers: this.getAuthHeaders()
    });
  }

  async verserviciocancelados() {
  return await axios.get(`${this.apiUrl}/servicioscancelados`, {
    headers: this.getAuthHeaders()
  });
}

  
}
