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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Fragment>
      <Route path="/dashboard" element={<DefaultLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='projetos' element={<Projects />} />
      </Route>
      
      <Route path="/" element={<Login />} />
    </Fragment>
  )
)

export function App() {
  return <RouterProvider router={router} />
}
