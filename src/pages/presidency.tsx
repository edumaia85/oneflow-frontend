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
import { CalendarIcon, DeleteIcon, Loader2Icon, PlusIcon } from 'lucide-react'
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
import { useNavigate } from 'react-router-dom'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ScrollArea } from '@/components/ui/scroll-area'

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

interface ApiErrorResponse {
  status: number
  message: string
  fieldsMessage?: string[]
}

export function Presidency() {
  const [users, setUsers] = useState<User[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<UserRole | ''>('')
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)

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
  const navigate = useNavigate()

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }

  const PaginationControls = () => {
    const maxPages = Math.min(5, totalPages)
    const startPage = Math.max(
      0,
      Math.min(currentPage - Math.floor(maxPages / 2), totalPages - maxPages)
    )
    const endPage = Math.min(totalPages, startPage + maxPages)
    const pages = Array.from(
      { length: endPage - startPage },
      (_, i) => startPage + i
    )

    return (
      <Pagination className="mt-4">
        <PaginationContent className="flex-wrap justify-center gap-2">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className={`${currentPage === 0 || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            />
          </PaginationItem>

          {startPage > 0 && (
            <>
              <PaginationItem className="hidden sm:block">
                <PaginationLink onClick={() => setCurrentPage(0)}>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem className="hidden sm:block">
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}

          {pages.map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              <PaginationItem className="hidden sm:block">
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem className="hidden sm:block">
                <PaginationLink onClick={() => setCurrentPage(totalPages - 1)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
              }
              className={`${currentPage === totalPages - 1 || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const handleUpdateUserRole = async () => {
    if (!userToUpdate || !newRole) return

    try {
      setIsUpdatingRole(true)
      const response = await fetch(`${baseURL}/users/role-sector`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userToUpdate.userId,
          role: newRole,
          sectorId: userToUpdate.sector.sectorId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw data
      }

      await fetchUsers()
      setIsRoleDialogOpen(false)
      setUserToUpdate(null)
      setNewRole('')
      toast({
        title: 'Sucesso',
        description: data.message || 'Cargo atualizado com sucesso!',
      })
    } catch (err) {
      console.error('Erro ao atualizar cargo:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao atualizar cargo.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${baseURL}/users?page=${currentPage}`, {
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
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Erro ao buscar usuários:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token, currentPage])

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
      setIsSubmitting(true)
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (!response.ok) {
        throw data
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
        title: 'Sucesso',
        description: data.message || 'Usuário adicionado com sucesso!',
      })
    } catch (err) {
      console.error('Erro ao criar usuário:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao tentar adicionar novo usuário.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
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

      const data = await response.json()

      if (!response.ok) {
        throw data
      }

      setUsers(users.filter(user => user.userId !== userId))
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      toast({
        title: 'Sucesso',
        description: data.message || 'Usuário deletado com sucesso!',
      })
    } catch (err) {
      console.error('Erro ao deletar usuário:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao deletar usuário.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchSectors()
  }, [fetchUsers, fetchSectors])

  return (
    <div className="min-h-screen w-full p-4 md:p-6 lg:p-8">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Gestão de Usuários
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center gap-2 rounded-2xl w-full sm:w-[130px]">
                  <PlusIcon className="size-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  <Button onClick={handleCreateUser} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Usuário'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              className="flex items-center justify-center gap-2 rounded-2xl w-full sm:w-[130px]"
              onClick={() => {
                navigate('/dashboard/reunioes/1')
              }}
            >
              <CalendarIcon className="size-4" />
              Reuniões
            </Button>
          </div>
        </div>
        <Button
          className="rounded-2xl w-full sm:w-[130px]"
          onClick={() => navigate('/dashboard/documentos/1')}
        >
          Documentos
        </Button>
      </div>

      <div className="w-full rounded-lg border">
        <ScrollArea className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Nome</TableHead>
                <TableHead className="min-w-[120px]">CPF</TableHead>
                <TableHead className="min-w-[200px]">E-mail</TableHead>
                <TableHead className="min-w-[120px]">Contato</TableHead>
                <TableHead className="min-w-[100px]">Cargo</TableHead>
                <TableHead className="min-w-[120px]">Setor</TableHead>
                <TableHead className="min-w-[100px] text-center" colSpan={2}>
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <Loader2Icon className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.telephone}</TableCell>
                    <TableCell>{formatRole(user.role)}</TableCell>
                    <TableCell>{user.sector.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          className="flex items-center justify-center gap-2 rounded-2xl"
                          variant="secondary"
                          onClick={() => {
                            setUserToUpdate(user)
                            setNewRole(user.role)
                            setIsRoleDialogOpen(true)
                          }}
                        >
                          <span className="hidden sm:inline">Cargo</span>
                        </Button>
                        <Button
                          className="flex items-center justify-center gap-2 rounded-2xl"
                          variant="destructive"
                          onClick={() => {
                            setUserToDelete(user)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <DeleteIcon className="size-4" />
                          <span className="hidden sm:inline">Deletar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <PaginationControls />

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Cargo</DialogTitle>
            <DialogDescription>
              Alterar cargo do usuário {userToUpdate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="role">Novo Cargo</Label>
              <Select
                value={newRole}
                onValueChange={(value: UserRole) => setNewRole(value)}
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
            <DialogFooter className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRoleDialogOpen(false)
                  setUserToUpdate(null)
                  setNewRole('')
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateUserRole}
                disabled={isUpdatingRole || !newRole}
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Confirmar alteração'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário {userToDelete?.name}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
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
