import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseCookies } from 'nookies'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { baseURL } from '@/utils/constants'

export function UpdatePassword() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const navigate = useNavigate()
  const { 'oneflow.token': token } = parseCookies()

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e a confirmação precisam ser iguais.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${baseURL}/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Senha atualizada!',
          description: 'Sua senha foi alterada com sucesso.',
        })

        navigate('/dashboard/perfil')
      } else {
        const error = await response.json()
        toast({
          title: 'Erro ao atualizar senha',
          description:
            error.message || 'Houve um problema ao tentar atualizar sua senha.',
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
    <div className="w-full max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Atualizar senha</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="oldPassword"
            className="block text-sm font-medium mb-1"
          >
            Senha atual
          </label>
          <Input
            id="oldPassword"
            name="oldPassword"
            type="password"
            required
            value={passwords.oldPassword}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium mb-1"
          >
            Nova senha
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            value={passwords.newPassword}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
          >
            Confirmar nova senha
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={passwords.confirmPassword}
            onChange={handleInputChange}
          />
        </div>

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !passwords.oldPassword ||
            !passwords.newPassword ||
            !passwords.confirmPassword
          }
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Atualizando...
            </div>
          ) : (
            'Atualizar Senha'
          )}
        </Button>
      </form>
    </div>
  )
}
