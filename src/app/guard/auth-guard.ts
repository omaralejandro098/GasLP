import { CanActivateFn } from '@angular/router';

import axios, { Axios } from 'axios';
import { environment } from 'src/environments/environment.prod';

export const authGuard: CanActivateFn = async(route, state) => {
  let url=environment.apiUrl
  const token =  localStorage.getItem("token");
  if (!token) {
    window.alert('Debes iniciar sesion para continuar');
    window.location.href = '/login';
    
    return false;
  }else{
    try{
      const user= await axios.get(url+'/users/me?populate=*',{
        headers:{
          'Authorization': 'Bearer ' + token
        }
        
      });
      if(user.data.role.type=="operador"){
         localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.alert("Tu sesion ha caducado, vuelve a iniciar sesion para volver a intentarlo");
      window.location.href = '/login'
      return false
        
      }
    console.log(user)
    return true
    }catch(error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      console.log(error)
      window.alert("Tu sesion ha caducado, vuelve a iniciar sesion para volver a intentarlo");
      window.location.href = '/login'
      return false

    }
  }


  window.location.href = '/login'
  return true; 

};
