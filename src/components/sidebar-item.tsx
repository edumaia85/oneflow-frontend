import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

interface SidebarItemProps {
  label: string
  icon: LucideIcon
  href: string
}

export function SidebarItem({ label, icon: Icon, href }: SidebarItemProps) {
  const navigate = useNavigate()

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (label === 'Logout') {
      if (window.confirm('Tem certeza de que deseja sair?')) {
        // logout()
        navigate('/login')
      } else {
        event.preventDefault()
      }
    }
  }

  return (
    <NavLink
      onClick={handleClick}
      to={href}
      end
      className={({ isActive }) =>
        cn(
          'w-full flex items-center justify-start gap-2 font-medium text-lg text-black relative pl-8',
          'hover:bg-gray-100 py-2 transition-colors',
          isActive &&
            'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
          isActive &&
            'before:w-3 before:h-6 before:bg-orange-500 before:rounded-[2px] before:ml-1'
        )
      }
    >
      <Icon className="size-7" />
      {label}
    </NavLink>
  )
}
