'use server'

import { createClient } from '@/lib/supabase/server'
import { Special, SpecialType } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getSpecials() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('specials')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Special[]
}

export async function getActiveSpecials() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('specials')
        .select('*')
        .eq('is_active', true)

    if (error) throw new Error(error.message)
    return data as Special[]
}

export async function getSpecial(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('specials')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw new Error(error.message)
    return data as Special
}

export async function upsertSpecial(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string | null
    const type = formData.get('type') as SpecialType
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const subtitle = formData.get('subtitle') as string
    const description = formData.get('description') as string
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
    const image_url = formData.get('image_url') as string
    const is_active = formData.get('is_active') === 'on'
    const starts_at = formData.get('starts_at') as string || null
    const ends_at = formData.get('ends_at') as string || null

    const specialData = {
        type,
        title,
        slug,
        subtitle,
        description,
        price,
        image_url,
        is_active,
        starts_at,
        ends_at,
        updated_at: new Date().toISOString(),
    }

    if (is_active) {
        await supabase
            .from('specials')
            .update({ is_active: false })
            .eq('type', type)
    }

    let error;
    if (id) {
        const { error: updateError } = await supabase
            .from('specials')
            .update(specialData)
            .eq('id', id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('specials')
            .insert(specialData)
        error = insertError
    }

    if (error) {
        console.error('Error upserting special:', error)
        throw new Error('Failed to save special')
    }

    revalidatePath('/')
    revalidatePath('/app/specials')
    redirect('/app/specials')
}

export async function setActiveSpecial(id: string, type: SpecialType) {
    const supabase = await createClient()

    const { error: deactivateError } = await supabase
        .from('specials')
        .update({ is_active: false })
        .eq('type', type)

    if (deactivateError) throw new Error(deactivateError.message)

    const { error: activateError } = await supabase
        .from('specials')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (activateError) throw new Error(activateError.message)

    revalidatePath('/')
    revalidatePath('/app/specials')
}
