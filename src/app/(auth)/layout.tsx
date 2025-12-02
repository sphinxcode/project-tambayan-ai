import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-fuchsia-50">
      <div className="w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="text-xl font-bold">Tambayan PH</span>
          </Link>
          <p className="text-sm text-muted-foreground">AI Automation Tools</p>
        </div>
        {children}
      </div>
    </div>
  )
}
