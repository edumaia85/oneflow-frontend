import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { baseURL } from '@/utils/constants'
import { DeleteIcon, Eye, PencilIcon, PlusIcon } from 'lucide-react'
import { parseCookies } from 'nookies'
import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

enum CustomerType {
  PF = 'PF',
  PJ = 'PJ',
}

interface Customer {
  customerId: number
  name: string
  email: string
  telephone: string
  type: CustomerType
  identificationNumber: string
  address: {
    addressId: number
    street: string
    neighborhood: string
    number: string
    city: string
    uf: string
  }
}

interface CustomersResponse {
  content: Customer[]
  totalPages: number
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<
    Customer['address'] | null
  >(null)
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  )

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    telephone: '',
    type: CustomerType.PF,
    identificationNumber: '',
    address: {
      street: '',
      neighborhood: '',
      number: '',
      city: '',
      uf: '',
    },
  })

  const { 'oneflow.token': token } = parseCookies()
  const { toast } = useToast()

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${baseURL}/customers?page=0`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao buscar clientes')
      }

      const data: CustomersResponse = await response.json()
      setCustomers(data.content)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const handleCreateCustomer = async () => {
    try {
      const response = await fetch(`${baseURL}/customers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar cliente')
      }

      await fetchCustomers()
      setIsDialogOpen(false)
      setNewCustomer({
        name: '',
        email: '',
        telephone: '',
        type: CustomerType.PF,
        identificationNumber: '',
        address: {
          street: '',
          neighborhood: '',
          number: '',
          city: '',
          uf: '',
        },
      })
      toast({
        title: 'Cliente adicionado com sucesso!',
        description: 'O cliente foi adicionado ao sistema com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao criar cliente:', err)
      toast({
        title: 'Erro ao adicionar cliente!',
        description:
          'Houve um erro ao adicionar cliente. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateCustomer = async () => {
    if (!customerToEdit) return

    try {
      const response = await fetch(
        `${baseURL}/customers/${customerToEdit.customerId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerToEdit),
        }
      )

      if (!response.ok) {
        throw new Error('Falha ao atualizar cliente')
      }

      await fetchCustomers()
      setIsEditDialogOpen(false)
      setCustomerToEdit(null)
      toast({
        title: 'Cliente atualizado com sucesso!',
        description: 'As informações do cliente foram atualizadas.',
      })
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err)
      toast({
        title: 'Erro ao atualizar cliente!',
        description: 'Houve um erro ao atualizar o cliente. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDeletecustomer = async (customerId: number) => {
    try {
      const response = await fetch(`${baseURL}/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao deletar cliente')
      }

      setCustomers(
        customers.filter(customer => customer.customerId !== customerId)
      )
      setIsDeleteDialogOpen(false)
      setCustomerToDelete(null)
      toast({
        title: 'Cliente deletado com sucesso!',
        description: 'O cliente foi removido da base de dados com sucesso.',
      })
    } catch (err) {
      console.error('Erro ao deletar usuário:', err)
      toast({
        title: 'Erro ao deletar cliente!',
        description:
          'Houve um erro ao tentar deletar o cliente. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-20 gap-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-4">
          <h1 className="text-3xl font-semibold">Clientes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center gap-2 rounded-2xl w-[130px]">
                <PlusIcon className="size-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar novo cliente</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={e =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={e =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="telephone">Contato</Label>
                  <Input
                    id="telephone"
                    value={newCustomer.telephone}
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        telephone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newCustomer.type}
                    onValueChange={(value: CustomerType) =>
                      setNewCustomer({ ...newCustomer, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CustomerType).map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="identificationNumber">
                    {newCustomer.type === CustomerType.PF ? 'CPF' : 'CNPJ'}
                  </Label>
                  <Input
                    id="identificationNumber"
                    value={newCustomer.identificationNumber}
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        identificationNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Endereço</h4>

                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={newCustomer.address.street}
                      onChange={e =>
                        setNewCustomer({
                          ...newCustomer,
                          address: {
                            ...newCustomer.address,
                            street: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={newCustomer.address.number}
                      onChange={e =>
                        setNewCustomer({
                          ...newCustomer,
                          address: {
                            ...newCustomer.address,
                            number: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={newCustomer.address.neighborhood}
                      onChange={e =>
                        setNewCustomer({
                          ...newCustomer,
                          address: {
                            ...newCustomer.address,
                            neighborhood: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={newCustomer.address.city}
                      onChange={e =>
                        setNewCustomer({
                          ...newCustomer,
                          address: {
                            ...newCustomer.address,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      maxLength={2}
                      value={newCustomer.address.uf}
                      onChange={e =>
                        setNewCustomer({
                          ...newCustomer,
                          address: {
                            ...newCustomer.address,
                            uf: e.target.value.toUpperCase(),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleCreateCustomer}>
                  Cadastrar cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map(customer => (
            <TableRow key={customer.customerId}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.telephone}</TableCell>
              <TableCell>{customer.type}</TableCell>
              <TableCell>{customer.identificationNumber}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedAddress(customer.address)
                    setIsAddressDialogOpen(true)
                  }}
                >
                  <Eye className="size-4" />
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    className="flex items-center justify-center gap-2 rounded-2xl"
                    onClick={() => {
                      setCustomerToEdit(customer)
                      setIsEditDialogOpen(true)
                    }}
                    variant="outline"
                  >
                    <PencilIcon className="size-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setCustomerToDelete(customer)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <DeleteIcon className="size-4" />
                    Deletar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Endereço</DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Rua</Label>
                  <p className="text-sm">{selectedAddress.street}</p>
                </div>
                <div>
                  <Label>Número</Label>
                  <p className="text-sm">{selectedAddress.number}</p>
                </div>
                <div>
                  <Label>Bairro</Label>
                  <p className="text-sm">{selectedAddress.neighborhood}</p>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <p className="text-sm">{selectedAddress.city}</p>
                </div>
                <div>
                  <Label>UF</Label>
                  <p className="text-sm">{selectedAddress.uf}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          {customerToEdit && (
            <div className="flex flex-col gap-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={customerToEdit.name}
                  onChange={e =>
                    setCustomerToEdit({
                      ...customerToEdit,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={customerToEdit.email}
                  onChange={e =>
                    setCustomerToEdit({
                      ...customerToEdit,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-telephone">Contato</Label>
                <Input
                  id="edit-telephone"
                  value={customerToEdit.telephone}
                  onChange={e =>
                    setCustomerToEdit({
                      ...customerToEdit,
                      telephone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select
                  value={customerToEdit.type}
                  onValueChange={(value: CustomerType) =>
                    setCustomerToEdit({
                      ...customerToEdit,
                      type: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CustomerType).map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-identificationNumber">
                  {customerToEdit.type === CustomerType.PF ? 'CPF' : 'CNPJ'}
                </Label>
                <Input
                  id="edit-identificationNumber"
                  value={customerToEdit.identificationNumber}
                  onChange={e =>
                    setCustomerToEdit({
                      ...customerToEdit,
                      identificationNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Endereço</h4>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="edit-street">Rua</Label>
                  <Input
                    id="edit-street"
                    value={customerToEdit.address.street}
                    onChange={e =>
                      setCustomerToEdit({
                        ...customerToEdit,
                        address: {
                          ...customerToEdit.address,
                          street: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="edit-number">Número</Label>
                  <Input
                    id="edit-number"
                    value={customerToEdit.address.number}
                    onChange={e =>
                      setCustomerToEdit({
                        ...customerToEdit,
                        address: {
                          ...customerToEdit.address,
                          number: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="edit-neighborhood">Bairro</Label>
                  <Input
                    id="edit-neighborhood"
                    value={customerToEdit.address.neighborhood}
                    onChange={e =>
                      setCustomerToEdit({
                        ...customerToEdit,
                        address: {
                          ...customerToEdit.address,
                          neighborhood: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={customerToEdit.address.city}
                    onChange={e =>
                      setCustomerToEdit({
                        ...customerToEdit,
                        address: {
                          ...customerToEdit.address,
                          city: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="edit-uf">UF</Label>
                  <Input
                    id="edit-uf"
                    maxLength={2}
                    value={customerToEdit.address.uf}
                    onChange={e =>
                      setCustomerToEdit({
                        ...customerToEdit,
                        address: {
                          ...customerToEdit.address,
                          uf: e.target.value.toUpperCase(),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setCustomerToEdit(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateCustomer}>
                  Salvar alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário {customerToDelete?.name}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCustomerToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                customerToDelete &&
                handleDeletecustomer(customerToDelete.customerId)
              }
            >
              Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
