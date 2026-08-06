import { ReactNode } from 'react'; import Sidebar from './Sidebar';
export default function DashboardLayout({children}:{children:ReactNode}){return <div className='flex'><Sidebar/><main className='p-6 w-full'>{children}</main></div>;}
