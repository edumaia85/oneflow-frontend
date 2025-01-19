import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { baseURL } from '@/utils/constants'
import { parseCookies } from 'nookies'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

interface Sector {
  sectorId: number
  name: string
}

interface UserResponse {
  user: {
    userId: number
    name: string
    cpf: string
    email: string
    telephone: string
    role: string
    imageUrl: string | null
    sector: Sector
  }
  token: string | null
}

interface UserData {
  name: string
  cpf: string
  email: string
  telephone: string
}

export function UpdateProfile() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { 'oneflow.token': token } = parseCookies()

  // Inicializa o formData com os dados do usuário atual
  const [formData, setFormData] = useState<UserData>({
    name: user?.name || '',
    cpf: user?.cpf || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('E-mail inválido')
      return false
    }

    // Validate CPF format (XXX.XXX.XXX-XX)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    if (!cpfRegex.test(formData.cpf)) {
      setError('CPF inválido (use o formato XXX.XXX.XXX-XX)')
      return false
    }

    // Validate phone format ((XX) XXXXX-XXXX)
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/
    if (!phoneRegex.test(formData.telephone)) {
      setError('Telefone inválido (use o formato (XX) XXXXX-XXXX)')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${baseURL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Falha ao atualizar dados')

      const responseData = await response.json()

      // Check if email was changed
      if (user?.email !== formData.email) {
        // If email changed, we expect a new token in the response
        if (responseData.token) {
          // Update user data and token in context/cookies
          updateUser(
            {
              ...user,
              ...formData,
            },
            responseData.token
          )
        } else {
          throw new Error('Token não recebido após mudança de email')
        }
      } else {
        // If email wasn't changed, just update user data
        updateUser({
          ...user,
          ...formData,
        })
      }

      toast({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso!',
      })

      navigate('/dashboard')
    } catch (err) {
      setError('Erro ao atualizar dados. Tente novamente.')
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar os dados',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-2xl font-bold">Atualizar Dados</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Nome completo
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-muted-foreground"
                  disabled={isLoading}
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="cpf">
                  CPF
                </label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full border border-muted-foreground"
                  disabled={isLoading}
                  placeholder="XXX.XXX.XXX-XX"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-muted-foreground"
                  disabled={isLoading}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="telephone">
                  Telefone
                </label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="text"
                  required
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full border border-muted-foreground"
                  disabled={isLoading}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
