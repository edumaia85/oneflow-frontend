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
import { DeleteIcon, PlusIcon, RefreshCcwIcon } from 'lucide-react'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'

enum ProjectStatus {
  FINALIZADO = 'FINALIZADO',
  EM_ANDAMENTO = 'EM ANDAMENTO',
  PENDENTE = 'PENDENTE',
  CANCELADO = 'CANCELADO',
}

interface Project {
  id: number
  name: string
  description: string
  price: number
  deadline: Date
  projectStatus: ProjectStatus
  customerId: number
  userIds: number[]
}

interface ProjectsResponse {
  content: Project[]
  totalPages: number
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { 'oneflow.token': token } = parseCookies()

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${baseURL}/projects`, {
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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {}, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-4">
          <h1 className="text-3xl font-semibold">Projetos</h1>
          <Button className="flex items-center justify-center gap-2 rounded-2xl w-[130px]">
            <PlusIcon className="size-2" />
            Adicionar
          </Button>
        </div>

        <Button className="rounded-2xl w-[130px]">Documentos</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Prazo final</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center" colSpan={2}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map(project => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.description}</TableCell>
              <TableCell>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(project.price)}
              </TableCell>
              <TableCell>
                {project.deadline.toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>{project.projectStatus}</TableCell>
              <TableCell>
                <Button className="flex items-center justify-center gap-2 rounded-2xl">
                  <RefreshCcwIcon />
                  Atualizar
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  className="flex items-center justify-center gap-2 rounded-2xl"
                  variant="destructive"
                  onClick={() => {}}
                >
                  <DeleteIcon />
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
