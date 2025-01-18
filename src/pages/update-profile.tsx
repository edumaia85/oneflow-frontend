import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
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
  const [formData, setFormData] = useState<UserData>({
    name: '',
    cpf: '',
    email: '',
    telephone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { user, handleLogout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const { 'oneflow.token': token } = parseCookies()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${baseURL}/users/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error('Falha ao carregar dados do usuário')

        const userData: UserResponse = await response.json()

        // Formatando os dados recebidos
        setFormData({
          name: userData.user.name,
          cpf: formatCPF(userData.user.cpf),
          email: userData.user.email,
          telephone: formatTelephone(userData.user.telephone),
        })
      } catch (err) {
        setError('Erro ao carregar dados do usuário')
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os dados do usuário',
        })
      }
    }

    if (user?.id) {
      fetchUserData()
    }
  }, [user?.id, token, toast])

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4')
  }

  const formatTelephone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    let formattedValue = value

    if (name === 'cpf') {
      formattedValue = formatCPF(value)
    } else if (name === 'telephone') {
      formattedValue = formatTelephone(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue,
    }))

    setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return false
    }

    const cpfNumbers = formData.cpf.replace(/\D/g, '')
    if (cpfNumbers.length !== 11) {
      setError('CPF inválido')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('E-mail inválido')
      return false
    }

    const phoneNumbers = formData.telephone.replace(/\D/g, '')
    if (phoneNumbers.length !== 11) {
      setError('Telefone inválido')
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
        body: JSON.stringify({
          name: formData.name,
          cpf: formData.cpf.replace(/\D/g, ''),
          email: formData.email,
          telephone: formData.telephone.replace(/\D/g, ''),
        }),
      })

      if (!response.ok) throw new Error('Falha ao atualizar dados')

      toast({
        title: 'Sucesso',
        description:
          'Dados atualizados com sucesso! Você será redirecionado para fazer login novamente.',
      })

      // Espera um pouco para o usuário ver o toast
      setTimeout(() => {
        handleLogout()
        navigate('/')
      }, 2000)
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
                  maxLength={14}
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full border border-muted-foreground"
                  disabled={isLoading}
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
                  maxLength={15}
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full border border-muted-foreground"
                  disabled={isLoading}
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
