'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitApplication(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const preferredLocation = formData.get('preferredLocation') as string
    const desiredRole = formData.get('desiredRole') as string
    const availability = formData.get('availability') as string
    const message = formData.get('message') as string

    const { error } = await supabase
        .from('recruitment_applications')
        .insert({
            name,
            email,
            phone,
            preferred_location: preferredLocation,
            desired_role: desiredRole,
            availability,
            message,
        })

    if (error) {
        console.error('Error submitting application:', error)
        throw new Error('Failed to submit application')
    }

    redirect('/recruitment?success=true')
}
