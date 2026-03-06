import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wind, Github } from 'lucide-react';

export default function CitizenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-[#FAFAFA] font-sans text-zinc-900">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-500/20">
                                <Wind className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-zinc-900">
                                Air<span className="text-teal-600">Sense</span>
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-8 md:flex text-nowrap">
                        <Link href="/" className="text-sm font-semibold text-zinc-600 hover:text-teal-600 transition-colors">Home</Link>
                        <Link href="/search" className="text-sm font-semibold text-zinc-600 hover:text-teal-600 transition-colors">Search</Link>
                        <Link href="/health-guide" className="text-sm font-semibold text-zinc-600 hover:text-teal-600 transition-colors">Health Guide</Link>
                        <Link href="/data-sources" className="text-sm font-semibold text-zinc-600 hover:text-teal-600 transition-colors">Data Sources</Link>
                        <Link href="/about" className="text-sm font-semibold text-zinc-600 hover:text-teal-600 transition-colors">About</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button className="bg-teal-600 font-semibold text-white hover:bg-teal-700 shadow-md shadow-teal-600/10">Get AirSense</Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 bg-white py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                                <Wind className="h-6 w-6 text-teal-600" />
                                <span className="text-xl font-bold tracking-tight">AirSense</span>
                            </div>
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
                                Empowering citizens with real-time, hyper-local air quality insights for a healthier, more sustainable urban life.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Resources</h3>
                            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                                <li><Link href="/about" className="hover:text-teal-600 transition-colors">About AirSense</Link></li>
                                <li><Link href="/data-sources" className="hover:text-teal-600 transition-colors">Data Sources</Link></li>
                                <li><Link href="/health-guide" className="hover:text-teal-600 transition-colors">Health Information</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Connect</h3>
                            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                                <li>
                                    <a href="https://github.com" className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                                        <Github className="h-4 w-4" /> GitHub Project
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-zinc-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-zinc-400">
                            © {new Date().getFullYear()} AirSense. All data provided for informational purposes.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-teal-600 transition-colors">
                                City administrators: access your dashboard at /dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
