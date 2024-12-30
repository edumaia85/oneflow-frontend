import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteIcon, PlusIcon, RefreshCcwIcon } from 'lucide-react'

export function Projects() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-4">
          <h1 className="text-3xl font-semibold">Projetos</h1>
          <Button className="flex items-center justify-center gap-2 rounded-2xl w-[130px]">
            <PlusIcon className="size-2" />
            Adicionar
          </Button>
        </div>

        <Button className="rounded-2xl w-[130px]">Documentos</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center" colSpan={2}>
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Finanças Web</TableCell>
            <TableCell>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            </TableCell>
            <TableCell>R$ 2000,00</TableCell>
            <TableCell>Finalizado</TableCell>
            <TableCell>
              <Button className="flex items-center justify-center gap-2 rounded-2xl">
                <RefreshCcwIcon />
                Atualizar
              </Button>
            </TableCell>
            <TableCell>
              <Button
                className="flex items-center justify-center gap-2 rounded-2xl"
                variant="destructive"
              >
                <DeleteIcon />
                Deletar
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Finanças Web</TableCell>
            <TableCell>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            </TableCell>
            <TableCell>R$ 2000,00</TableCell>
            <TableCell>Finalizado</TableCell>
            <TableCell>
              <Button className="flex items-center justify-center gap-2 rounded-2xl">
                <RefreshCcwIcon />
                Atualizar
              </Button>
            </TableCell>
            <TableCell>
              <Button
                className="flex items-center justify-center gap-2 rounded-2xl"
                variant="destructive"
              >
                <DeleteIcon />
                Deletar
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
