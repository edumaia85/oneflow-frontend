import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import { Login } from './pages/login'

const router = createHashRouter(
  createRoutesFromElements(
    <Fragment>
      <Route path="/" element={<Login />} />
    </Fragment>
  )
)

export function App() {
  return <RouterProvider router={router} />
}
