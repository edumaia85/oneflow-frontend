import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { baseURL } from '@/utils/constants'
import { Loader2 } from 'lucide-react'
import { parseCookies } from 'nookies'
import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function UpdateProfileImage(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const { 'oneflow.token': token } = parseCookies()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione uma imagem para enviar.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${baseURL}/users/image`, {
        method: 'PATCH',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        updateUser(userData)

        toast({
          title: 'Foto de perfil atualizada!',
          description: 'Sua foto de perfil foi adicionada com sucesso.',
        })

        navigate('/dashboard/perfil')
      } else {
        toast({
          title: 'Erro ao atualizar foto de perfil',
          description:
            'Houve um problema ao tentar atualizar sua foto de perfil.',
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
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">
        Atualizar foto de perfil
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md mx-auto"
      >
        <Input
          type="file"
          accept="image/*"
          className="w-full file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm hover:file:bg-primary/20"
          onChange={handleFileChange}
        />
        <Button
          type="submit"
          className="w-full mt-2"
          disabled={isSubmitting || !file}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </div>
          ) : (
            'Enviar Imagem'
          )}
        </Button>
      </form>
    </div>
  )
}
