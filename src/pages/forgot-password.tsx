import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon, ArrowLeft } from 'lucide-react'
import { baseURL } from '@/utils/constants'

export function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${baseURL}/users/forgot-password?email=${encodeURIComponent(email)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Falha ao enviar o código')

      setStep(2)
    } catch (err) {
      setError('Erro ao enviar o código de recuperação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStep(3)
  }

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${baseURL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: resetCode,
          newPassword,
        }),
      })

      if (!response.ok) throw new Error('Falha ao resetar a senha')

      window.location.href = '/'
    } catch (err) {
      setError('Erro ao atualizar a senha. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    switch (id) {
      case 'email':
        setEmail(value)
        break
      case 'code':
        setResetCode(value)
        break
      case 'newPassword':
        setNewPassword(value)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={`mr-4 ${step === 1 ? 'invisible' : ''}`}
                disabled={step === 1}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold">
                {step === 1 && 'Recuperar Senha'}
                {step === 2 && 'Verificar Código'}
                {step === 3 && 'Nova Senha'}
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleInputChange}
                    className="w-full border border-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar código'}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="code">
                    Código de verificação
                  </label>
                  <Input
                    id="code"
                    type="text"
                    required
                    value={resetCode}
                    onChange={handleInputChange}
                    className="w-full border border-muted-foreground"
                    placeholder="Digite o código recebido por e-mail"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary"
                  disabled={isLoading}
                >
                  Verificar código
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="newPassword">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={handleInputChange}
                      className="w-full pr-10 border border-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-gray-500" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
