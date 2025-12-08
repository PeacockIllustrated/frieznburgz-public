'use client'

import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import Link from "next/link"
import { MENU_ITEMS, LOCATIONS, CHICKEN_FLAVOURS } from "@/lib/data"
import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function HomePage() {
    return (
        <div className="flex flex-col gap-16 pb-20">
            {/* Breakfast Hero - Untouched as requested */}
            <section className="relative flex flex-col items-center justify-center gap-6 py-24 md:py-32 text-center bg-white border-b-4 border-fb-secondary overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-5"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 space-y-4 max-w-3xl"
                >
                    <span className="inline-block bg-fb-secondary text-white text-lg px-4 py-1 mb-4 rounded-full animate-pulse font-bold">NEW!</span>
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

            <div className="container space-y-24">

                {/* Seasonal Specials */}
                <section>
                    <SectionHeader className="text-center md:text-left pl-4 text-fb-primary">Seasonal Specialz</SectionHeader>
                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <span className="text-6xl font-black text-fb-primary font-fbHeading mb-2">£13</span>
                            <span className="text-xl font-bold text-fb-text uppercase tracking-widest text-center">Both served with Gravy, Brie & Bacon Jam Friez</span>
                        </div>
                        <div className="grid gap-12 md:grid-cols-2">
                            {MENU_ITEMS.filter(i => i.category === 'Seasonal Specials').map(item => (
                                <div key={item.id} className="flex flex-col items-center text-center space-y-4">
                                    <h3 className="text-4xl font-black text-fb-text uppercase font-fbHeading">{item.name}</h3>
                                    <p className="text-xl font-medium text-fb-muted max-w-md">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Beef Burgz */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Beef Burgz</h2>
                        </div>
                        <div className="text-3xl font-bold text-fb-primary px-6 py-3 rounded-xl transform -rotate-1 border-2 border-fb-primary">
                            £8.50 <span className="text-lg font-normal text-fb-primary/90 block md:inline md:ml-2">(+ friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Beef Burgz').map(item => (
                            <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft pb-4">
                                <h3 className="text-2xl font-black text-fb-text uppercase">{item.name}</h3>
                                <p className="text-fb-muted font-bold text-lg leading-tight">{item.description}</p>
                                {item.is_spicy && <span className="text-fb-primary font-black uppercase text-sm mt-1">Spicy</span>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Chix Burgz */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-black font-fbHeading text-fb-secondary uppercase tracking-wide">Chix Burgz</h2>
                        </div>
                        <div className="text-3xl font-bold text-fb-text bg-fb-surface px-6 py-3 rounded-xl transform rotate-1">
                            £8.50 <span className="text-lg font-normal text-fb-text/80 block md:inline md:ml-2">(+ friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Chix Burgz').map(item => (
                            <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft pb-4">
                                <h3 className="text-2xl font-black text-fb-text uppercase">{item.name}</h3>
                                <p className="text-fb-muted font-bold text-lg leading-tight">{item.description}</p>
                                {item.is_spicy && <span className="text-fb-primary font-black uppercase text-sm mt-1">Spicy</span>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Upgrades Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Add Inside */}
                    <div className="p-6">
                        <h3 className="text-3xl font-black uppercase mb-6 font-fbHeading">Add Inside</h3>
                        <div className="space-y-3">
                            {MENU_ITEMS.filter(i => i.category === 'Add Inside Your Burger').map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft last:border-0 pb-2">
                                    <span className="font-bold text-lg">{item.name}</span>
                                    <span className="font-mono font-bold text-fb-primary text-xl">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vegetarian/Upgrade Box */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-fb-surface-soft text-fb-text rounded-3xl p-8 flex-1 flex flex-col justify-center text-center">
                            <h3 className="text-3xl font-black uppercase font-fbHeading mb-2">Vegetarian Option</h3>
                            <p className="text-2xl font-bold">Swap any beef with <br /><span className="text-fb-primary text-3xl">Oumi Cheeze</span></p>
                            <p className="mt-4 text-4xl font-black">£6.50</p>
                        </div>
                    </div>
                </div>

                {/* Sides & Chicken Section */}
                <section>
                    <SectionHeader className="text-fb-primary pl-4">Sides & Chicken</SectionHeader>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Chicken List - Split into 3 Columns */}
                        <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
                            {/* Chix Bitez */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase text-fb-secondary font-fbHeading border-b-2 border-fb-secondary pb-1">Chix Bitez</h3>
                                <div className="space-y-3">
                                    {MENU_ITEMS.filter(i => i.category === 'Sides' && i.name.includes('Chix Bitez')).map(item => (
                                        <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft last:border-0 pb-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xl font-bold text-fb-text">{item.name.replace('Chix Bitez ', '')}</span>
                                                <span className="text-xl font-black text-fb-primary">£{item.price?.toFixed(2)}</span>
                                            </div>
                                            {item.description && <span className="text-sm text-fb-muted font-medium">{item.description}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Filletz */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase text-fb-secondary font-fbHeading border-b-2 border-fb-secondary pb-1">Filletz</h3>
                                <div className="space-y-3">
                                    {MENU_ITEMS.filter(i => i.category === 'Sides' && i.name.includes('Filletz')).map(item => (
                                        <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft last:border-0 pb-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xl font-bold text-fb-text">{item.name.replace('Filletz ', '')}</span>
                                                <span className="text-xl font-black text-fb-primary">£{item.price?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Oumi Cheeze */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase text-fb-secondary font-fbHeading border-b-2 border-fb-secondary pb-1">Oumi Cheeze</h3>
                                <div className="space-y-3">
                                    {MENU_ITEMS.filter(i => i.category === 'Sides' && i.name.includes('Oumi Cheeze')).map(item => (
                                        <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft last:border-0 pb-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xl font-bold text-fb-text">{item.name.replace('Oumi Cheeze ', '')}</span>
                                                <span className="text-xl font-black text-fb-primary">£{item.price?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Flavours Panel */}
                        <div className="bg-fb-text text-white p-8 rounded-3xl shadow-xl h-fit">
                            <h3 className="text-4xl font-black uppercase font-fbHeading mb-2 text-fb-secondary leading-none">Choose Your<br />Flavour</h3>
                            <div className="space-y-6 mt-8">
                                <div>
                                    <h4 className="font-bold underline text-lg mb-2 text-white/80">SAUCY</h4>
                                    <ul className="space-y-1 font-bold text-xl">
                                        {CHICKEN_FLAVOURS.saucy.map(f => <li key={f}>{f}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold underline text-lg mb-2 text-white/80">DRY</h4>
                                    <ul className="space-y-1 font-bold text-xl">
                                        {CHICKEN_FLAVOURS.dry.map(f => <li key={f}>{f}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Friez Section */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-black font-fbHeading text-fb-secondary uppercase tracking-wide">Friez</h2>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-black uppercase mb-4">The Friez</h3>
                            <div className="space-y-4">
                                {MENU_ITEMS.filter(i => i.category === 'Friez').map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b-2 border-fb-surface-soft pb-2">
                                        <span className="text-xl font-bold uppercase">{item.name}</span>
                                        <span className="text-xl font-black text-fb-primary">£{item.price?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase mb-4">Add To Box</h3>
                            <div className="space-y-4">
                                {MENU_ITEMS.filter(i => i.category === 'Add Into Your Box').map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b-2 border-fb-surface-soft pb-2">
                                        <span className="text-xl font-bold uppercase">{item.name}</span>
                                        <span className="text-xl font-black text-fb-primary">£{item.price?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kidz Menu */}
                <section className="p-10">
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <h2 className="text-5xl font-black font-fbHeading text-fb-text uppercase">Kidz Menu</h2>
                        <span className="text-5xl font-black text-fb-primary">£6</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto text-center">
                        {MENU_ITEMS.filter(i => i.category === 'Kidz Menu').map(item => (
                            <div key={item.id} className="flex flex-col items-center">
                                <p className="text-3xl font-black uppercase text-fb-secondary mb-1">{item.description}</p>
                                <p className="text-xl font-bold text-fb-muted">+ Friez</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Desserts */}
                <section>
                    <SectionHeader>Dessertz</SectionHeader>
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Cheesecakes */}
                        <div className="p-6">
                            <div className="flex justify-between items-end mb-6 border-b-2 border-fb-text pb-2">
                                <h3 className="text-3xl font-black font-fbHeading">Cheesecakez</h3>
                                <span className="text-2xl font-bold text-fb-primary">£4.50</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {MENU_ITEMS.filter(i => i.category === 'Cheesecakez').map(item => (
                                    <div key={item.id} className="bg-fb-surface p-3 rounded-lg text-center font-bold uppercase text-lg">
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Milkshakes */}
                        <div className="p-6">
                            <div className="flex justify-between items-end mb-6 border-b-2 border-fb-text pb-2">
                                <h3 className="text-3xl font-black font-fbHeading">Milkshakez</h3>
                                <div className="text-right leading-none">
                                    <span className="block text-sm font-bold text-fb-muted">REG / LRG</span>
                                    <span className="text-2xl font-bold text-fb-primary">3.50 / 4.50</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {MENU_ITEMS.filter(i => i.category === 'Milkshakez' && !i.name.includes('Special')).map(item => (
                                    <div key={item.id} className="bg-fb-surface p-3 rounded-lg text-center font-bold uppercase text-lg">
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Special Shake */}
                    <div className="mt-8 bg-fb-surface rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
                        {MENU_ITEMS.filter(i => i.name === 'The Biscoff Shake').map(item => (
                            <div key={item.id} className="flex-1 text-center md:text-left">
                                <h3 className="text-4xl font-black font-fbHeading text-fb-primary uppercase mb-2">Special: {item.name}</h3>
                                <p className="text-xl font-bold text-fb-muted mb-4">{item.description}</p>
                                <div className="inline-block bg-white px-6 py-2 rounded-full border-2 border-fb-primary text-fb-primary font-black text-2xl shadow-sm">
                                    £{item.price?.toFixed(2)} / £5.50
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Breakfast (Original) */}
                <section id="breakfast" className="space-y-8 pt-12">
                    <div className="text-center">
                        <h2 className="text-6xl font-black font-fbHeading text-fb-secondary uppercase tracking-wide mb-2">Breakfast Burgz!</h2>
                        <p className="text-2xl text-fb-text font-bold">CHOOSE YOUR BASE £4 • TOPPED WITH AMERICAN SLICES</p>
                    </div>
                    <div className="p-10 text-center max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold text-fb-text mb-4">Add Extra Toppings</h3>
                        <p className="text-6xl font-black text-fb-secondary font-fbHeading">£1.50 EACH</p>
                        <p className="text-fb-muted mt-4 font-bold text-xl">(See in-store for full selection)</p>
                    </div>
                    <div className="space-y-6">
                        <SectionHeader className="text-center">Hot Drinks</SectionHeader>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {MENU_ITEMS.filter(i => i.category === 'Hot Drinks').map(item => (
                                <div key={item.id} className="flex justify-between items-center p-4 rounded-xl border border-fb-surface-soft hover:border-fb-text transition-colors">
                                    <span className="font-bold">{item.name}</span>
                                    <span className="text-fb-muted font-bold">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Locations */}
                <section className="container pb-20 pt-12 text-center">
                    <SectionHeader className="text-center mb-12">Locations</SectionHeader>
                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                        {LOCATIONS.map((loc) => (
                            <div key={loc.name} className="flex flex-col gap-4">
                                <h3 className="text-2xl text-fb-primary font-black uppercase tracking-wide">{loc.name}</h3>
                                <div className="space-y-4">
                                    <p className="text-fb-text font-bold text-lg">{loc.address}</p>
                                    <div className="text-sm text-fb-muted space-y-1 font-medium">
                                        <p>12–9pm | Mon–Sat</p>
                                        <p>9–11am | Fri–Sat (Breakfast)</p>
                                        <p>2–9pm | Sun</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
