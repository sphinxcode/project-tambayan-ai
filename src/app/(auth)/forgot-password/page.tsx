"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setEmailSent(true)
      toast.success("Password reset email sent!")
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Try another email
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

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Forgot password?</CardTitle>
        <CardDescription className="text-center">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
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
