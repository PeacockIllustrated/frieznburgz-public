'use client'

import { submitApplication } from "@/app/actions/recruitment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams } from "next/navigation"
import { useRef } from "react"

export function RecruitmentFormContent() {
    const searchParams = useSearchParams()
    const success = searchParams.get('success')
    const formRef = useRef<HTMLFormElement>(null)

    if (success) {
        return (
            <div className="rounded-xl border border-fb-success/20 bg-fb-success/10 p-6 text-center">
                <h3 className="text-xl font-bold text-fb-success font-fbHeading">Application Received!</h3>
                <p className="mt-2 text-fb-text">Thanks for applying. We'll be in touch if you're a good fit.</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.href = '/recruitment'}
                >
                    Submit Another
                </Button>
            </div>
        )
    }

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                await submitApplication(formData)
                formRef.current?.reset()
            }}
            className="space-y-6"
        >
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="Jane Doe" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="07123 456789" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="preferredLocation">Preferred Location</Label>
                    <div className="relative">
                        <select
                            id="preferredLocation"
                            name="preferredLocation"
                            required
                            className="flex h-12 w-full rounded-md border border-fb-surface-soft bg-fb-bg px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        >
                            <option value="">Select a location...</option>
                            <option value="Downtown">Downtown</option>
                            <option value="Westside">Westside</option>
                            <option value="Any">Any</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fb-muted">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="desiredRole">Desired Role</Label>
                    <div className="relative">
                        <select
                            id="desiredRole"
                            name="desiredRole"
                            required
                            className="flex h-12 w-full rounded-md border border-fb-surface-soft bg-fb-bg px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        >
                            <option value="">Select a role...</option>
                            <option value="Front of House">Front of House</option>
                            <option value="Kitchen Staff">Kitchen Staff</option>
                            <option value="Manager">Manager</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fb-muted">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" name="availability" required placeholder="e.g. Weekends, Evenings, Full-time" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Why do you want to join the team?</Label>
                <Textarea id="message" name="message" required placeholder="Tell us a bit about yourself..." />
            </div>

            <Button type="submit" size="lg" className="w-full">
                Submit Application
            </Button>
        </form>
    )
}
