'use client'

import { upsertSpecial } from "@/app/actions/specials"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Special, Allergen } from "@/types"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/image-upload"
import { AllergenSelector } from "@/components/allergen-selector"

export function SpecialsForm({ special }: { special?: Special }) {
    const [preview, setPreview] = useState<Partial<Special>>(special || {
        type: 'burger',
        title: 'New Special',
        description: 'Description will appear here...',
        price: 0,
        is_active: false,
        image_url: '',
        allergens: []
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setPreview(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }))
    }

    const handleImageChange = (url: string) => {
        setPreview(prev => ({ ...prev, image_url: url }))
    }

    const handleAllergensChange = (allergens: Allergen[]) => {
        setPreview(prev => ({ ...prev, allergens }))
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <form action={upsertSpecial} className="space-y-6">
                <input type="hidden" name="id" value={special?.id || ''} />
                <input type="hidden" name="image_url" value={preview.image_url || ''} />
                <input type="hidden" name="allergens" value={JSON.stringify(preview.allergens || [])} />

                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <div className="relative">
                        <select
                            id="type"
                            name="type"
                            defaultValue={special?.type || 'burger'}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-md border border-fb-surface-soft bg-fb-bg px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        >
                            <option value="burger">Burger</option>
                            <option value="fillet">Fillet</option>
                            <option value="shake">Shake</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={special?.title} onChange={handleChange} required placeholder="e.g. Truffle Stack" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" defaultValue={special?.slug} onChange={handleChange} required placeholder="e.g. truffle-stack" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                    <Input id="subtitle" name="subtitle" defaultValue={special?.subtitle || ''} onChange={handleChange} placeholder="e.g. Limited Time Only" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={special?.description} onChange={handleChange} required placeholder="Full description..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price">Price (£)</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={special?.price || ''} onChange={handleChange} placeholder="0.00" />
                </div>

                <div className="space-y-2">
                    <Label>Image</Label>
                    <ImageUpload value={preview.image_url || ''} onChange={handleImageChange} />
                </div>

                <AllergenSelector value={preview.allergens || []} onChange={handleAllergensChange} />

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        defaultChecked={special?.is_active}
                        className="h-4 w-4 rounded border-fb-surface-soft bg-fb-bg text-fb-primary focus:ring-fb-primary"
                    />
                    <Label htmlFor="is_active">Set as Active immediately?</Label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="starts_at">Starts At (Optional)</Label>
                        <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={special?.starts_at ? new Date(special.starts_at).toISOString().slice(0, 16) : ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ends_at">Ends At (Optional)</Label>
                        <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={special?.ends_at ? new Date(special.ends_at).toISOString().slice(0, 16) : ''} />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" size="lg">
                        {special ? 'Update Special' : 'Create Special'}
                    </Button>
                    <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                </div>
            </form>

            {/* Live Preview */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase text-fb-muted">Preview</h3>
                <Card variant="brand" className="overflow-hidden">
                    {preview.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview.image_url} alt="Preview" className="aspect-video w-full object-cover" />
                    ) : (
                        <div className="aspect-video w-full bg-black/20 flex items-center justify-center text-white/50">No Image</div>
                    )}
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="uppercase">{preview.type}</Badge>
                            {preview.price && <span className="font-bold text-fb-accent">£{Number(preview.price).toFixed(2)}</span>}
                        </div>
                        <CardTitle className="mt-2 text-xl text-white">{preview.title || 'Title'}</CardTitle>
                        {preview.subtitle && <CardDescription className="text-white/80">{preview.subtitle}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-white/90 line-clamp-3">{preview.description || 'Description...'}</p>
                        {preview.allergens && preview.allergens.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1">
                                {preview.allergens.map(a => (
                                    <Badge key={a} variant="outline" className="text-[10px] py-0 px-2 border-white/30 text-white/80 uppercase">
                                        {a}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
