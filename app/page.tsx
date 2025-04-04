"use client"

import { useState, useEffect, useCallback } from "react"
import { PlusCircle, RefreshCw, Calculator, Copy, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExportButton } from "@/components/export-button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ShareButton } from "@/components/share-button"
import { Switch } from "@/components/ui/switch"

interface Person {
  id: string
  name: string
  expenses: Expense[]
}

interface Expense {
  id: string
  description: string
  amount: number
}

interface Settlement {
  from: string
  to: string
  amount: number
}

export default function CalculatorApp() {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null)
  const [savedData, setSavedData] = useLocalStorage<{
    groupExpenses?: Person[]
    desayunito?: any
  }>("expense-calculator-data", {})

  // Modificar las funciones de guardado para evitar actualizaciones innecesarias

  // Reemplazar las funciones onSave inline con versiones useCallback
  const saveGroupExpenses = useCallback(
    (data: Person[]) => {
      // Solo actualizar si los datos han cambiado realmente
      setSavedData((prev) => {
        // Comparación simple para evitar actualizaciones innecesarias
        if (JSON.stringify(prev.groupExpenses) === JSON.stringify(data)) {
          return prev
        }
        return { ...prev, groupExpenses: data }
      })
    },
    [setSavedData],
  )

  const saveDesayunito = useCallback(
    (data: any) => {
      // Solo actualizar si los datos han cambiado realmente
      setSavedData((prev) => {
        // Comparación simple para evitar actualizaciones innecesarias
        if (JSON.stringify(prev.desayunito) === JSON.stringify(data)) {
          return prev
        }
        return { ...prev, desayunito: data }
      })
    },
    [setSavedData],
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <span>✨</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              Calculadoras de Gastos
            </span>
            <span>✨</span>
          </h1>
        </div>

        {!activeCalculator ? (
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <Card className="w-full shadow-md hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Selecciona una calculadora</CardTitle>
                <CardDescription>Elige la calculadora que necesitas usar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full h-20 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => {
                    setActiveCalculator("gastos-grupales")
                    toast({
                      title: "Calculadora de Gastos Grupales",
                      description: "Ahora puedes dividir gastos entre amigos fácilmente",
                    })
                  }}
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  <span>🧮</span> Calculadora de Gastos Grupales
                </Button>

                <Button
                  className="w-full h-20 text-lg border-2 border-purple-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  variant="outline"
                  onClick={() => {
                    setActiveCalculator("desayunito")
                    toast({
                      title: "Calculadora Desayunito",
                      description: "Divide fácilmente los gastos de tu desayuno grupal",
                    })
                  }}
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  <span>☕</span> Calculadora Desayunito
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setActiveCalculator(null)}
              className="mb-4 border-purple-200 dark:border-slate-700 hover:bg-purple-100 dark:hover:bg-slate-800"
            >
              ← Volver a selección de calculadoras
            </Button>

            {activeCalculator === "gastos-grupales" ? (
              <ExpenseSplitter savedData={savedData.groupExpenses} onSave={saveGroupExpenses} />
            ) : (
              <DesayunitoCalculator savedData={savedData.desayunito} onSave={saveDesayunito} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Modificar la función ExpenseSplitter para mejorar la gestión de tooltips
function ExpenseSplitter({ savedData, onSave }: { savedData?: Person[]; onSave: (data: Person[]) => void }) {
  // Usar un objeto para controlar el estado de los tooltips
  const [tooltipStates, setTooltipStates] = useState<Record<string, boolean>>({})

  // Función para actualizar el estado de un tooltip específico
  const updateTooltipState = useCallback((id: string, isOpen: boolean) => {
    setTooltipStates((prev) => {
      // Si el estado no ha cambiado, no actualizar
      if (prev[id] === isOpen) return prev
      return { ...prev, [id]: isOpen }
    })
  }, [])

  const [people, setPeople] = useState<Person[]>(savedData || [])

  const [newPersonName, setNewPersonName] = useState("")
  const [newExpenseDescription, setNewExpenseDescription] = useState("")
  const [newExpenseAmount, setNewExpenseAmount] = useState("")
  const [groupDiscount, setGroupDiscount] = useState(0)

  // Save data when it changes
  useEffect(() => {
    // Usar un temporizador para evitar actualizaciones excesivas
    const timer = setTimeout(() => {
      // Solo guardar si hay cambios reales
      if (savedData !== people) {
        onSave(people)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [people, onSave, savedData])

  const addPerson = () => {
    if (!newPersonName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para la persona",
        variant: "destructive",
      })
      return
    }

    const newExpense = newExpenseDescription.trim()
      ? [
          {
            id: Date.now().toString(),
            description: newExpenseDescription,
            amount: Number.parseFloat(newExpenseAmount) || 0,
          },
        ]
      : []

    setPeople([
      ...people,
      {
        id: Date.now().toString(),
        name: newPersonName,
        expenses: newExpense,
      },
    ])
    setNewPersonName("")
    setNewExpenseDescription("")
    setNewExpenseAmount("")

    toast({
      title: "Persona agregada",
      description: `${newPersonName} ha sido agregado correctamente`,
    })
  }

  const removePerson = (personId: string) => {
    const personToRemove = people.find((p) => p.id === personId)
    setPeople(people.filter((person) => person.id !== personId))

    if (personToRemove) {
      toast({
        title: "Persona eliminada",
        description: `${personToRemove.name} ha sido eliminado`,
      })
    }
  }

  const addExpense = (personId: string) => {
    setPeople(
      people.map((person) => {
        if (person.id === personId) {
          return {
            ...person,
            expenses: [
              ...person.expenses,
              {
                id: Date.now().toString(),
                description: "",
                amount: 0,
              },
            ],
          }
        }
        return person
      }),
    )
  }

  const updateExpense = (personId: string, expenseId: string, field: keyof Expense, value: string) => {
    setPeople(
      people.map((person) => {
        if (person.id === personId) {
          return {
            ...person,
            expenses: person.expenses.map((expense) => {
              if (expense.id === expenseId) {
                if (field === "amount") {
                  return { ...expense, [field]: Number.parseFloat(value) || 0 }
                }
                return { ...expense, [field]: value }
              }
              return expense
            }),
          }
        }
        return person
      }),
    )
  }

  const removeExpense = (personId: string, expenseId: string) => {
    setPeople(
      people.map((person) => {
        if (person.id === personId) {
          return {
            ...person,
            expenses: person.expenses.filter((expense) => expense.id !== expenseId),
          }
        }
        return person
      }),
    )
  }

  const calculateTotalExpense = (person: Person): number => {
    return person.expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const calculateTotalGroupExpense = (): number => {
    return people.reduce((total, person) => total + calculateTotalExpense(person), 0)
  }

  const calculateSettlements = (): Settlement[] => {
    const totalExpense = calculateTotalGroupExpense() - groupDiscount
    const perPersonShare = people.length > 0 ? totalExpense / people.length : 0

    const balances = people.map((person) => ({
      id: person.id,
      name: person.name,
      balance: calculateTotalExpense(person) - perPersonShare,
    }))

    const settlements: Settlement[] = []

    // Sort by balance (descending)
    balances.sort((a, b) => b.balance - a.balance)

    let i = 0
    let j = balances.length - 1

    while (i < j) {
      const creditor = balances[i]
      const debtor = balances[j]

      const amount = Math.min(creditor.balance, -debtor.balance)

      if (amount > 0) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount,
        })
      }

      creditor.balance -= amount
      debtor.balance += amount

      if (Math.abs(creditor.balance) < 0.01) i++
      if (Math.abs(debtor.balance) < 0.01) j--
    }

    return settlements
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalGroupExpense = calculateTotalGroupExpense()
  const totalAfterDiscount = totalGroupExpense - groupDiscount
  const perPersonShare = people.length > 0 ? totalAfterDiscount / people.length : 0

  const settlements = calculateSettlements()

  const duplicatePerson = (personId: string) => {
    const personToDuplicate = people.find((person) => person.id === personId)
    if (!personToDuplicate) return

    const newPerson = {
      id: Date.now().toString(),
      name: `${personToDuplicate.name} (copia)`,
      expenses: personToDuplicate.expenses.map((expense) => ({
        id: Date.now().toString() + Math.random().toString(),
        description: expense.description,
        amount: expense.amount,
      })),
    }

    setPeople([...people, newPerson])

    toast({
      title: "Persona duplicada",
      description: `Se ha creado una copia de ${personToDuplicate.name}`,
    })
  }

  const resetAll = () => {
    if (people.length === 0) return

    if (confirm("¿Estás seguro de que quieres reiniciar todos los datos?")) {
      setPeople([])
      setGroupDiscount(0)

      toast({
        title: "Datos reiniciados",
        description: "Se han eliminado todos los datos",
      })
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2 mb-4">
          <span>🧮</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
            Calculadora de Gastos Grupales
          </span>
        </h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip open={tooltipStates["reset"]} onOpenChange={(open) => updateTooltipState("reset", open)}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full" onClick={resetAll}>
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Reiniciar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reiniciar calculadora</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ShareButton data={people} type="gastos-grupales" />

          <ExportButton
            data={{
              people,
              groupDiscount,
              totalGroupExpense,
              totalAfterDiscount,
              perPersonShare,
              settlements,
            }}
            filename="gastos-grupales"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>👥 Personas y Gastos</CardTitle>
              <CardDescription>Agrega personas y sus gastos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="personName">👤 Nombre de la persona</Label>
                  <Input
                    id="personName"
                    placeholder="Nombre de la persona"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expenseDescription">📝 Descripción del gasto (opcional)</Label>
                  <Input
                    id="expenseDescription"
                    placeholder="Descripción"
                    value={newExpenseDescription}
                    onChange={(e) => setNewExpenseDescription(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expenseAmount">💰 Monto del gasto</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    placeholder="Monto"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                  onClick={addPerson}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Agregar Persona
                </Button>
              </div>

              {people.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay personas agregadas.</p>
                  <p className="text-sm mt-2">Agrega personas y sus gastos para comenzar.</p>
                </div>
              ) : (
                people.map((person, index) => {
                  const personId = person.id
                  return (
                    <Card
                      key={person.id}
                      className="border border-purple-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <div className="flex-1 mr-2">
                          <Input
                            value={person.name}
                            onChange={(e) => {
                              setPeople(
                                people.map((p) => {
                                  if (p.id === person.id) {
                                    return { ...p, name: e.target.value }
                                  }
                                  return p
                                }),
                              )
                            }}
                            className="font-medium text-lg transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                          />
                        </div>
                        <div className="flex space-x-1">
                          <TooltipProvider>
                            <Tooltip
                              open={tooltipStates[`duplicate-person-${personId}`]}
                              onOpenChange={(open) => updateTooltipState(`duplicate-person-${personId}`, open)}
                            >
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => duplicatePerson(person.id)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Duplicar persona</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip
                              open={tooltipStates[`remove-person-${personId}`]}
                              onOpenChange={(open) => updateTooltipState(`remove-person-${personId}`, open)}
                            >
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => removePerson(person.id)}>
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Eliminar persona</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-4">
                        {person.expenses.map((expense) => (
                          <div key={expense.id} className="grid grid-cols-[1fr,auto,auto] gap-2 items-center">
                            <Input
                              placeholder="Descripción"
                              value={expense.description}
                              onChange={(e) => updateExpense(person.id, expense.id, "description", e.target.value)}
                              className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                            />
                            <Input
                              type="number"
                              placeholder="Monto"
                              className="w-28 transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                              value={expense.amount || ""}
                              onChange={(e) => updateExpense(person.id, expense.id, "amount", e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeExpense(person.id, expense.id)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full border-purple-200 dark:border-slate-700 hover:bg-purple-100 dark:hover:bg-slate-800"
                          onClick={() => addExpense(person.id)}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Agregar gasto
                        </Button>
                        <div className="text-right font-medium">
                          Total: {formatCurrency(calculateTotalExpense(person))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>📊 Resumen</CardTitle>
              <CardDescription>Cálculo de gastos y pagos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="groupDiscount">🏷️ Descuento grupal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="groupDiscount"
                      type="number"
                      placeholder="Monto de descuento"
                      value={groupDiscount || ""}
                      onChange={(e) => setGroupDiscount(Number.parseFloat(e.target.value) || 0)}
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setGroupDiscount(0)}
                      disabled={groupDiscount === 0}
                      className="border-purple-200 dark:border-slate-700 hover:bg-purple-100 dark:hover:bg-slate-800"
                    >
                      Resetear
                    </Button>
                  </div>
                </div>

                {people.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Agrega personas para ver el resumen de gastos.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-inner">
                      <div className="flex justify-between">
                        <span>Gasto total del grupo:</span>
                        <span className="font-medium">{formatCurrency(totalGroupExpense)}</span>
                      </div>
                      {groupDiscount > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>Descuento aplicado:</span>
                            <span className="font-medium text-green-600">-{formatCurrency(groupDiscount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total después de descuento:</span>
                            <span className="font-medium">{formatCurrency(totalAfterDiscount)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between pt-2 border-t border-purple-200 dark:border-slate-600">
                        <span>Gasto por persona:</span>
                        <span className="font-medium">{formatCurrency(perPersonShare)}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-400 flex items-center">
                        <span>💼 Gastos por persona:</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cuánto ha gastado cada persona</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h3>
                      <ul className="space-y-1">
                        {people.map((person) => (
                          <li
                            key={person.id}
                            className="flex justify-between p-2 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-200"
                          >
                            <span>{person.name}:</span>
                            <span>{formatCurrency(calculateTotalExpense(person))}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-400 flex items-center">
                        <span>⚖️ Balance:</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Quién debe recibir y quién debe pagar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h3>
                      <ul className="space-y-1">
                        {people.map((person) => {
                          const balance = calculateTotalExpense(person) - perPersonShare
                          return (
                            <li
                              key={person.id}
                              className="flex justify-between p-2 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-200"
                            >
                              <span>{person.name}:</span>
                              <span className={balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : ""}>
                                {balance > 0
                                  ? `Recibe ${formatCurrency(balance)}`
                                  : balance < 0
                                    ? `Debe ${formatCurrency(Math.abs(balance))}`
                                    : "Equilibrado"}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    {settlements.length > 0 && (
                      <div className="pt-4">
                        <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-400">💸 Pagos a realizar:</h3>
                        <ul className="space-y-2">
                          {settlements.map((settlement, index) => (
                            <li
                              key={index}
                              className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-md shadow-sm hover:shadow transition-all duration-200"
                            >
                              <strong>{settlement.from}</strong> debe pagar{" "}
                              <strong>{formatCurrency(settlement.amount)}</strong> a <strong>{settlement.to}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Los cálculos se basan en una división equitativa del gasto total.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Modificar la función DesayunitoCalculator para mejorar la gestión de tooltips
function DesayunitoCalculator({ savedData, onSave }: { savedData?: any; onSave: (data: any) => void }) {
  // Usar un objeto para controlar el estado de los tooltips
  const [tooltipStates, setTooltipStates] = useState<Record<string, boolean>>({})

  // Función para actualizar el estado de un tooltip específico
  const updateTooltipState = useCallback((id: string, isOpen: boolean) => {
    setTooltipStates((prev) => {
      // Si el estado no ha cambiado, no actualizar
      if (prev[id] === isOpen) return prev
      return { ...prev, [id]: isOpen }
    })
  }, [])

  const [people, setPeople] = useState<{ id: string; name: string; item: string; amount: number }[]>(
    savedData?.people || [],
  )

  const [newPersonName, setNewPersonName] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemAmount, setNewItemAmount] = useState("")
  const [deliveryCost, setDeliveryCost] = useState(savedData?.deliveryCost || 0)
  const [serviceCost, setServiceCost] = useState(savedData?.serviceCost || 0)
  const [hasFlashDiscount, setHasFlashDiscount] = useState(savedData?.hasFlashDiscount || false)
  const [flashDiscountAmount, setFlashDiscountAmount] = useState(savedData?.flashDiscountAmount || 0)
  const [payerName, setPayerName] = useState(savedData?.payerName || "")

  // Save data when it changes
  useEffect(() => {
    // Usar un temporizador para evitar actualizaciones excesivas
    const timer = setTimeout(() => {
      // Crear el objeto de datos a guardar
      const dataToSave = {
        people,
        deliveryCost,
        serviceCost,
        hasFlashDiscount,
        flashDiscountAmount,
        payerName,
      }

      // Solo guardar si hay cambios reales
      if (JSON.stringify(savedData) !== JSON.stringify(dataToSave)) {
        onSave(dataToSave)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [people, deliveryCost, serviceCost, hasFlashDiscount, flashDiscountAmount, payerName, onSave, savedData])

  const addPerson = () => {
    if (!newPersonName.trim() || !newItemDescription.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Por favor ingresa nombre y descripción del pedido",
        variant: "destructive",
      })
      return
    }

    setPeople([
      ...people,
      {
        id: Date.now().toString(),
        name: newPersonName,
        item: newItemDescription,
        amount: Number.parseFloat(newItemAmount) || 0,
      },
    ])
    setNewPersonName("")
    setNewItemDescription("")
    setNewItemAmount("")

    toast({
      title: "Persona agregada",
      description: `${newPersonName} ha sido agregado con su pedido`,
    })
  }

  const removePerson = (personId: string) => {
    const personToRemove = people.find((p) => p.id === personId)
    setPeople(people.filter((person) => person.id !== personId))

    if (personToRemove) {
      toast({
        title: "Persona eliminada",
        description: `${personToRemove.name} ha sido eliminado`,
      })
    }
  }

  const updatePerson = (personId: string, field: string, value: string) => {
    setPeople(
      people.map((person) => {
        if (person.id === personId) {
          if (field === "amount") {
            return { ...person, [field]: Number.parseFloat(value) || 0 }
          }
          return { ...person, [field]: value }
        }
        return person
      }),
    )
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate totals
  const subtotal = people.reduce((sum, person) => sum + person.amount, 0)
  const totalBeforeDiscount = subtotal + deliveryCost + serviceCost
  const totalAfterDiscount = hasFlashDiscount ? totalBeforeDiscount - flashDiscountAmount : totalBeforeDiscount

  // Calculate what each person owes
  const calculateAmountToPay = (personAmount: number) => {
    if (subtotal === 0) return 0

    // Calculate proportion of the subtotal
    const proportion = personAmount / subtotal

    // Calculate share of delivery and service
    const deliveryShare = deliveryCost / (people.length || 1)
    const serviceShare = serviceCost / (people.length || 1)

    // Calculate discount share (proportional to order amount)
    const discountShare = hasFlashDiscount ? proportion * flashDiscountAmount : 0

    // Total to pay
    return personAmount + deliveryShare + serviceShare - discountShare
  }

  const isPayer = (personName: string): boolean => {
    return personName.toLowerCase() === payerName.toLowerCase() && payerName.trim() !== ""
  }

  const duplicatePerson = (personId: string) => {
    const personToDuplicate = people.find((person) => person.id === personId)
    if (!personToDuplicate) return

    const newPerson = {
      id: Date.now().toString(),
      name: `${personToDuplicate.name} (copia)`,
      item: personToDuplicate.item,
      amount: personToDuplicate.amount,
    }

    setPeople([...people, newPerson])

    toast({
      title: "Persona duplicada",
      description: `Se ha creado una copia de ${personToDuplicate.name}`,
    })
  }

  const resetAll = () => {
    if (people.length === 0 && !payerName && deliveryCost === 0 && serviceCost === 0) return

    if (confirm("¿Estás seguro de que quieres reiniciar todos los datos?")) {
      setPeople([])
      setPayerName("")
      setDeliveryCost(0)
      setServiceCost(0)
      setHasFlashDiscount(false)
      setFlashDiscountAmount(0)

      toast({
        title: "Datos reiniciados",
        description: "Se han eliminado todos los datos",
      })
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2 mb-4">
          <span>☕</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
            Calculadora Desayunito
          </span>
        </h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip open={tooltipStates["reset"]} onOpenChange={(open) => updateTooltipState("reset", open)}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full" onClick={resetAll}>
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Reiniciar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reiniciar calculadora</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ShareButton
            data={{
              people,
              deliveryCost,
              serviceCost,
              hasFlashDiscount,
              flashDiscountAmount,
              payerName,
            }}
            type="desayunito"
          />

          <ExportButton
            data={{
              people,
              deliveryCost,
              serviceCost,
              hasFlashDiscount,
              flashDiscountAmount,
              payerName,
              subtotal,
              totalBeforeDiscount,
              totalAfterDiscount,
            }}
            filename="desayunito"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>🍽️ Pedido de Desayuno</CardTitle>
              <CardDescription>Agrega personas y sus pedidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="personName">👤 Nombre</Label>
                  <Input
                    id="personName"
                    placeholder="Nombre de la persona"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="itemDescription">🥐 Pedido</Label>
                  <Input
                    id="itemDescription"
                    placeholder="Descripción del pedido"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="itemAmount">💰 Precio</Label>
                  <Input
                    id="itemAmount"
                    type="number"
                    placeholder="Precio del pedido"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                  onClick={addPerson}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Agregar Persona
                </Button>
              </div>

              {people.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay personas agregadas.</p>
                  <p className="text-sm mt-2">Agrega personas y sus pedidos para comenzar.</p>
                </div>
              ) : (
                <>
                  {people.map((person, index) => {
                    const personId = person.id
                    return (
                      <Card
                        key={person.id}
                        className="border border-purple-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                          <div className="flex-1 mr-2">
                            <Input
                              value={person.name}
                              onChange={(e) => updatePerson(person.id, "name", e.target.value)}
                              className="font-medium text-lg transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                            />
                          </div>
                          <div className="flex space-x-1">
                            <TooltipProvider>
                              <Tooltip
                                open={tooltipStates[`duplicate-person-${personId}`]}
                                onOpenChange={(open) => updateTooltipState(`duplicate-person-${personId}`, open)}
                              >
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => duplicatePerson(person.id)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Duplicar persona</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip
                                open={tooltipStates[`remove-person-${personId}`]}
                                onOpenChange={(open) => updateTooltipState(`remove-person-${personId}`, open)}
                              >
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => removePerson(person.id)}>
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar persona</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`item-${person.id}`}>Pedido</Label>
                              <Input
                                id={`item-${person.id}`}
                                placeholder="Descripción"
                                value={person.item}
                                onChange={(e) => updatePerson(person.id, "item", e.target.value)}
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`amount-${person.id}`}>Precio</Label>
                              <Input
                                id={`amount-${person.id}`}
                                type="number"
                                placeholder="Precio"
                                value={person.amount || ""}
                                onChange={(e) => updatePerson(person.id, "amount", e.target.value)}
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Costos adicionales y descuentos */}
                  <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-slate-700">
                    <h3 className="font-medium text-lg">Costos adicionales y descuentos</h3>

                    <div className="grid gap-2">
                      <Label htmlFor="deliveryCost">🚚 Costo de envío</Label>
                      <Input
                        id="deliveryCost"
                        type="number"
                        placeholder="Costo de envío"
                        value={deliveryCost || ""}
                        onChange={(e) => setDeliveryCost(Number.parseFloat(e.target.value) || 0)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="serviceCost">🛎️ Costo de servicio</Label>
                      <Input
                        id="serviceCost"
                        type="number"
                        placeholder="Costo de servicio"
                        value={serviceCost || ""}
                        onChange={(e) => setServiceCost(Number.parseFloat(e.target.value) || 0)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="flashDiscount" checked={hasFlashDiscount} onCheckedChange={setHasFlashDiscount} />
                      <Label htmlFor="flashDiscount">🏷️ Descuento fugaz</Label>
                    </div>

                    {hasFlashDiscount && (
                      <div className="grid gap-2">
                        <Label htmlFor="flashDiscountAmount">Monto del descuento</Label>
                        <Input
                          id="flashDiscountAmount"
                          type="number"
                          placeholder="Monto del descuento"
                          value={flashDiscountAmount || ""}
                          onChange={(e) => setFlashDiscountAmount(Number.parseFloat(e.target.value) || 0)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Selector de quien pagó */}
                  <div className="pt-4 border-t border-purple-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="payerSelector" className="font-medium">
                        💳 Pagó:
                      </Label>
                      <select
                        id="payerSelector"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="w-auto min-w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-400"
                      >
                        <option value="">Seleccionar...</option>
                        {people.map((person) => (
                          <option key={person.id} value={person.name}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>📋 Resumen del Pedido</CardTitle>
              <CardDescription>Cálculo de lo que debe pagar cada persona</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {people.length === 0 || !payerName.trim() ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{!payerName.trim() ? "Indica quién pagó el pedido." : "Agrega personas para ver el resumen."}</p>
                  {people.length === 0 && payerName.trim() && (
                    <p className="text-sm mt-2">Agrega al menos una persona para calcular los pagos.</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-inner">
                    <div className="flex justify-between">
                      <span>Subtotal (solo pedidos):</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo de envío:</span>
                      <span className="font-medium">{formatCurrency(deliveryCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo de servicio:</span>
                      <span className="font-medium">{formatCurrency(serviceCost)}</span>
                    </div>
                    {hasFlashDiscount && (
                      <div className="flex justify-between">
                        <span>Descuento fugaz:</span>
                        <span className="font-medium text-green-600">-{formatCurrency(flashDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-purple-200 dark:border-slate-600">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold">{formatCurrency(totalAfterDiscount)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-400">Detalle por persona:</h3>
                    <div className="space-y-4">
                      {people.map((person) => {
                        const amountToPay = calculateAmountToPay(person.amount)
                        const isThePayer = isPayer(person.name)

                        return (
                          <Card
                            key={person.id}
                            className={`border ${isThePayer ? "border-primary shadow-md" : "border-muted"} hover:shadow-lg transition-all duration-300`}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">
                                    {person.name} {isThePayer && "💳"}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">{person.item}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm">Pedido: {formatCurrency(person.amount)}</p>
                                  <p className="font-medium">
                                    {isThePayer
                                      ? `Pagó ${formatCurrency(totalAfterDiscount)}`
                                      : `Debe pagar ${formatCurrency(amountToPay)}`}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 text-sm">
                                <p>Desglose:</p>
                                <ul className="pl-4 space-y-1">
                                  <li>Pedido: {formatCurrency(person.amount)}</li>
                                  <li>Envío: {formatCurrency(deliveryCost / people.length)}</li>
                                  <li>Servicio: {formatCurrency(serviceCost / people.length)}</li>
                                  {hasFlashDiscount && subtotal > 0 && (
                                    <li className="text-green-600">
                                      Descuento: -{formatCurrency((person.amount / subtotal) * flashDiscountAmount)}
                                    </li>
                                  )}
                                </ul>

                                {isThePayer && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="font-medium">Total pagado: {formatCurrency(totalAfterDiscount)}</p>
                                    <p className="font-medium">Consumo propio: {formatCurrency(amountToPay)}</p>
                                    <p className="font-medium">
                                      A recibir: {formatCurrency(totalAfterDiscount - amountToPay)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-400">Resumen de pagos:</h3>
                    <Card className="border-primary shadow-md hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">Desglose completo:</p>
                            <ul className="pl-4 space-y-1 mt-2">
                              {people.map((person) => {
                                const amountToPay = calculateAmountToPay(person.amount)
                                const isThePayer = isPayer(person.name)

                                return (
                                  <li key={person.id} className={isThePayer ? "font-medium" : ""}>
                                    <strong>{person.name}:</strong> {formatCurrency(amountToPay)}
                                    {isThePayer && " (pagó el total)"}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="font-medium">{payerName} recibe:</p>
                            <ul className="pl-4 space-y-1 mt-2">
                              {people
                                .filter((person) => !isPayer(person.name))
                                .map((person) => (
                                  <li key={person.id}>
                                    <strong>{person.name}:</strong>{" "}
                                    {formatCurrency(calculateAmountToPay(person.amount))}
                                  </li>
                                ))}
                            </ul>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="font-medium">Total del pedido: {formatCurrency(totalAfterDiscount)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                El costo de envío y servicio se divide equitativamente. El descuento se aplica proporcionalmente al
                gasto de cada persona.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

