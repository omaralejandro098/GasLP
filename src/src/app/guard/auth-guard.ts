import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

export const authGuard: CanActivateFn = async (route, state) => {

  // 🔧 Inyección correcta
  const router = inject(Router);

  // 🌐 Configuración
  const url = environment.apiUrl;
  const token = localStorage.getItem('token');
  const rutaActual = state.url;

  // 🔴 Sin sesión
  if (!token) {
    alert('Debes iniciar sesión para continuar');
    router.navigate(['/login']);
    return false;
  }

  try {
    // 🔍 Validar token en backend
    const response = await axios.get(
      `${url}/users/me?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const user = response.data;
    const rol = user?.role?.type;

    // 🟡 OPERADOR → solo /dashboard
    if (rol === 'operador') {

      if (rutaActual === '/dashboard') {
        return true;
      }

      // ❌ Cualquier otra ruta
      router.navigate(['/dashboard']);
      return false;
    }

    // 🟢 Otros roles → acceso normal
    return true;

  } catch (error) {
    console.error('Error en authGuard:', error);

    // 🔒 Cerrar sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    alert('Tu sesión ha caducado, inicia sesión nuevamente');
    router.navigate(['/login']);
    return false;
  }
};