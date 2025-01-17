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
import { Presidency } from './pages/presidency'
import { Toaster } from './components/ui/toaster'
import { GeneralDocuments } from './pages/general-documents'
import { Customers } from './pages/customers'
import { Marketing } from './pages/marketing'
import { PeopleManagement } from './pages/people-management'
import { Financial } from './pages/financial'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Fragment>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DefaultLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projetos" element={<Projects />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="gestao-de-pessoas" element={<PeopleManagement />} />
          <Route path="financeiro" element={<Financial />} />
          <Route path="presidencia" element={<Presidency />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="clientes" element={<Customers />} />
          <Route path="documentos-gerais" element={<GeneralDocuments />} />
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
      <Toaster />
    </AuthProvider>
  )
}
