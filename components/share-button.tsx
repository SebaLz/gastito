"use client"

import { useState } from "react"
import { Share2, Copy, Check, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ShareButtonProps {
  data: any
  type: "gastos-grupales" | "desayunito"
}

export function ShareButton({ data, type }: ShareButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generar un código compartible basado en los datos
  const generateShareableCode = () => {
    try {
      // Convertir los datos a JSON y codificarlos en base64
      const jsonData = JSON.stringify(data)
      const encodedData = btoa(jsonData)
      return encodedData
    } catch (error) {
      console.error("Error al generar código compartible:", error)
      return ""
    }
  }

  // Generar un enlace compartible
  const generateShareableLink = () => {
    const code = generateShareableCode()
    const baseUrl = window.location.origin
    return `${baseUrl}?type=${type}&data=${code}`
  }

  // Copiar el enlace al portapapeles
  const copyLink = () => {
    const link = generateShareableLink()
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true)
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        })
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar el enlace",
          variant: "destructive",
        })
      })
  }

  // Copiar el código al portapapeles
  const copyCode = () => {
    const code = generateShareableCode()
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true)
        toast({
          title: "Código copiado",
          description: "El código se ha copiado al portapapeles",
        })
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar el código",
          variant: "destructive",
        })
      })
  }

  // Compartir a través de la API Web Share si está disponible
  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: type === "gastos-grupales" ? "Calculadora de Gastos Grupales" : "Calculadora Desayunito",
          text: `Mira este cálculo de gastos que hice en gastito.com.ar`,
          url: generateShareableLink(),
        })
        toast({
          title: "Compartido",
          description: "El enlace se ha compartido correctamente",
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({
            title: "Error al compartir",
            description: "No se pudo compartir el enlace",
            variant: "destructive",
          })
        }
      }
    } else {
      setDialogOpen(true)
    }
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <DropdownMenu
              open={dropdownOpen}
              onOpenChange={(open) => {
                setDropdownOpen(open)
                if (open) setTooltipOpen(false)
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Compartir cálculo</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareViaWebShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Compartir</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  <span>Obtener enlace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Compartir cálculo</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir cálculo</DialogTitle>
            <DialogDescription>Comparte este enlace con tus amigos para que puedan ver tu cálculo.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input readOnly value={generateShareableLink()} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Este enlace contiene todos los datos de tu cálculo actual.
              </p>
            </div>
            <Button size="sm" className="px-3" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copiar enlace</span>
            </Button>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-sm font-medium">O comparte este código:</p>
            <div className="flex items-center space-x-2">
              <Input readOnly value={generateShareableCode()} className="w-full font-mono text-xs" />
              <Button size="sm" className="px-3" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copiar código</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Para usar este código, la otra persona debe pegarlo en la sección "Importar cálculo" de la aplicación.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

