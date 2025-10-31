import React, {useState} from 'react';
import api from '../api/api';
export default function AuthForm({mode, onSuccess}) {
  const [form,setForm] = useState({name:'',email:'',password:'',role:'patient'});
  const handle = e => setForm({...form,[e.target.name]: e.target.value});
  const submit = async () => {
    const path = mode==='signup' ? '/auth/signup' : '/auth/login';
    const res = await api.post(path, form);
    localStorage.setItem('token', res.data.token);
    onSuccess(res.data.user);
  };
  return (<div>
    {mode==='signup' && <input name="name" placeholder="Name" onChange={handle} />}
    <input name="email" placeholder="Email" onChange={handle} />
    <input name="password" type="password" placeholder="Password" onChange={handle} />
    {mode==='signup' && <select name="role" onChange={handle}><option value="patient">Patient</option><option value="doctor">Doctor</option></select>}
    <button onClick={submit}>{mode}</button>
  </div>);
}
