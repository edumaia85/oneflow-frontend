import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2Icon, Plus } from 'lucide-react'
import { baseURL } from '@/utils/constants'
import { parseCookies } from 'nookies'
import { useToast } from '@/hooks/use-toast'

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
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { 'oneflow.token': token } = parseCookies()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    return formData.name.trim() !== '' && formData.documentUrl.trim() !== ''
  }

  const handleCreateDocument = async () => {
    if (!validateForm()) {
      toast({
        title: 'Erro!',
        description: 'Por favor, preencha todos os campos antes de enviar.',
        variant: 'destructive',
      })
      return
    }

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
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
  )
}
