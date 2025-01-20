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
import {
  CalendarIcon,
  DeleteIcon,
  Eye,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
} from 'lucide-react'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

enum ProjectStatus {
  FINALIZADO = 'FINALIZADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  PENDENTE = 'PENDENTE',
  CANCELADO = 'CANCELADO',
}

enum UserRole {
  MEMBRO = 'MEMBRO',
  DIRETOR = 'DIRETOR',
  PRESIDENTE = 'PRESIDENTE',
}

interface User {
  userId: number
  name: string
  role: UserRole
  imageUrl: string
}

interface Customer {
  customerId: number
  name: string
}

interface Project {
  projectId: number
  name: string
  description: string
  price: number
  deadline: Date
  projectStatus: ProjectStatus
  customerId: number
  customer: Customer
  users: User[]
  userIds: number[]
}

interface ProjectsResponse {
  content: Project[]
  totalPages: number
}

interface UsersResponse {
  content: User[]
  totalPages: number
}

interface CustomersResponse {
  content: Customer[]
  totalPages: number
}

interface ApiErrorResponse {
  status: number
  message: string
  fieldsMessage?: string[]
}

export function Financial() {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [projectToUpdate, setProjectToUpdate] = useState<Project | null>(null)
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [selectedProjectUsers, setSelectedProjectUsers] = useState<User[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    price: 0,
    deadline: '',
    projectStatus: ProjectStatus.PENDENTE,
    customerId: 0,
    userIds: [] as number[],
  })

  const { 'oneflow.token': token } = parseCookies()
  const { toast } = useToast()
  const navigate = useNavigate()

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
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
              className={`${currentPage === 0 || isSubmitting ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
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
              className={`${currentPage === totalPages - 1 || isSubmitting ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const fetchProjects = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `${baseURL}/projects?page=${currentPage}&sectorId=2`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Falha ao buscar projetos')
      }

      const data: ProjectsResponse = await response.json()
      setProjects(data.content)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Erro ao buscar projetos:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [token, currentPage])

  const fetchUsers = useCallback(async () => {
    try {
      setIsSubmitting(true)
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
      setIsSubmitting(false)
    }
  }, [token])

  const fetchCustomers = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`${baseURL}/customers?page=0`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao buscar clientes')
      }

      const data: CustomersResponse = await response.json()
      setCustomers(data.content)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [token])

  const handleUserSelection = (userId: number) => {
    setSelectedUsers(prev => {
      const isSelected = prev.includes(userId)
      if (isSelected) {
        return prev.filter(id => id !== userId)
      }
      return [...prev, userId]
    })
  }

  const handleCustomerSelection = (customerId: number) => {
    setNewProject(prev => ({
      ...prev,
      customerId,
    }))
  }

  const handleCreateProject = async () => {
    try {
      const projectData = {
        ...newProject,
        userIds: selectedUsers,
      }

      const response = await fetch(`${baseURL}/projects`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw data
      }

      await fetchProjects()
      setIsDialogOpen(false)
      setNewProject({
        name: '',
        description: '',
        price: 0,
        deadline: '',
        projectStatus: ProjectStatus.PENDENTE,
        customerId: 0,
        userIds: [],
      })
      setSelectedUsers([])
      toast({
        title: 'Sucesso!',
        description: data.message || 'Pprojeto criado com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao criar projeto:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao adicionar novo projeto.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateClick = (project: Project) => {
    setProjectToUpdate(project)
    setSelectedUsers(project.users.map(user => user.userId))
    setIsEditDialogOpen(true)
  }

  const handleUpdateProject = async () => {
    if (!projectToUpdate) {
      return
    }

    const projectData = {
      name: projectToUpdate.name,
      description: projectToUpdate.description,
      price: projectToUpdate.price,
      deadline: projectToUpdate.deadline,
      projectStatus: projectToUpdate.projectStatus,
      customerId: projectToUpdate.customerId,
      userIds: selectedUsers,
    }

    try {
      const response = await fetch(
        `${baseURL}/projects/${projectToUpdate?.projectId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw data
      }

      await fetchProjects()
      setIsEditDialogOpen(false)
      setProjectToUpdate(null)
      setSelectedUsers([])
      toast({
        title: 'Sucesso!',
        description: data.message || 'As alterações foram salvas com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao atualizar projeto.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`${baseURL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw errorData
        } catch {
          throw new Error(response.statusText)
        }
      }

      const contentType = response.headers.get('content-type')
      const data = contentType?.includes('application/json')
        ? await response.json()
        : null

      setProjects(prevProjects =>
        prevProjects.filter(project => project.projectId !== projectId)
      )
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)

      toast({
        title: 'Sucesso',
        description: data?.message || 'Projeto deletado com sucesso!',
      })
    } catch (err) {
      console.error('Erro ao deletar projeto:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao deletar projeto.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchUsers()
    fetchCustomers()
  }, [fetchProjects, fetchUsers, fetchCustomers])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-4">
          <h1 className="text-3xl font-semibold">Administrativo/Financeiro</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center gap-2 rounded-2xl w-[130px]">
                <PlusIcon className="size-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Projeto</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={e =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newProject.description}
                    onChange={e =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProject.price}
                    onChange={e =>
                      setNewProject({
                        ...newProject,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="deadline">Prazo final</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newProject.deadline}
                    onChange={e => {
                      const date = new Date(e.target.value)
                      const timezoneOffset = date.getTimezoneOffset() * 60000
                      const adjustedDate = new Date(
                        date.getTime() + timezoneOffset
                      )
                      setNewProject({
                        ...newProject,
                        deadline: adjustedDate.toISOString().split('T')[0],
                      })
                    }}
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProject.projectStatus}
                    onValueChange={(value: ProjectStatus) =>
                      setNewProject({ ...newProject, projectStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ProjectStatus).map(status => (
                        <SelectItem key={status} value={status}>
                          {formatStatus(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label>Selecione o cliente</Label>
                  <RadioGroup
                    className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto"
                    value={String(newProject.customerId)}
                    onValueChange={value =>
                      handleCustomerSelection(Number(value))
                    }
                  >
                    {customers.map(customer => (
                      <div
                        key={customer.customerId}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={String(customer.customerId)}
                          id={`customer-${customer.customerId}`}
                        />
                        <Label
                          htmlFor={`customer-${customer.customerId}`}
                          className="cursor-pointer"
                        >
                          {customer.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label>Selecione os usuários</Label>
                  <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                    {users.map(user => (
                      <div
                        key={user.userId}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`user-${user.userId}`}
                          checked={selectedUsers.includes(user.userId)}
                          onCheckedChange={() =>
                            handleUserSelection(user.userId)
                          }
                        />
                        <Label
                          htmlFor={`user-${user.userId}`}
                          className="cursor-pointer"
                        >
                          {user.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateProject} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar projeto'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className="flex items-center justify-center gap-2 rounded-2xl w-[130px]"
            onClick={() => {
              navigate('/dashboard/reunioes/2')
            }}
          >
            <CalendarIcon className="size-2" />
            Reuniões
          </Button>
        </div>
        <Button
          className="rounded-2xl w-[130px]"
          onClick={() => {
            navigate('/dashboard/documentos/2')
          }}
        >
          Documentos
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Prazo final</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Usuários</TableHead>
            <TableHead className="text-center" colSpan={2}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map(project => (
            <TableRow key={project.projectId}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.description}</TableCell>
              <TableCell>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(project.price)}
              </TableCell>
              <TableCell>
                {new Date(project.deadline).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>{formatStatus(project.projectStatus)}</TableCell>
              <TableCell>{project.customer.name}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedProjectUsers(project.users)
                    setIsUsersDialogOpen(true)
                  }}
                >
                  <Eye className="size-4" />
                </Button>
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  className="flex items-center justify-center gap-2 rounded-2xl"
                  variant="outline"
                  onClick={() => handleUpdateClick(project)}
                >
                  <PencilIcon className="size-4" />
                  Editar
                </Button>
                <Button
                  className="flex items-center justify-center gap-2 rounded-2xl"
                  variant="destructive"
                  onClick={() => {
                    setProjectToDelete(project)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <DeleteIcon className="size-4" />
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationControls />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          {projectToUpdate && (
            <div className="flex flex-col gap-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={projectToUpdate.name}
                  onChange={e =>
                    setProjectToUpdate({
                      ...projectToUpdate,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={projectToUpdate.description}
                  onChange={e =>
                    setProjectToUpdate({
                      ...projectToUpdate,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-price">Preço</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={projectToUpdate.price}
                  onChange={e =>
                    setProjectToUpdate({
                      ...projectToUpdate,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-deadline">Prazo final</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={
                    new Date(projectToUpdate.deadline)
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={e => {
                    const date = new Date(e.target.value)
                    const timezoneOffset = date.getTimezoneOffset() * 60000
                    const adjustedDate = new Date(
                      date.getTime() + timezoneOffset
                    )
                    setProjectToUpdate({
                      ...projectToUpdate,
                      deadline: adjustedDate,
                    })
                  }}
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={projectToUpdate.projectStatus}
                  onValueChange={(value: ProjectStatus) =>
                    setProjectToUpdate({
                      ...projectToUpdate,
                      projectStatus: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProjectStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full items-center gap-2">
                <Label>Selecione o cliente</Label>
                <RadioGroup
                  className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto"
                  value={String(projectToUpdate.customerId)}
                  onValueChange={value =>
                    setProjectToUpdate({
                      ...projectToUpdate,
                      customerId: Number(value),
                    })
                  }
                >
                  {customers.map(customer => (
                    <div
                      key={customer.customerId}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={String(customer.customerId)}
                        id={`edit-customer-${customer.customerId}`}
                        checked={
                          customer.customerId === projectToUpdate.customerId
                        }
                      />
                      <Label
                        htmlFor={`edit-customer-${customer.customerId}`}
                        className="cursor-pointer"
                      >
                        {customer.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="grid w-full items-center gap-2">
                <Label>Selecione os usuários</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                  {users.map(user => (
                    <div
                      key={user.userId}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-user-${user.userId}`}
                        checked={selectedUsers.includes(user.userId)}
                        onCheckedChange={() => handleUserSelection(user.userId)}
                      />
                      <Label
                        htmlFor={`edit-user-${user.userId}`}
                        className="cursor-pointer"
                      >
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProject}>Salvar Alterações</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuários do Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProjectUsers.map(user => (
              <div
                key={user.userId}
                className="flex items-center gap-4 p-2 border rounded-lg"
              >
                {user.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatStatus(user.role)}
                  </p>
                </div>
              </div>
            ))}
            {selectedProjectUsers.length === 0 && (
              <p className="text-center text-gray-500">
                Nenhum usuário atribuído a este projeto
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o projeto {projectToDelete?.name}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setProjectToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                projectToDelete &&
                handleDeleteProject(projectToDelete.projectId)
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Excluindo...
                </div>
              ) : (
                'Confirmar exclusão'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
