import { useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import {
  LayoutDashboardIcon,
  FileTextIcon,
  MessageSquareCodeIcon,
  BriefcaseIcon,
  BadgeDollarSignIcon,
  UsersIcon,
  CrownIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import logoDark from '@/assets/images/logo-dark.png'

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, handleLogout } = useAuth()

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboardIcon, 
      href: '/dashboard' 
    },
    { 
      label: 'Projetos', 
      icon: FileTextIcon, 
      href: '/dashboard/projetos' 
     },
    {
      label: 'Marketing',
      icon: MessageSquareCodeIcon,
      href: '/dashboard/marketing',
    },
    {
      label: 'Gestão de pessoas',
      icon: BriefcaseIcon,
      href: '/dashboard/gestao-de-pessoas',
    },
    {
      label: 'Financeiro',
      icon: BadgeDollarSignIcon,
      href: '/dashboard/financeiro',
    },
    { 
      label: 'Clientes', 
      icon: UsersIcon, 
      href: '/dashboard/clientes' 
    },
    { 
      label: 'Presidência', 
      icon: CrownIcon, 
      href: '/dashboard/presidencia' 
    },
  ]

  const userFirstName = user?.name?.[0] || ''
  const userLastName = user?.lastName?.[0] || ''

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
        >
          <Menu />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[95%]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <img
              src={logoDark}
              alt="OneFlow Logo"
              className="size-10"
            />
            OneFlow
          </DrawerTitle>
        </DrawerHeader>

        <nav className="px-4 space-y-2">
          {menuItems.map(item => (
            <DrawerClose asChild key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 p-2 rounded 
                  ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                `}
              >
                <item.icon className="size-5" />
                {item.label}
              </NavLink>
            </DrawerClose>
          ))}
        </nav>

        {user && (
          <div className="absolute bottom-0 left-0 w-full p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={user?.imageUrl} alt="Profile picture" />
                <AvatarFallback>
                  {userFirstName}
                  {userLastName}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {user.name || ''} {user.lastName || ''}
                </p>
                <p className="text-xs text-muted-foreground">{user.email || ''}</p>
              </div>
            </div>
            <div className="space-y-2">
              <DrawerClose asChild>
                <NavLink
                  to="/dashboard/perfil"
                  className="block w-full p-2 text-left hover:bg-accent rounded"
                >
                  Meu perfil
                </NavLink>
              </DrawerClose>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                Sair
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
