'use client'

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('specials')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('specials')
                .getPublicUrl(filePath)

            onChange(publicUrl)
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = () => {
        onChange('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-4 w-full">
            <div className={cn(
                "border-2 border-dashed border-fb-surface-soft rounded-xl p-4 flex flex-col items-center justify-center gap-4 transition-colors hover:bg-fb-surface/50 min-h-[200px] relative",
                value ? "border-solid border-fb-surface-soft p-0 overflow-hidden" : "bg-fb-bg"
            )}>
                {value ? (
                    <div className="relative w-full aspect-video">
                        <Image
                            src={value}
                            alt="Upload"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                onClick={handleRemove}
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-fb-muted">
                        {isUploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-fb-primary" />
                        ) : (
                            <ImagePlus className="h-10 w-10" />
                        )}
                        <p className="text-sm font-medium">
                            {isUploading ? "Uploading..." : "Click to upload an image"}
                        </p>
                        <p className="text-xs">JPG, PNG, WebP up to 5MB</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleUpload}
                    disabled={disabled || isUploading || !!value}
                />
            </div>
        </div>
    )
}
