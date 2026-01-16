'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RecruitmentData, RecruitmentPayload } from '@/types'
import { submitToWebhook } from '@/app/actions/recruitment'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const LOCATIONS = ['SOUTH SHIELDS', 'BYKER', 'FOREST HALL', 'WHITLEY BAY'] as const
const TRANSPORT_METHODS = ['CAR', 'PUBLIC TRANSPORT', 'WALKING', 'OTHER (CYCLING ETC.)'] as const

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-2xl font-black font-fbHeading text-fb-primary uppercase tracking-wider border-b-4 border-fb-surface-soft pb-2 mb-8 mt-12 first:mt-0">
        {children}
    </h3>
)

const FieldGroup = ({ label, required, children, helper }: { label: string, required?: boolean, children: React.ReactNode, helper?: string }) => (
    <div className="space-y-3">
        <Label className="text-sm font-black uppercase tracking-widest text-fb-secondary">
            {label} {required && <span className="text-fb-primary">*</span>}
        </Label>
        {helper && <p className="text-xs font-bold text-fb-muted uppercase tracking-tight -mt-2">{helper}</p>}
        {children}
    </div>
)

export function OnboardingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const [formData, setFormData] = useState<RecruitmentData>({
        "Name Recruitment": "",
        "Email Recruitment": "",
        "Date of Birth": "",
        "Phone Number": "",
        "Location": "",
        "position": "",
        "Availability": "",
        "South Shields": "",
        "Byker": "",
        "Forest Hall": "",
        "Whitley Bay": "",
        "Studying or Working?": "",
        "Can Drive": "",
        "Car": "",
        "Public Transport": "",
        "Walking": "",
        "Other Transport": "",
        "Experience": "",
        "Describe Experience": "",
        "Certifications": "",
        "Additional Skills": "",
        "Logistics": "",
        "Start Availability": "",
        "Why?": "",
        "Anything Else?": ""
    })

    const [otherTransportDetail, setOtherTransportDetail] = useState("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (tag: keyof RecruitmentData, checked: boolean) => {
        setFormData(prev => ({ ...prev, [tag]: checked ? "Yes" : "" }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation: At least one location
        const locationTags = ['South Shields', 'Byker', 'Forest Hall', 'Whitley Bay']
        const hasLocation = locationTags.some(loc => formData[loc as keyof RecruitmentData] === "Yes")
        if (!hasLocation) {
            setSubmitStatus('error')
            setErrorMessage("Please select at least one preferred location.")
            return
        }

        setIsSubmitting(true)
        setSubmitStatus('idle')

        // Final payload preparation
        const data = { ...formData }

        // Handle Other Transport detail appending
        if (formData["Other Transport"] === "Yes" && otherTransportDetail) {
            data["Other Transport"] = `Yes - ${otherTransportDetail}`
        }

        // Handle Experience conditional description
        if (formData["Experience"] !== "Yes") {
            data["Describe Experience"] = ""
        }

        const payload: RecruitmentPayload = {
            name: "Recruitment",
            data,
            submittedAt: new Date().toISOString()
        }

        const result = await submitToWebhook(payload)

        setIsSubmitting(false)
        if (result.success) {
            setSubmitStatus('success')
        } else {
            setSubmitStatus('error')
            setErrorMessage(result.error || "Something went wrong. Please try again.")
        }
    }

    if (submitStatus === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-12 bg-white rounded-[2rem] shadow-2xl border-2 border-fb-primary max-w-2xl mx-auto"
            >
                <div className="text-6xl mb-6">🤟</div>
                <h2 className="text-4xl font-black text-fb-primary font-fbHeading uppercase mb-4">Application Received!</h2>
                <p className="text-xl font-bold text-fb-text uppercase mb-8">Thanks for applying! We'll be in touch if you're a good fit for the team.</p>
                <Button
                    onClick={() => setSubmitStatus('idle')}
                    className="bg-fb-primary hover:bg-fb-secondary text-white font-black px-12 py-8 text-2xl rounded-full transition-all shadow-xl"
                >
                    BACK TO JOIN
                </Button>
            </motion.div>
        )
    }

    return (
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Basic Information */}
                    <div>
                        <SectionTitle>Basic Information</SectionTitle>
                        <div className="grid gap-8">
                            <FieldGroup label="Full Name" required>
                                <Input
                                    name="Name Recruitment"
                                    value={formData["Name Recruitment"]}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                    placeholder="JANE DOE"
                                />
                            </FieldGroup>

                            <div className="grid md:grid-cols-2 gap-8">
                                <FieldGroup label="Email Address" required>
                                    <Input
                                        name="Email Recruitment"
                                        type="email"
                                        value={formData["Email Recruitment"]}
                                        onChange={handleInputChange}
                                        required
                                        className="h-14 bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                        placeholder="JANE@EXAMPLE.COM"
                                    />
                                </FieldGroup>
                                <FieldGroup label="Date of Birth" required helper="DD/MM/YYYY">
                                    <Input
                                        name="Date of Birth"
                                        type="text"
                                        value={formData["Date of Birth"]}
                                        onChange={handleInputChange}
                                        required
                                        className="h-14 bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                        placeholder="DD/MM/YYYY"
                                    />
                                </FieldGroup>
                            </div>

                            <FieldGroup label="Phone Number" required helper="e.g, 07 123 123 1234">
                                <Input
                                    name="Phone Number"
                                    type="tel"
                                    value={formData["Phone Number"]}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                    placeholder="07 123 123 1234"
                                />
                            </FieldGroup>

                            <FieldGroup label="Where do you currently live?" required helper="Post-code e.g">
                                <Input
                                    name="Location"
                                    value={formData["Location"]}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                    placeholder="NE1 1AA"
                                />
                            </FieldGroup>
                        </div>
                    </div>

                    {/* Position & Availability */}
                    <div>
                        <SectionTitle>Position & Availability</SectionTitle>
                        <div className="grid gap-8">
                            <FieldGroup label="What position are you applying for?" required>
                                <div className="grid grid-cols-2 gap-4">
                                    {['KITCHEN STAFF', 'CASHIER'].map(pos => (
                                        <label key={pos} className={cn(
                                            "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-sm tracking-widest",
                                            formData["position"] === pos ? "bg-fb-primary border-fb-primary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                        )}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="position"
                                                value={pos}
                                                checked={formData["position"] === pos}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {pos}
                                        </label>
                                    ))}
                                </div>
                            </FieldGroup>

                            <FieldGroup label="Are you available to work full-time, part-time, or weekends only?" required>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['FULL-TIME', 'PART-TIME', 'WEEKENDS'].map(avail => (
                                        <label key={avail} className={cn(
                                            "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-sm tracking-widest",
                                            formData["Availability"] === avail ? "bg-fb-secondary border-fb-secondary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                        )}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="Availability"
                                                value={avail}
                                                checked={formData["Availability"] === avail}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {avail}
                                        </label>
                                    ))}
                                </div>
                            </FieldGroup>

                            <FieldGroup label="What store locations are you applying for?" required>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {['South Shields', 'Byker', 'Forest Hall', 'Whitley Bay'].map(loc => (
                                        <label key={loc} className={cn(
                                            "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-[10px] tracking-tighter text-center h-16",
                                            formData[loc as keyof RecruitmentData] === "Yes" ? "bg-fb-primary border-fb-primary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                        )}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData[loc as keyof RecruitmentData] === "Yes"}
                                                onChange={(e) => handleCheckboxChange(loc as keyof RecruitmentData, e.target.checked)}
                                            />
                                            {loc}
                                        </label>
                                    ))}
                                </div>
                            </FieldGroup>

                            <FieldGroup label="Do you currently study or work somewhere?" required helper="IF YES, PLEASE TELL US WHERE AND YOUR SCHEDULE">
                                <Textarea
                                    name="Studying or Working?"
                                    value={formData["Studying or Working?"]}
                                    onChange={handleInputChange}
                                    required
                                    className="min-h-[100px] bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                    placeholder="EXAMPLE TEXT"
                                />
                            </FieldGroup>
                        </div>
                    </div>

                    {/* Transportation */}
                    <div>
                        <SectionTitle>Transportation</SectionTitle>
                        <div className="grid gap-8">
                            <FieldGroup label="Do you drive a car?" required>
                                <div className="grid grid-cols-2 gap-4">
                                    {['YES', 'NO'].map(opt => (
                                        <label key={opt} className={cn(
                                            "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-sm tracking-widest",
                                            formData["Can Drive"] === opt ? "bg-fb-primary border-fb-primary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                        )}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="Can Drive"
                                                value={opt}
                                                checked={formData["Can Drive"] === opt}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FieldGroup>

                            <FieldGroup label="How will you get to Friez n Burgz?" required>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'CAR', key: 'Car' },
                                        { label: 'PUBLIC TRANSPORT', key: 'Public Transport' },
                                        { label: 'WALKING', key: 'Walking' },
                                        { label: 'OTHER (CYCLING ETC.)', key: 'Other Transport' }
                                    ].map(method => (
                                        <div key={method.key} className="space-y-3">
                                            <label className={cn(
                                                "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-[10px] tracking-tighter text-center h-16",
                                                formData[method.key as keyof RecruitmentData] === "Yes" ? "bg-fb-secondary border-fb-secondary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                            )}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData[method.key as keyof RecruitmentData] === "Yes"}
                                                    onChange={(e) => handleCheckboxChange(method.key as keyof RecruitmentData, e.target.checked)}
                                                />
                                                {method.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <AnimatePresence>
                                    {formData['Other Transport'] === 'Yes' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="pt-2"
                                        >
                                            <Input
                                                placeholder="SPECIFY OTHER (E.G. CYCLING)"
                                                value={otherTransportDetail}
                                                onChange={(e) => setOtherTransportDetail(e.target.value)}
                                                className="h-14 bg-fb-surface-soft/30 border-2 border-fb-secondary transition-all rounded-xl font-bold"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </FieldGroup>
                        </div>
                    </div>

                    {/* Work Experience */}
                    <div>
                        <SectionTitle>Work Experience</SectionTitle>
                        <div className="grid gap-8">
                            <FieldGroup label="Do you have any prior experience?" required>
                                <div className="grid grid-cols-2 gap-4">
                                    {['YES', 'NO'].map(opt => (
                                        <label key={opt} className={cn(
                                            "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-sm tracking-widest",
                                            formData["Experience"] === opt ? "bg-fb-primary border-fb-primary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                        )}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="Experience"
                                                value={opt}
                                                checked={formData["Experience"] === opt}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FieldGroup>

                            <AnimatePresence>
                                {formData["Experience"] === "YES" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <FieldGroup label="Briefly describe your experience" required helper="e.g., job title, responsibilities, years of experience">
                                            <Textarea
                                                name="Describe Experience"
                                                value={formData["Describe Experience"]}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="EXAMPLE TEXT"
                                                className="min-h-[120px] bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                            />
                                        </FieldGroup>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Skills & Qualifications */}
                    <div>
                        <SectionTitle>Skills & Qualifications</SectionTitle>
                        <div className="grid gap-8">
                            <FieldGroup label="Do you have any certifications relevant to the position?" required helper="(e.g., food safety, first aid)">
                                <div className="grid grid-cols-2 gap-4">
                                    {['YES', 'NO'].map(opt => (
                                        <label key={opt} className={cn(
                                            "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-sm tracking-widest",
                                            formData["Certifications"] === opt ? "bg-fb-secondary border-fb-secondary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                        )}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="Certifications"
                                                value={opt}
                                                checked={formData["Certifications"] === opt}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FieldGroup>

                            <FieldGroup label="Please list any additional skills you think are relevant to this role" helper="(e.g., customer service, team management, food preparation)">
                                <Textarea
                                    name="Additional Skills"
                                    value={formData["Additional Skills"]}
                                    onChange={handleInputChange}
                                    placeholder="EXAMPLE TEXT"
                                    className="min-h-[100px] bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                />
                            </FieldGroup>
                        </div>
                    </div>

                    {/* Logistics */}
                    <div>
                        <SectionTitle>Logistics</SectionTitle>
                        <div className="grid gap-8">
                            <FieldGroup label="Are you legally authorized to work in the UK?" required>
                                <div className="grid grid-cols-2 gap-4">
                                    {['YES', 'NO'].map(opt => (
                                        <label key={opt} className={cn(
                                            "flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-black uppercase text-sm tracking-widest",
                                            formData["Logistics"] === opt ? "bg-fb-primary border-fb-primary text-white" : "bg-fb-surface-soft/30 border-transparent text-fb-secondary hover:border-fb-primary/30"
                                        )}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="Logistics"
                                                value={opt}
                                                checked={formData["Logistics"] === opt}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FieldGroup>

                            <FieldGroup label="How soon can you start if selected?" required>
                                <Input
                                    name="Start Availability"
                                    value={formData["Start Availability"]}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                    placeholder="EXAMPLE TEXT"
                                />
                            </FieldGroup>
                        </div>
                    </div>

                    {/* Extras */}
                    <div>
                        <SectionTitle>Extras</SectionTitle>
                        <div className="grid gap-8">
                            <FieldGroup label="Why do you want to work at Friez n Burgz?" required>
                                <Textarea
                                    name="Why?"
                                    value={formData["Why?"]}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="EXAMPLE TEXT"
                                    className="min-h-[120px] bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                />
                            </FieldGroup>

                            <FieldGroup label="Is there anything else you would like us to know about you?">
                                <Textarea
                                    name="Anything Else?"
                                    value={formData["Anything Else?"]}
                                    onChange={handleInputChange}
                                    className="min-h-[100px] bg-fb-surface-soft/30 border-2 border-transparent focus:border-fb-primary transition-all rounded-xl font-bold"
                                />
                            </FieldGroup>
                        </div>
                    </div>

                    <AnimatePresence>
                        {submitStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold rounded-xl text-center"
                            >
                                {errorMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-8 border-t-8 border-fb-surface-soft/50">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-20 text-3xl font-black uppercase font-fbHeading bg-fb-primary hover:bg-fb-secondary text-white rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? "SENDING..." : "JOIN THE TEAM!"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
