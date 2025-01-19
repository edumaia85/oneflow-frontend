import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, PencilIcon, DeleteIcon, Loader2Icon } from 'lucide-react'
import { baseURL } from '@/utils/constants'
import { parseCookies } from 'nookies'
import { useToast } from '@/hooks/use-toast'
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

interface DocumentLink {
  documentLinkId: string
  sectorId: string
  documentUrl: string
  name: string
}

interface DocumentsResponse {
  content: DocumentLink[]
  totalPages: number
}

interface DocumentFormData {
  name: string
  documentUrl: string
}

const initialFormData: DocumentFormData = {
  name: '',
  documentUrl: '',
}

export function Documents() {
  const { sectorId } = useParams()
  const [documents, setDocuments] = useState<DocumentLink[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState<DocumentLink | null>(null)
  const [documentToDelete, setDocumentToDelete] = useState<DocumentLink | null>(null)
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const { 'oneflow.token': token } = parseCookies()
  const { toast } = useToast()

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

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${baseURL}/documents?page=${currentPage}&sectorId=${sectorId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data: DocumentsResponse = await response.json()
      setDocuments(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: 'Erro ao buscar documentos!',
        description:
          'Houve um erro ao carregar os documentos. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [currentPage])

  const handleCreateDocument = async () => {
    try {
      setIsSubmitting(true)
      await fetch(`${baseURL}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          documentUrl: formData.documentUrl,
          sectorId,
        }),
      })
      setFormData(initialFormData)
      setIsDialogOpen(false)
      fetchDocuments()
      toast({
        title: 'Documento adicionado com sucesso!',
        description: 'O documento foi adicionado ao sistema.',
      })
    } catch (error) {
      console.error('Error creating document:', error)
      toast({
        title: 'Erro ao adicionar documento!',
        description: 'Houve um erro ao adicionar o documento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateDocument = async (documentLinkId: string) => {
    if (!documentToEdit) return

    try {
      setIsSubmitting(true)
      await fetch(`${baseURL}/documents/${documentLinkId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: documentToEdit.name,
          documentUrl: documentToEdit.documentUrl,
        }),
      })
      setDocumentToEdit(null)
      setIsEditDialogOpen(false)
      fetchDocuments()
      toast({
        title: 'Documento atualizado com sucesso!',
        description: 'As informações do documento foram atualizadas.',
      })
    } catch (error) {
      console.error('Error updating document:', error)
      toast({
        title: 'Erro ao atualizar documento!',
        description: 'Houve um erro ao atualizar o documento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDocument = async (documentLinkId: string) => {
    try {
      setIsSubmitting(true)
      await fetch(`${baseURL}/documents/${documentLinkId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      setDocuments(
        documents.filter(doc => doc.documentLinkId !== documentLinkId)
      )
      setIsDeleteDialogOpen(false)
      setDocumentToDelete(null)
      toast({
        title: 'Documento deletado com sucesso!',
        description: 'O documento foi removido da base de dados.',
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: 'Erro ao deletar documento!',
        description:
          'Houve um erro ao tentar deletar o documento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-4">
          <h1 className="text-3xl font-semibold">Documentos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center gap-2 rounded-2xl w-[130px]">
                <Plus className="size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar novo documento</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="name">Nome do documento</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="documentUrl">URL do documento</Label>
                  <Input
                    id="documentUrl"
                    name="documentUrl"
                    value={formData.documentUrl}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                <Button onClick={handleCreateDocument} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar documento'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>URL do Documento</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  <Loader2Icon className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Nenhum documento encontrado
                </TableCell>
              </TableRow>
            ) : (
              documents.map(doc => (
                <TableRow key={doc.documentLinkId}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>{doc.documentUrl}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        className="flex items-center justify-center gap-2 rounded-2xl"
                        onClick={() => {
                          setDocumentToEdit(doc)
                          setIsEditDialogOpen(true)
                        }}
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        <PencilIcon className="size-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDocumentToDelete(doc)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={isSubmitting}
                      >
                        <DeleteIcon className="size-4" />
                        Deletar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <PaginationControls />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar documento</DialogTitle>
          </DialogHeader>
          {documentToEdit && (
            <div className="flex flex-col gap-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-name">Nome do documento</Label>
                <Input
                  id="edit-name"
                  value={documentToEdit.name}
                  onChange={e =>
                    setDocumentToEdit({
                      ...documentToEdit,
                      name: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-url">URL do documento</Label>
                <Input
                  id="edit-url"
                  value={documentToEdit.documentUrl}
                  onChange={e =>
                    setDocumentToEdit({
                      ...documentToEdit,
                      documentUrl: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setDocumentToEdit(null)
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateDocument(documentToEdit.documentLinkId)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar alterações'
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
  
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o documento{' '}
                {documentToDelete?.name}? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDocumentToDelete(null)
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  documentToDelete &&
                  handleDeleteDocument(documentToDelete.documentLinkId)
                }
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
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
