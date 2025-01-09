import {
  createBrowserRouter,
  // createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import { Login } from './pages/login'
import { DefaultLayout } from './layouts/default-layout'
import { Dashboard } from './pages/dashboard'
import { Projects } from './pages/projects'
import { AuthProvider } from './contexts/auth-context'
import { ProtectedRoute } from './components/protected-route'
import { Profile } from './pages/profile'
import { UpdateProfileImage } from './pages/update-profile-image'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Fragment>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DefaultLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projetos" element={<Projects />} />
          <Route path="perfil" element={<Profile />} />
          <Route
            path="perfil/atualizar-imagem"
            element={<UpdateProfileImage />}
          />
        </Route>
      </Route>

      <Route path="/" element={<Login />} />
    </Fragment>
  )
)

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
