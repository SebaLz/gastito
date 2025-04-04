import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export function Header() {
  return (
    <header className="w-full py-4 border-b border-purple-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              gastito.com.ar
            </span>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

