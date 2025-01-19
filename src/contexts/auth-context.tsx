import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { baseURL } from '@/utils/constants'

interface UserProps {
  id: string
  name: string
  lastName: string
  email: string
  cpf: string
  telephone: string
  role: 'PRESIDENTE' | 'DIRETOR' | 'MEMBRO'
  imageUrl: string
  sector: {
    sectorId: number
  }
}

interface AuthContextProps {
  user: UserProps | null
  handleLogin: (email: string, password: string) => Promise<void>
  handleLogout: () => void
  updateUser: (userData: Partial<UserProps>, newToken?: string) => void
}

interface AuthContextProviderProps {
  children: ReactNode
}

export async function login(email: string, password: string) {
  const response = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error('E-mail ou senha inválidos!')
  }

  const data = await response.json()
  return data
}

const AuthContext = createContext({} as AuthContextProps)

export const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<UserProps | null>(null)

  useEffect(() => {
    const { 'oneflow.token': token, 'oneflow.user': storedUser } =
      parseCookies()

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch {
        destroyCookie(null, 'oneflow.user', { path: '/' })
        destroyCookie(null, 'oneflow.token', { path: '/' })
      }
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const { token, user } = await login(email, password)

    setCookie(null, 'oneflow.token', token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    setCookie(null, 'oneflow.user', JSON.stringify(user), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    setUser(user)
  }

  const handleLogout = () => {
    destroyCookie(null, 'oneflow.token', { path: '/' })
    destroyCookie(null, 'oneflow.user', { path: '/' })
    setUser(null)
  }

  const updateUser = (userData: Partial<UserProps>, newToken?: string) => {
    if (user) {
      const updatedUser = { ...user, ...userData }

      // Update user cookie
      setCookie(null, 'oneflow.user', JSON.stringify(updatedUser), {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })

      // Update token if provided (email change case)
      if (newToken) {
        setCookie(null, 'oneflow.token', newToken, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        })
      }

      setUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, handleLogin, handleLogout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
