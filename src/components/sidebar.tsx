import logoDarkImg from '@/assets/images/logo-dark.png'
import {
  BadgeDollarSignIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  CrownIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MessageSquareCodeIcon,
  UsersIcon,
} from 'lucide-react'

import { SidebarItem } from './sidebar-item'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Sidebar({ className }: { className?: string }) {
  const { user, handleLogout } = useAuth()

  return (
    <div
      className={cn(
        'relative min-h-screen flex flex-col bg-gray-200 w-1/2 max-w-[270px] space-y-2',
        className
      )}
    >
      {/* Cabeçalho */}
      <div className="w-full flex items-center gap-2 shadow-md px-4 h-20">
        <img src={logoDarkImg} alt="" className="size-10" />
        <h1 className="font-medium text-xl">OneFlow</h1>
      </div>

      {/* Barra de navegação */}
      <SidebarItem
        label="Dashboard"
        icon={LayoutDashboardIcon}
        href="/dashboard"
      />
      <SidebarItem
        label="Projetos"
        icon={FileTextIcon}
        href="/dashboard/projetos"
      />
      <SidebarItem
        label="Marketing"
        icon={MessageSquareCodeIcon}
        href="/dashboard/marketing"
      />
      <SidebarItem
        label="Gestão de pessoas"
        icon={BriefcaseIcon}
        href="/dashboard/gestao-de-pessoas"
      />
      <SidebarItem
        label="Financeiro"
        icon={BadgeDollarSignIcon}
        href="/dashboard/financeiro"
      />
      <SidebarItem
        label="Clientes"
        icon={UsersIcon}
        href="/dashboard/clientes"
      />
      <SidebarItem
        label="Presidência"
        icon={CrownIcon}
        href="/dashboard/presidencia"
      />

      {/* Usuário logado */}
      {user && (
        <section className="absolute bottom-0 left-0 p-2 w-full flex items-center gap-2 overflow-hidden">
          <Avatar>
            {/* Exibe uma imagem de perfil, se houver, ou as iniciais do usuário */}
            <AvatarImage src={user?.imageUrl} alt="Profile picture" />
            <AvatarFallback>
              {user.name}
              {user.lastName}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <p className="font-semibold truncate">
              {user.name} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-auto mb-3">
              <ChevronDownIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100%-1rem)]">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <NavLink to="/dashboard/perfil">Meu perfil</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLogout()}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      )}
    </div>
  )
}
