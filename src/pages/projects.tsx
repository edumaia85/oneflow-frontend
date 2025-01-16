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
import { DeleteIcon, PlusIcon } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

enum ProjectStatus {
  FINALIZADO = 'FINALIZADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  PENDENTE = 'PENDENTE',
  CANCELADO = 'CANCELADO',
}

interface User {
  userId: number
  name: string
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

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
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

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${baseURL}/projects?page=0&sectorId=5`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao buscar projetos')
      }

      const data: ProjectsResponse = await response.json()
      setProjects(data.content)
    } catch (err) {
      console.error('Erro ao buscar projetos:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const fetchUsers = useCallback(async () => {
    try {
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
    }
  }, [token])

  const fetchCustomers = useCallback(async () => {
    try {
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

      if (!response.ok) {
        throw new Error('Falha ao criar projeto')
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
        title: 'Projeto adicionado com sucesso!',
        description: 'O projeto foi criado com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao criar projeto:', err)
      toast({
        title: 'Erro ao adicionar projeto!',
        description:
          'Houve um erro ao tentar criar o projeto. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    try {
      const response = await fetch(`${baseURL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao deletar projeto')
      }

      setProjects(projects.filter(project => project.projectId !== projectId))
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
      toast({
        title: 'Projeto deletado com sucesso!',
        description: 'O projeto foi removido com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao deletar projeto:', err)
      toast({
        title: 'Erro ao deletar projeto!',
        description: 'Houve um erro ao remover o projeto.',
        variant: 'destructive',
      })
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
          <h1 className="text-3xl font-semibold">Projetos</h1>
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
                    onChange={e =>
                      setNewProject({ ...newProject, deadline: e.target.value })
                    }
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
                <Button onClick={handleCreateProject}>Criar Projeto</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Button className="rounded-2xl w-[130px]">
          <NavLink to="/dashboard/documentos">Documentos</NavLink>
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
              <TableCell>
                <Button
                  className="flex items-center justify-center gap-2 rounded-2xl"
                  variant="destructive"
                  onClick={() => {
                    setProjectToDelete(project)
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
            >
              Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
