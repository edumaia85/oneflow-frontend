import { useEffect, useState, useCallback } from 'react'
import {
  CalendarIcon,
  Plus,
  PencilIcon,
  DeleteIcon,
  Loader2Icon,
} from 'lucide-react'
import { baseURL } from '@/utils/constants'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { parseCookies } from 'nookies'
import { useToast } from '@/hooks/use-toast'
import { useParams } from 'react-router-dom'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Sector {
  sectorId: string
  name: string
}

interface Meeting {
  meetingId: string
  title: string
  description: string
  meetingDate: string
  meetingStatus: 'FINALIZADA' | 'PENDENTE' | 'CANCELADA'
  sector: Sector
  sectorId: string
}

interface MeetingsResponse {
  content: Meeting[]
  totalPages: number
}

interface Sector {
  id: string
  name: string
}

interface ApiErrorResponse {
  status: number
  message: string
  fieldsMessage?: string[]
}

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null)
  const [date, setDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { 'oneflow.token': token } = parseCookies()
  const { toast } = useToast()

  const { sectorId } = useParams()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    meetingStatus: 'PENDENTE' as Meeting['meetingStatus'],
  })

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      meetingDate: '',
      meetingStatus: 'PENDENTE',
    })
    setDate(undefined)
  }, [])

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

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${baseURL}/meetings?page=${currentPage}&sectorId=${sectorId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!response.ok) {
        throw new Error('Failed to fetch meetings')
      }
      const data: MeetingsResponse = await response.json()
      setMeetings(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setError('Failed to load meetings')
      setMeetings([])
    } finally {
      setIsLoading(false)
    }
  }, [token, sectorId, currentPage])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const method = editingMeeting ? 'PUT' : 'POST'
      const url = editingMeeting
        ? `${baseURL}/meetings/${editingMeeting.meetingId}`
        : `${baseURL}/meetings`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchMeetings()
        setIsDialogOpen(false)
        resetForm()
        setEditingMeeting(null)
        toast({
          title: 'sucesso!',
          description:
            data.message || 'A reunião foi criada/atualizada com sucesso.',
        })
      } else {
        throw data
      }
    } catch (err) {
      console.error('Erro ao adicionar/atualizar reunião:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao adicionar/atualizar reunião.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [editingMeeting, formData, token, fetchMeetings, resetForm, toast])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${baseURL}/meetings/${id}`, {
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
      const data = contentType?.includes('application/json') ? await response.json() : null
  
      await fetchMeetings()
      setIsDeleteDialogOpen(false)
      setMeetingToDelete(null)
      
      toast({
        title: 'Sucesso!',
        description: data?.message || 'Reunião deletada com sucesso.',
      })
  
    } catch (err) {
      console.error('Erro ao deletar reunião:', err)
      const error = err as ApiErrorResponse
      toast({
        title: 'Erro',
        description: error.fieldsMessage
          ? error.fieldsMessage.join(', ')
          : error.message || 'Erro ao deletar reunião.',
        variant: 'destructive',
      })
    }
  }, [token, fetchMeetings, toast])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-4">
          <h1 className="text-3xl font-semibold">Reuniões</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center justify-center gap-2 rounded-2xl w-[130px]"
                onClick={() => {
                  setEditingMeeting(null)
                  resetForm()
                }}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMeeting ? 'Editar Reunião' : 'Nova Reunião'}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label>Data da Reunião</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date
                          ? formatDate(date.toISOString())
                          : 'Selecione uma data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={newDate => {
                          setDate(newDate)
                          if (newDate) {
                            handleInputChange(
                              'meetingDate',
                              newDate.toISOString().split('T')[0]
                            )
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.meetingStatus}
                    onValueChange={value =>
                      handleInputChange('meetingStatus', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                      setEditingMeeting(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        {editingMeeting ? 'Salvando...' : 'Criando...'}
                      </>
                    ) : editingMeeting ? (
                      'Salvar alterações'
                    ) : (
                      'Criar Reunião'
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {meetings.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma reunião encontrada</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map(meeting => (
              <TableRow key={meeting.meetingId}>
                <TableCell>{meeting.title}</TableCell>
                <TableCell>{meeting.description}</TableCell>
                <TableCell>{formatDate(meeting.meetingDate)}</TableCell>
                <TableCell>{formatStatus(meeting.meetingStatus)}</TableCell>
                <TableCell>{meeting.sector.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      className="flex items-center justify-center gap-2 rounded-2xl"
                      onClick={() => {
                        setEditingMeeting(meeting)
                        setFormData({
                          title: meeting.title,
                          description: meeting.description,
                          meetingDate: meeting.meetingDate,
                          meetingStatus: meeting.meetingStatus,
                        })
                        setDate(new Date(meeting.meetingDate))
                        setIsDialogOpen(true)
                      }}
                      variant="outline"
                    >
                      <PencilIcon className="size-4" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setMeetingToDelete(meeting)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <DeleteIcon className="size-4" />
                      Deletar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a reunião {meetingToDelete?.title}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setMeetingToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                meetingToDelete && handleDelete(meetingToDelete.meetingId)
              }
            >
              Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaginationControls />
    </div>
  )
}
