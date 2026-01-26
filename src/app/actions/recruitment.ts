'use server'

import { RecruitmentPayload } from '@/types'
import { redirect } from 'next/navigation'

export async function submitToWebhook(payload: RecruitmentPayload) {
    const webhookUrl = "https://hook.eu2.make.com/jrq6ohi63m2qauu6pq1nvdykyqi45qf3"

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Webhook submission failed:', errorText)
            return { success: false, error: `Submission failed: ${response.statusText}` }
        }

        return { success: true }
    } catch (error) {
        console.error('Error submitting to webhook:', error)
        return { success: false, error: 'An unexpected error occurred during submission' }
    }
}

// Keep for backward compatibility with existing form at /recruitment
export async function submitApplication(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    console.log(`Legacy submission received from ${name} (${email})`)

    // Redirect to success state on the legacy page
    redirect('/recruitment?success=true')
}
