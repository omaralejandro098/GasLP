import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl

  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': 'Bearer ' + token } : {}
  }

  //#region Auth
  async login(identifier: string, password: string) {
    return await axios.post(this.apiUrl + '/auth/local', {
      identifier,
      password
    })
  }
  async loginGoogle(access_token: string) {
    return await axios.get(this.apiUrl + '/auth/google/callback?access_token=' + access_token)

  }

  async forgot(email: string) {
    return await axios.post(`${this.apiUrl}/auth/forgot-password`, {
      email
    })
  }

  async reset(code: string, password: string, passwordConfirmation: string) {
    return await axios.post(`${this.apiUrl}/auth/reset-password`, {
      code,
      password,
      passwordConfirmation
    })
  }

  //#endregion
  //#region Cliente
  async createClinte(data: any) {
    console.log(data);
    const cliente = await axios.post(this.apiUrl + '/clientes', {
      data:
        { nombres: data.data.nombres, apellidos: data.data.apellidos, telefono: data.data.telefono }
    }, {
      headers: this.getAuthHeaders()
    })

    this.createDomicilio(data, cliente.data.data).then(() => {
      console.log('Domicilio creado')
    }).catch((error) => {
      console.log(error)
    })
    return cliente;
  }

  async createDomicilio(data: any, cliente: any) {
    console.log('Cliente: ', cliente.data)
    return axios.post(this.apiUrl + '/domicilios', {
      data: {
        calle: data.data.calle,
        colonia: data.data.colonia,
        numero: data.data.numero,
        cp: data.data.cp,
        referencia: data.data.referencia,
        cliente: cliente.documentId
      }
    }, {
      headers: this.getAuthHeaders()
    })
  }

  async getClientes() {
    // const token = localStorage.getItem('token')
    return await axios.get(this.apiUrl + '/clientes', {
      headers: this.getAuthHeaders()
    });

  }
  async getClienteById(id: number) {
    return await axios.get(this.apiUrl + '/clientes/' + id, {
      headers: this.getAuthHeaders()
    });
  }
  async getClienteByPhone(telefono: string) {
    return await axios.get(this.apiUrl + '/clientes/telefono/' + telefono, {
      headers: this.getAuthHeaders()
    });
  }

  async updateCliente(id: number, data: any) {
    return await axios.put(this.apiUrl + '/clientes/' + id, { data: { nombres: data.nombres, apellidos: data.apellidos, telefono: data.telefono } }, {
      headers: this.getAuthHeaders()
    })

  }
  async deleteCliente(id: number) {
    return await axios.delete(this.apiUrl + '/clientes/' + id, {
      headers: this.getAuthHeaders()
    })
  }


  //#endregion
}