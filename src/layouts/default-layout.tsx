import { MobileSidebar } from '@/components/mobile-sidebar'
import { Sidebar } from '@/components/sidebar'
import { Outlet } from 'react-router-dom'

export function DefaultLayout() {
  return (
    <main className="w-screen min-h-screen flex">
      <Sidebar className="hidden md:flex" />
      
      <MobileSidebar />
      
      <div className="flex-1">
        <Outlet />
      </div>
    </main>
  )
}
