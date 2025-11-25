'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SectionHeader } from "@/components/ui/section-header"
import Link from "next/link"
import { MENU_ITEMS, LOCATIONS } from "@/lib/data"
import { motion } from "framer-motion"

export default function HomePage() {
    const promotedSpecials = [
        {
            title: "THE SLOPPY JOE BURGZ",
            description: "7oz beef patty with sloppy joe mix, multiple cheeses, jalapeños, crispy onions, loaded friez, etc.",
            price: 13.00,
            image: "/placeholder-sloppy-joe.jpg" // Placeholder
        },
        {
            title: "GARLIC PARM BITEZ",
            description: "Bite-sized garlic-parm pieces.",
            price: 5.50,
            subtitle: "+ friez for £2.50"
        },
        {
            title: "THE BISCOFF SHAKE",
            description: "Biscuit caramel shake with cream and crushed biscuits.",
            price: 5.50,
            priceLarge: 6.50
        }
    ]

    return (
        <div className="flex flex-col gap-16 pb-20">
            {/* Breakfast Hero */}
            <section className="relative flex flex-col items-center justify-center gap-6 py-24 md:py-32 text-center bg-white border-b-4 border-fb-secondary overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 space-y-4 max-w-3xl"
                >
                    <Badge variant="secondary" className="text-lg px-4 py-1 mb-4 animate-pulse">NEW!</Badge>
                    <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter font-fbHeading text-fb-primary leading-none drop-shadow-sm">
                        Breakfast <span className="text-fb-text">Hero</span>
                    </h1>
                    <div className="bg-fb-surface p-6 rounded-xl border-2 border-fb-surface-soft inline-block shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300">
                        <p className="text-2xl md:text-3xl font-bold text-fb-secondary font-fbHeading uppercase tracking-wide">
                            Now doing BREAKFAST!
                        </p>
                        <p className="text-xl text-fb-text mt-2 font-fbBody font-bold">
                            fri–sat | 9am–11am
                        </p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="relative z-10 mt-4"
                >
                    <Button asChild size="lg" className="text-xl px-10 py-8 shadow-xl shadow-fb-primary/20 hover:scale-105 transition-transform bg-fb-primary text-white hover:bg-fb-primary/90">
                        <Link href="#breakfast">View Breakfast Menu</Link>
                    </Button>
                </motion.div>
            </section>

            {/* Promoted Specials */}
            <section className="container">
                <SectionHeader className="text-center md:text-left border-l-8 border-fb-primary pl-4">Don't Miss These</SectionHeader>
                <div className="grid gap-8 md:grid-cols-3">
                    {promotedSpecials.map((special, idx) => (
                        <Card key={idx} variant="brand" className="group h-full flex flex-col overflow-hidden">
                            <div className="h-48 bg-black/20 flex items-center justify-center relative overflow-hidden">
                                <span className="text-white/20 font-fbHeading text-4xl uppercase rotate-12 transform">Image</span>
                            </div>
                            <CardHeader className="relative -mt-12 pt-0">
                                <div className="bg-fb-secondary text-fb-text px-4 py-1 rounded-full inline-block text-sm font-bold uppercase tracking-wider mb-2 shadow-lg">
                                    Special
                                </div>
                                <CardTitle className="text-3xl text-white group-hover:text-fb-accent transition-colors">
                                    {special.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1">
                                <p className="text-white/90 text-lg leading-relaxed font-medium">{special.description}</p>
                            </CardContent>
                            <div className="p-6 pt-0 mt-auto border-t border-white/10">
                                <div className="flex items-end justify-between pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-bold text-fb-accent font-fbHeading">£{special.price.toFixed(2)}</span>
                                        {special.priceLarge && <span className="text-sm text-white/80">Large: £{special.priceLarge.toFixed(2)}</span>}
                                    </div>
                                    {special.subtitle && <Badge className="bg-fb-accent text-fb-text hover:bg-white">{special.subtitle}</Badge>}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Main Menu */}
            <section id="menu" className="container space-y-24">

                {/* Beef Burgz */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-fb-primary pb-4">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-bold font-fbHeading text-fb-primary uppercase tracking-wide">Beef Burgz</h2>
                            <p className="text-fb-muted text-xl mt-2 font-bold">All “burgz” are doubled & smashed.</p>
                        </div>
                        <div className="text-3xl font-bold text-white bg-fb-primary px-6 py-3 rounded-xl shadow-lg transform -rotate-2">
                            £8.50 <span className="text-lg font-normal text-white/90 block md:inline md:ml-2">(includes friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Beef Burgz').map(item => (
                            <Card key={item.id} variant="brand" className="hover:scale-[1.02] transition-transform">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-fb-accent">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/90 font-medium text-lg">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Chix Burgz */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-fb-secondary pb-4">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-bold font-fbHeading text-fb-secondary uppercase tracking-wide">Chix Burgz</h2>
                        </div>
                        <div className="text-3xl font-bold text-fb-text bg-fb-secondary px-6 py-3 rounded-xl shadow-lg transform rotate-1">
                            £8.50 <span className="text-lg font-normal text-fb-text/80 block md:inline md:ml-2">(includes friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Chix Burgz').map(item => (
                            <Card key={item.id} variant="brand" className="hover:scale-[1.02] transition-transform">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-fb-accent">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/90 font-medium text-lg">{item.description}</p>
                                    {item.is_spicy && <Badge variant="destructive" className="mt-2 bg-white text-fb-primary font-bold">Spicy</Badge>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Vegetarian Option */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-fb-success text-white rounded-3xl p-10 text-center shadow-xl"
                >
                    <h3 className="text-3xl font-bold uppercase font-fbHeading mb-2">Vegetarian Option</h3>
                    <p className="text-2xl">Swap any meat for <span className="font-bold text-fb-accent">Halloumi / “oumi” cheese</span> – £6.50</p>
                </motion.div>

                {/* Add Inside / Meat Boost */}
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <SectionHeader className="text-3xl border-b-4 border-fb-text inline-block pb-2">Add Inside Your Burger</SectionHeader>
                        <div className="bg-white rounded-xl p-6 border-2 border-fb-surface-soft space-y-4 shadow-lg">
                            {MENU_ITEMS.filter(i => i.category === 'Add Inside Your Burger').map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft last:border-0 pb-3 last:pb-0">
                                    <div>
                                        <span className="font-bold text-fb-text text-lg">{item.name}</span>
                                        {item.description && <span className="block text-sm text-fb-muted">{item.description}</span>}
                                    </div>
                                    <span className="font-mono font-bold text-fb-primary text-xl">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <SectionHeader className="text-3xl border-b-4 border-fb-text inline-block pb-2">Add Into Your Box</SectionHeader>
                        <div className="bg-white rounded-xl p-6 border-2 border-fb-surface-soft space-y-4 shadow-lg">
                            {MENU_ITEMS.filter(i => i.category === 'Add Into Your Box').map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft last:border-0 pb-3 last:pb-0">
                                    <span className="font-bold text-fb-text text-lg">{item.name}</span>
                                    <span className="font-mono font-bold text-fb-primary text-xl">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desserts & Shakes */}
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <SectionHeader className="text-fb-primary">Cheesecakez</SectionHeader>
                        <div className="grid gap-4">
                            {MENU_ITEMS.filter(i => i.category === 'Cheesecakez').map(item => (
                                <Card key={item.id} className="flex items-center justify-between p-4 bg-fb-surface border-2 border-fb-surface-soft hover:border-fb-primary transition-colors">
                                    <span className="font-bold text-lg">{item.name}</span>
                                    <span className="font-bold text-fb-primary text-xl">£{item.price?.toFixed(2)}</span>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <SectionHeader className="text-fb-primary">Milkshakez</SectionHeader>
                        <div className="grid gap-4">
                            {MENU_ITEMS.filter(i => i.category === 'Milkshakez').map(item => (
                                <Card key={item.id} className="flex items-center justify-between p-4 bg-fb-surface border-2 border-fb-surface-soft hover:border-fb-primary transition-colors">
                                    <div>
                                        <span className="font-bold text-lg block">{item.name}</span>
                                        {item.description && <span className="text-xs text-fb-muted">{item.description}</span>}
                                    </div>
                                    <span className="font-bold text-fb-primary text-xl">£{item.price?.toFixed(2)}</span>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Extra Sauce */}
                <div className="space-y-6">
                    <SectionHeader>Extra Sauce</SectionHeader>
                    <div className="flex flex-wrap gap-4">
                        {MENU_ITEMS.filter(i => i.category === 'Extra Sauce').map(item => (
                            <Badge key={item.id} variant="outline" className="text-lg py-3 px-6 border-2 border-fb-surface-soft hover:bg-fb-primary hover:text-white hover:border-fb-primary transition-colors cursor-default rounded-full">
                                {item.name} <span className="ml-2 font-bold opacity-80">£{item.price?.toFixed(2)}</span>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Breakfast Section */}
                <section id="breakfast" className="space-y-8 pt-12 border-t-4 border-fb-surface-soft">
                    <div className="text-center">
                        <h2 className="text-6xl font-bold font-fbHeading text-fb-secondary uppercase tracking-wide mb-2">Breakfast Burgz!</h2>
                        <p className="text-2xl text-fb-text font-bold">CHOOSE YOUR BASE £4 • TOPPED WITH AMERICAN SLICES</p>
                    </div>
                    <div className="bg-fb-surface rounded-3xl p-10 border-4 border-fb-secondary text-center max-w-2xl mx-auto shadow-2xl">
                        <h3 className="text-3xl font-bold text-fb-text mb-4">Add Extra Toppings</h3>
                        <p className="text-6xl font-bold text-fb-secondary font-fbHeading">£1.50 EACH</p>
                        <p className="text-fb-muted mt-4 font-bold text-xl">(See in-store for full selection)</p>
                    </div>
                </section>

                {/* Hot Drinks */}
                <div className="space-y-6">
                    <SectionHeader>Hot Drinks</SectionHeader>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {MENU_ITEMS.filter(i => i.category === 'Hot Drinks').map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-fb-surface p-4 rounded-xl border-2 border-fb-surface-soft hover:border-fb-text transition-colors">
                                <span className="font-bold">{item.name}</span>
                                <span className="text-fb-muted font-bold">£{item.price?.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews & Socials */}
            <section className="bg-fb-text text-white py-24 mt-12">
                <div className="container px-4 text-center space-y-12">
                    <SectionHeader className="text-center mb-0 text-white">What People Say</SectionHeader>
                    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                        <Card className="bg-fb-surface-soft border-none text-fb-bg">
                            <CardContent className="pt-8">
                                <div className="flex justify-center mb-4 text-fb-secondary">
                                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-3xl">★</span>)}
                                </div>
                                <p className="text-xl italic text-fb-text/80">"Best burgers in the North East. Hands down."</p>
                                <p className="mt-6 font-bold text-fb-text text-lg">- Google Review</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-fb-surface-soft border-none text-fb-bg">
                            <CardContent className="pt-8">
                                <div className="flex justify-center mb-4 text-fb-secondary">
                                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-3xl">★</span>)}
                                </div>
                                <p className="text-xl italic text-fb-text/80">"That Biscoff shake changed my life."</p>
                                <p className="mt-6 font-bold text-fb-text text-lg">- Facebook Review</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-center gap-6 pt-8">
                        <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white hover:text-fb-text">
                            <Link href="https://facebook.com" target="_blank">Facebook</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white hover:text-fb-text">
                            <Link href="https://instagram.com" target="_blank">Instagram</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Locations */}
            <section className="container pb-20">
                <SectionHeader className="text-center">Locations</SectionHeader>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {LOCATIONS.map((loc) => (
                        <Card key={loc.name} className="text-center hover:border-fb-primary transition-colors border-2">
                            <CardHeader>
                                <CardTitle className="text-2xl text-fb-primary">{loc.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-fb-text font-bold text-lg">{loc.address}</p>
                                <div className="text-sm text-fb-muted space-y-1 font-medium">
                                    <p>12–9pm | Mon–Sat</p>
                                    <p>9–11am | Fri–Sat (Breakfast)</p>
                                    <p>2–9pm | Sun</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
