import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { baseURL } from '@/utils/constants'
import { CalendarIcon, DeleteIcon, PlusIcon } from 'lucide-react'
import { parseCookies } from 'nookies'
import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { NavLink } from 'react-router-dom'

enum UserRole {
  PRESIDENTE = 'PRESIDENTE',
  DIRETOR = 'DIRETOR',
  MEMBRO = 'MEMBRO',
}

interface Sector {
  sectorId: string
  name: string
}

interface User {
  userId: number
  name: string
  cpf: string
  email: string
  telephone: string
  role: UserRole
  sector: Sector
}

interface UsersResponse {
  content: User[]
  totalPages: number
}

export function Presidency() {
  const [users, setUsers] = useState<User[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    cpf: '',
    email: '',
    password: '',
    telephone: '',
    role: '',
    sectorId: '',
  })

  const { 'oneflow.token': token } = parseCookies()
  const { toast } = useToast()

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${baseURL}/users?page=0`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao buscar usuários')
      }

      const data: UsersResponse = await response.json()
      setUsers(data.content)
    } catch (err) {
      console.error('Erro ao buscar usuários:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const fetchSectors = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/sectors`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao buscar setores')
      }

      const data = await response.json()
      setSectors(data)
    } catch (err) {
      console.error('Erro ao buscar setores:', err)
    }
  }, [token])

  const handleCreateUser = async () => {
    try {
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar usuário')
      }

      await fetchUsers()
      setIsDialogOpen(false)
      setNewUser({
        name: '',
        cpf: '',
        email: '',
        password: '',
        telephone: '',
        role: UserRole.MEMBRO,
        sectorId: '',
      })
      toast({
        title: 'Usuário adicionado com sucesso!',
        description: 'Novo usuário foi adicionado com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao criar usuário:', err)
      toast({
        title: 'Erro ao adicionar usuário!',
        description:
          'Erro ao tentar adicionar novo usuário. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${baseURL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao deletar usuário')
      }

      setUsers(users.filter(user => user.userId !== userId))
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      toast({
        title: 'Usuário deletado com sucesso!',
        description: 'Usuário foi deletado da base de dados com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao deletar usuário:', err)
      toast({
        title: 'Erro ao deletar usuário!',
        description:
          'Erro ao tentar deletar novo usuário. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchSectors()
  }, [fetchUsers, fetchSectors])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-4">
          <h1 className="text-3xl font-semibold">Gestão de Usuários</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center gap-2 rounded-2xl w-[130px]">
                <PlusIcon className="size-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={e =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={newUser.cpf}
                    onChange={e =>
                      setNewUser({ ...newUser, cpf: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={e =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={e =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="telephone">Contato</Label>
                  <Input
                    id="telephone"
                    value={newUser.telephone}
                    onChange={e =>
                      setNewUser({ ...newUser, telephone: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: UserRole) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map(role => (
                        <SelectItem key={role} value={role}>
                          {formatRole(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="sector">Setor</Label>
                  <Select
                    value={newUser.sectorId}
                    onValueChange={(value: string) =>
                      setNewUser({ ...newUser, sectorId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(sector => (
                        <SelectItem
                          key={sector.sectorId}
                          value={sector.sectorId}
                        >
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser}>Criar Usuário</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="flex items-center justify-center gap-2 rounded-2xl w-[130px]">
            <CalendarIcon className="size-2" />
            <NavLink to="/dashboard/reunioes/1">Reuniões</NavLink>
          </Button>
        </div>
        <Button className="rounded-2xl w-[130px] self-end">
          <NavLink to="/dashboard/documentos-gerais">Documentos</NavLink>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.userId}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.cpf}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.telephone}</TableCell>
              <TableCell>{formatRole(user.role)}</TableCell>
              <TableCell>{user.sector.name}</TableCell>
              <TableCell>
                <Button
                  className="flex items-center justify-center gap-2 rounded-2xl"
                  variant="destructive"
                  onClick={() => {
                    setUserToDelete(user)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <DeleteIcon />
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário {userToDelete?.name}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                userToDelete && handleDeleteUser(userToDelete.userId)
              }
            >
              Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
