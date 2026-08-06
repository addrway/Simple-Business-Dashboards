import { storage } from './storage';
export const auth={login:(email:string)=>storage.set('sbd_user',{email}),logout:()=>storage.set('sbd_user',null),user:()=>storage.get<{email:string}|null>('sbd_user',null)};
