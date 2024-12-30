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

export function Sidebar() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gray-200 w-1/2 max-w-[270px] space-y-2">
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
        label="Administrativo"
        icon={BadgeDollarSignIcon}
        href="/dashboard/administrativo"
      />
      <SidebarItem label="Clientes" icon={UsersIcon} href="/dashboard/clientes" />
      <SidebarItem label="Presidência" icon={CrownIcon} href="/dashboard/presidencia" />

      {/* Usuário logado */}
      <section className="absolute bottom-0 left-0 p-2 w-full flex items-center gap-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p>Eduardo Maia</p>
          <p className="text-xs text-muted-foreground">eduardo@gmail.com</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="mb-3 ml-3">
            <ChevronDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </div>
  )
}
