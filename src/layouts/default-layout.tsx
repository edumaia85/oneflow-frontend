import { Sidebar } from '@/components/sidebar'
import { Outlet } from 'react-router-dom'
import { useMediaQuery } from '@/hooks/use-media-query'
import { MobileSidebar } from '@/components/mobile-sidebar'

export function DefaultLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <main className="w-screen min-h-screen flex">
      {isMobile ? <MobileSidebar /> : <Sidebar />}

      <div className="flex-1">
        <Outlet />
      </div>
    </main>
  )
}
