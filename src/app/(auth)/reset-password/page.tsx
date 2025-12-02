"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Check, X, ArrowLeft } from "lucide-react"

interface PasswordRequirement {
  label: string
  met: boolean
}

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const passwordRequirements = useMemo<PasswordRequirement[]>(() => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
  ], [password])

  const allRequirementsMet = passwordRequirements.every((req) => req.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allRequirementsMet) {
      toast.error("Please meet all password requirements")
      return
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Password updated successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Reset password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            {password.length > 0 && (
              <div className="space-y-1 mt-2">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-xs ${
                      req.met ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            {confirmPassword.length > 0 && (
              <div
                className={`flex items-center gap-2 text-xs ${
                  passwordsMatch ? "text-green-600" : "text-destructive"
                }`}
              >
                {passwordsMatch ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !allRequirementsMet || !passwordsMatch}
          >
            {isLoading ? "Updating..." : "Update password"}
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
