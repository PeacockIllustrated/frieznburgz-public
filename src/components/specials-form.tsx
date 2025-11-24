'use client'

import { upsertSpecial } from "@/app/actions/specials"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Special, SpecialType } from "@/types"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SpecialsForm({ special }: { special?: Special }) {
    const [preview, setPreview] = useState<Partial<Special>>(special || {
        type: 'burger',
        title: 'New Special',
        description: 'Description will appear here...',
        price: 0,
        is_active: false
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setPreview(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }))
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <form action={upsertSpecial} className="space-y-6">
                <input type="hidden" name="id" value={special?.id || ''} />

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

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (£)</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={special?.price || ''} onChange={handleChange} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input id="image_url" name="image_url" defaultValue={special?.image_url || ''} onChange={handleChange} placeholder="https://..." />
                    </div>
                </div>

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
                <Card className="overflow-hidden border-fb-primary/20">
                    {preview.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview.image_url} alt="Preview" className="aspect-video w-full object-cover" />
                    ) : (
                        <div className="aspect-video w-full bg-fb-surface-soft/50 flex items-center justify-center text-fb-muted">No Image</div>
                    )}
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="uppercase">{preview.type}</Badge>
                            {preview.price && <span className="font-bold text-fb-primary">£{Number(preview.price).toFixed(2)}</span>}
                        </div>
                        <CardTitle className="mt-2 text-xl">{preview.title || 'Title'}</CardTitle>
                        {preview.subtitle && <CardDescription>{preview.subtitle}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-fb-muted line-clamp-3">{preview.description || 'Description...'}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
