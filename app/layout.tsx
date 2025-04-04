import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/hooks/use-theme"
import { Toaster } from "@/components/toaster"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gastito - Calculadora de gastos grupales",
  description: "Divide gastos entre amigos de manera equitativa y sencilla. Calcula quién debe a quién y cuánto.",
  keywords: "calculadora, gastos, dividir gastos, gastos grupales, cuentas compartidas",
  authors: [{ name: "Gastito" }],
  openGraph: {
    title: "Gastito - Calculadora de gastos grupales",
    description: "Divide gastos entre amigos de manera equitativa y sencilla",
    url: "https://gastito.com.ar",
    siteName: "Gastito",
    locale: "es_AR",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'