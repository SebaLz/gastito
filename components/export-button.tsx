"use client"

import { Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

interface ExportButtonProps {
  data: any
  filename?: string
}

export function ExportButton({ data, filename = "datos-calculadora" }: ExportButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const exportToJson = () => {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${filename}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportación exitosa",
        description: "Los datos se han exportado correctamente",
      })

      // Cerrar el dropdown después de exportar
      setDropdownOpen(false)
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    }
  }

  const shareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Calculadora de Gastos",
          text: "Aquí están los datos de nuestra división de gastos",
        })
        toast({
          title: "Compartido",
          description: "Los datos se han compartido correctamente",
        })

        // Cerrar el dropdown después de compartir
        setDropdownOpen(false)
      } catch (error) {
        toast({
          title: "Error al compartir",
          description: "No se pudieron compartir los datos",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "No disponible",
        description: "Tu navegador no soporta la función de compartir",
        variant: "destructive",
      })
    }
  }

  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <DropdownMenu
            open={dropdownOpen}
            onOpenChange={(open) => {
              setDropdownOpen(open)
              // Cerrar el tooltip cuando se abre el dropdown
              if (open) setTooltipOpen(false)
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Download className="h-4 w-4" />
                <span className="sr-only">Exportar datos</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToJson}>
                <Download className="mr-2 h-4 w-4" />
                <span>Exportar como JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareData}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Compartir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exportar o compartir datos</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

