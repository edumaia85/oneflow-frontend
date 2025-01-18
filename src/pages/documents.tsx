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
import { Plus, PencilIcon, DeleteIcon } from 'lucide-react'
import { baseURL } from '@/utils/constants'
import { parseCookies } from 'nookies'
import { useToast } from '@/hooks/use-toast'

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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState<DocumentLink | null>(
    null
  )
  const [documentToDelete, setDocumentToDelete] = useState<DocumentLink | null>(
    null
  )
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData)

  const { 'oneflow.token': token } = parseCookies()
  const { toast } = useToast()

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${baseURL}/documents?page=0&sectorId=${sectorId}`,
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
  }, [])

  const handleCreateDocument = async () => {
    try {
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
    }
  }

  const handleUpdateDocument = async (documentLinkId: string) => {
    if (!documentToEdit) return

    try {
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
    }
  }

  const handleDeleteDocument = async (documentLinkId: string) => {
    try {
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
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="documentUrl">URL do documento</Label>
                  <Input
                    id="documentUrl"
                    name="documentUrl"
                    value={formData.documentUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <Button onClick={handleCreateDocument}>
                  Cadastrar documento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>URL do Documento</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map(doc => (
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
                />
              </div>
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setDocumentToEdit(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateDocument(documentToEdit.documentLinkId)
                  }
                >
                  Salvar alterações
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
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                documentToDelete &&
                handleDeleteDocument(documentToDelete.documentLinkId)
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
