"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Mail, ArrowLeft } from "lucide-react"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    setIsResending(true)

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        toast.error("No email found. Please try signing up again.")
        return
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Verification email resent!")
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          We&apos;ve sent a verification link to your email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? "Resending..." : "Resend verification email"}
        </Button>
      </CardContent>
      <CardFooter>
        <Link
          href="/login"
          className="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
