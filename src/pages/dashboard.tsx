export function Dashboard() {
  return (
    <div className="min-h-screen display flex justify-center py-[50px] gap-8">
      <div className="flex flex-col justify-between bg-primary text-white rounded-md w-[250px] h-[150px] p-3">
        <p className="text-xl font-medium">Membros</p>
        <p><span className="text-3xl font-medium">5</span> ativos</p>
      </div>
      <div className="flex flex-col justify-between bg-primary text-white rounded-md w-[250px] h-[150px] p-3">
        <p className="text-xl font-medium">Clientes</p>
        <p><span className="text-3xl font-medium">2</span> cliente(s)</p>
      </div>
      <div className="flex flex-col justify-between bg-primary text-white rounded-md w-[250px] h-[150px] p-3">
        <p className="text-xl font-medium">Projetos</p>
        <p><span className="text-3xl font-medium">3</span> projetos</p>
      </div>
    </div>
  )
}
