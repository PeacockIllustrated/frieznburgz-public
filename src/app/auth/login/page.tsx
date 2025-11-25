'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [origin, setOrigin] = useState('')
    const [supabase] = useState(() => createClient())
    const router = useRouter()

    useEffect(() => {
        setOrigin(window.location.origin)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                router.push('/app')
                router.refresh()
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-fb-bg px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold uppercase tracking-tighter text-fb-primary font-fbHeading mb-2">
                        Friez n Burgz
                    </h1>
                    <p className="text-fb-muted">Admin Login</p>
                </div>

                <div className="rounded-xl border border-fb-surface-soft bg-fb-surface p-6 md:p-8">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#e71e26',
                                        brandAccent: '#fbae29',
                                        brandButtonText: 'white',
                                        defaultButtonBackground: '#2f2f2f',
                                        defaultButtonBackgroundHover: '#43464d',
                                        defaultButtonBorder: '#43464d',
                                        defaultButtonText: 'white',
                                        dividerBackground: '#43464d',
                                        inputBackground: '#050505',
                                        inputBorder: '#43464d',
                                        inputBorderHover: '#e71e26',
                                        inputBorderFocus: '#e71e26',
                                        inputText: 'white',
                                        inputLabelText: '#c4c4c4',
                                        inputPlaceholder: '#c4c4c4',
                                        messageText: 'white',
                                        messageTextDanger: '#ff4444',
                                        anchorTextColor: '#fbae29',
                                        anchorTextHoverColor: '#e71e26',
                                    },
                                    space: {
                                        spaceSmall: '4px',
                                        spaceMedium: '8px',
                                        spaceLarge: '16px',
                                        labelBottomMargin: '8px',
                                        anchorBottomMargin: '4px',
                                        emailInputSpacing: '4px',
                                        socialAuthSpacing: '4px',
                                        buttonPadding: '10px 15px',
                                        inputPadding: '10px 15px',
                                    },
                                    fontSizes: {
                                        baseBodySize: '14px',
                                        baseInputSize: '14px',
                                        baseLabelSize: '14px',
                                        baseButtonSize: '14px',
                                    },
                                    borderWidths: {
                                        buttonBorderWidth: '1px',
                                        inputBorderWidth: '1px',
                                    },
                                    radii: {
                                        borderRadiusButton: '9999px',
                                        buttonBorderRadius: '9999px',
                                        inputBorderRadius: '0.375rem',
                                    },
                                },
                            },
                            className: {
                                container: 'auth-container',
                                label: 'auth-label',
                                button: 'auth-button',
                                input: 'auth-input',
                            },
                        }}
                        providers={[]}
                        redirectTo={`${origin}/app`}
                    />
                </div>
            </div>
        </div>
    )
}
