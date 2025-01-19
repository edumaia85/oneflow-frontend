import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { parseCookies } from 'nookies'

interface DashboardData {
  userQuantity: number
  projectQuantity: number
  customerQuantity: number
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { 'oneflow.token': token } = parseCookies()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('https://oneflow-api.onrender.com/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Falha ao buscar dados')
        }

        const result: DashboardData = await response.json()
        setData(result)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="mr-2 size-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-center text-xl">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen display flex flex-col py-[50px] gap-8">
      <h1 className="text-3xl font-semibold ml-20">Dashboard</h1>
      <div className="w-full flex justify-center gap-8">
        <div className="flex flex-col justify-between bg-primary text-white rounded-md w-[250px] h-[150px] p-3">
          <p className="text-xl font-medium">Membros</p>
          <p>
            <span className="text-3xl font-medium">{data.userQuantity}</span>{' '}
            ativos
          </p>
        </div>
        <div className="flex flex-col justify-between bg-primary text-white rounded-md w-[250px] h-[150px] p-3">
          <p className="text-xl font-medium">Clientes</p>
          <p>
            <span className="text-3xl font-medium">
              {data.customerQuantity}
            </span>{' '}
            cliente(s)
          </p>
        </div>
        <div className="flex flex-col justify-between bg-primary text-white rounded-md w-[250px] h-[150px] p-3">
          <p className="text-xl font-medium">Projetos</p>
          <p>
            <span className="text-3xl font-medium">{data.projectQuantity}</span>{' '}
            projetos
          </p>
        </div>
      </div>
    </div>
  )
}
