import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Ellipsis, FileImage, Settings } from 'lucide-react'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface User {
  id: number
  name: string
  cpf: string
  email: string
  telephone: string
  role: 'PRESIDENTE' | 'DIRETOR' | 'MEMBRO'
  imageUrl: string
  sector: {
    sectorId: 0
    name: string
  }
}

export function Profile() {
  const [user, setUser] = useState<User | null>(null)

  const { 'oneflow.user': userCookie } = parseCookies()
  const navigate = useNavigate()

  useEffect(() => {
    if (userCookie) {
      const userData = JSON.parse(userCookie)

      setUser(userData)
    }
  }, [userCookie])

  const updateProfileImage = () => {
    navigate('/dashboard/perfil/atualizar-imagem')
  }

  return (
    <div className="relative min-h-screen display flex flex-col gap-8">
      <div className="bg-gradient-to-r from-[#ec9640] to-[#1a47bb] h-96 w-full" />
      {/* Informações do usuário */}
      <section className="absolute w-full flex flex-col items-center top-0 py-2 text-white gap-4">
        <h1 className="text-3xl font-bold">Meu perfil</h1>
        <img
          src={user?.imageUrl}
          alt=""
          className="size-[100px] rounded-full"
        />
        <p className="text-xl font-medium">{user?.name}</p>
        <p className="text-xl font-medium">Email: {user?.email}</p>
        <p className="text-xl font-medium">CPF: {user?.cpf}</p>
        <p className="text-xl font-medium">Contato: {user?.telephone}</p>
      </section>

      <div className="w-full flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Ellipsis className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-1"
                  onClick={updateProfileImage}
                >
                  <FileImage className="size-4" />
                  Trocar foto de perfil
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-1"
                  onClick={() => {navigate('/dashboard/usuario/atualizar-dados')}}
                >
                  <Settings className="size-4" />
                  Alterar dados
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
