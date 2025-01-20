import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Ellipsis,
  FileImage,
  LockKeyhole,
  Settings,
  Trash2,
  Loader2,
} from 'lucide-react'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { baseURL } from '@/utils/constants'

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
  const [isRemoving, setIsRemoving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { 'oneflow.user': userCookie, 'oneflow.token': token } = parseCookies()
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

  const removeProfileImage = async () => {
    setIsRemoving(true)
    try {
      const response = await fetch(`${baseURL}/users/remove-image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: 'Imagem removida',
          description: 'Sua foto de perfil foi removida com sucesso.',
        })
        // Atualizar o user no estado com a imagem removida
        if (user) {
          setUser({
            ...user,
            imageUrl: '', // ou um valor padrão para imagem
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: 'Erro ao remover imagem',
          description:
            error.message || 'Houve um problema ao remover a foto de perfil.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro inesperado',
        description:
          'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsRemoving(false)
      setDialogOpen(false)
    }
  }

  return (
    <div className="relative min-h-screen display flex flex-col gap-8">
      <div className="bg-gradient-to-r from-[#ec9640] to-[#1a47bb] h-96 w-full" />
      {/* Informações do usuário */}
      <section className="absolute w-full flex flex-col items-center top-0 py-2 text-white gap-4">
        <h1 className="text-3xl font-bold">Meu perfil</h1>
        <div className="relative">
          <img
            src={user?.imageUrl}
            alt=""
            className="size-[100px] rounded-full"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -right-2 -bottom-2 size-8 rounded-full"
                disabled={!user?.imageUrl}
              >
                <Trash2 className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remover foto de perfil</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja remover sua foto de perfil? Esta ação
                  não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isRemoving}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={removeProfileImage}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Removendo...
                    </>
                  ) : (
                    'Remover'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                  onClick={() => {
                    navigate('/dashboard/usuario/atualizar-dados')
                  }}
                >
                  <Settings className="size-4" />
                  Alterar dados
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-1"
                  onClick={() => {
                    navigate('/dashboard/usuario/redefinir-senha')
                  }}
                >
                  <LockKeyhole className="size-4" />
                  Alterar senha
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
