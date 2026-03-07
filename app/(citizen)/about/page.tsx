'use client';

import React from 'react';
import Link from 'next/link';

import {
    Wind,
    Satellite,
    BarChart2,
    Brain,
    FileText,
    ArrowRight,
    Github,
    Linkedin,
    ExternalLink,
    ShieldCheck,
    Zap,
    Globe,
    Database,
    Cloud,
    CheckCircle2,
    Info,
    Flame
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CountUp from 'react-countup';


const StatPill = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => (
    <div className="flex flex-col items-center px-8 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-teal-100 shadow-sm transition-all hover:shadow-md hover:scale-105">
        <div className="text-3xl font-bold text-teal-700">
            <CountUp end={value} duration={2.5} enableScrollSpy scrollSpyOnce />
            {suffix}
        </div>
        <div className="text-sm font-medium text-teal-600/80 uppercase tracking-wider">{label}</div>
    </div>
);

const StepCard = ({ number, title, description, icon: Icon }: { number: string; title: string; description: string; icon: any }) => (
    <div className="relative flex flex-col items-center text-center px-6 py-8 md:py-0">
        <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl shadow-teal-500/20 mb-6 transition-transform hover:scale-110">
            <Icon className="h-8 w-8" />
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold border-2 border-white">
                {number}
            </div>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">{description}</p>
    </div>
);

const DataSourceCard = ({ title, description, url, icon: Icon, badge }: { title: string; description: string; url: string; icon: any; badge?: string }) => (
    <div className="flex flex-col p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:border-teal-100 group">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
            </div>
            {badge && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-200">
                    {badge}
                </Badge>
            )}
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed mb-6 flex-grow">{description}</p>
        <a
            href={`https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
            {url} <ExternalLink className="ml-1 h-3 w-3" />
        </a>
    </div>
);

const TechChip = ({ label }: { label: string }) => (
    <span className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium border border-zinc-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all cursor-default">
        {label}
    </span>
);

export default function AboutPage() {
    return (
        <div className="flex flex-col overflow-hidden">
            {/* SECTION 1: HERO */}
            <section className="relative w-full py-24 lg:py-32 bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="mb-6 inline-flex items-center rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-700 border border-teal-200 animate-in fade-in slide-in-from-bottom-4">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Trusted Air Quality Intelligence
                    </div>
                    <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl mb-6">
                        AirSense: Intelligent Air Quality Intelligence for India
                    </h1>
                    <p className="max-w-2xl text-lg text-zinc-600 mb-12">
                        AirSense is an open civic-tech platform that monitors air pollution in real time, identifies pollution sources using AI, and empowers city administrators with actionable policy recommendations — ward by ward.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        <StatPill value={10} suffix="+" label="Cities Monitored" />
                        <StatPill value={100} suffix="%" label="Real-Time Updates" />
                        <StatPill value={50} suffix="+" label="AI-Powered Insights" />
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -z-10 translate-x-1/4 -translate-y-1/4 opacity-10">
                    <Wind className="w-96 h-96 text-teal-600" />
                </div>
            </section>

            {/* SECTION 2: THE PROBLEM */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-block px-3 py-1 rounded bg-zinc-100 text-zinc-800 text-xs font-bold uppercase tracking-wider">The Context</div>
                            <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">India's Air Quality Crisis</h2>
                            <div className="space-y-4 text-zinc-600 leading-relaxed">
                                <p>
                                    Air pollution is one of India's most pressing public health challenges. While national monitoring networks exist, they often lack the density required for hyper-local awareness. Pollution levels can vary significantly from one street corner to the next, yet policies are often based on city-wide averages.
                                </p>
                                <p>
                                    There is a critical gap between high-level reference monitors and actual neighborhood-level exposure. Without precise data on where pollution is coming from and how it moves across a city, both citizens and administrators are left in the dark.
                                </p>
                                <p>
                                    Citizens unknowingly commute through toxic hotspots, while city officials struggle to justify localized industrial or traffic restrictions without clear evidence. This lack of actionable data prevents the implementation of effective, ward-level interventions.
                                </p>
                                <p>
                                    AirSense was born to bridge this data gap. By combining multiple data streams—from the ground, the sky, and the weather—we create a comprehensive, real-time map of urban air quality that enables data-driven governance.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-sm p-8 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-inner">
                                <h4 className="text-center font-bold text-zinc-900 mb-8 uppercase tracking-widest text-sm">AQI Color Scale</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: "Good", range: "0 - 50", color: "#10B981" },
                                        { label: "Moderate", range: "51 - 100", color: "#F59E0B" },
                                        { label: "Unhealthy for Sensitive Groups", range: "101 - 150", color: "#F97316" },
                                        { label: "Unhealthy", range: "151 - 200", color: "#EF4444" },
                                        { label: "Very Unhealthy", range: "201 - 300", color: "#8B5CF6" },
                                        { label: "Hazardous", range: "301 - 500+", color: "#7F1D1D" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-12 h-8 rounded-lg shadow-sm" style={{ backgroundColor: item.color }} />
                                            <div className="flex-1 flex justify-between items-center pr-2">
                                                <span className="text-sm font-bold text-zinc-700">{item.label}</span>
                                                <span className="text-xs font-medium text-zinc-400">{item.range}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-8 text-center text-xs text-zinc-400 italic">
                                    The US EPA AQI scale used by AirSense
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: HOW IT WORKS */}
            <section className="py-24 bg-zinc-50 border-y border-zinc-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl mb-4">How it Works</h2>
                        <p className="max-w-2xl mx-auto text-zinc-500">
                            Our end-to-end intelligence pipeline transforms raw atmospheric data into actionable civic policy.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting line (Desktop) */}
                        <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-dashed-line border-t-2 border-dashed border-teal-200 -z-0" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <StepCard
                                number="1"
                                title="Data Collection"
                                icon={Satellite}
                                description="AirSense ingests real-time data from meteorological APIs and multiple satellite constellations — including Sentinel-5P for gaseous pollutants and NASA FIRMS for thermal fire detection."
                            />
                            <StepCard
                                number="2"
                                title="AQI Computation"
                                icon={BarChart2}
                                description="Raw pollutant concentrations are converted to AQI scores using the US EPA formula. A spatial interpolation algorithm (Inverse Distance Weighting) estimates AQI in areas between monitoring stations."
                            />
                            <StepCard
                                number="3"
                                title="AI Source Detection"
                                icon={Brain}
                                description="A machine learning classifier analyzes chemical fingerprints and temporal patterns to identify the likely source of pollution — traffic, construction dust, biomass burning, or industrial emissions."
                            />
                            <StepCard
                                number="4"
                                title="Policy Recommendations"
                                icon={FileText}
                                description="When anomalies are detected, a Retrieval-Augmented Generation (RAG) system powered by Claude AI synthesizes forecasts and source data to generate structured, actionable recommendations for administrators."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: DATA SOURCES & TRANSPARENCY */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl mb-4">Our Data Sources</h2>
                        <p className="max-w-2xl mx-auto text-zinc-500">
                            We aggregate data from a diverse network of ground stations, satellites, and meteorological services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                        <DataSourceCard
                            title="OpenAQ Network"
                            icon={Globe}
                            description="A global, open-source air quality data platform aggregating measurements from government monitoring stations. Used for ground-truth pollutant concentrations (PM2.5, PM10, NO₂, SO₂, O₃, CO)."
                            url="openaq.org"
                        />
                        <DataSourceCard
                            title="OpenWeatherMap / Open-Meteo"
                            icon={Cloud}
                            description="Meteorological data including wind speed, wind direction, temperature, humidity, and boundary layer height. Critical for dispersion modeling and 72-hour AQI forecasting."
                            url="openweathermap.org"
                        />
                        <DataSourceCard
                            title="Copernicus Sentinel-5P"
                            icon={Satellite}
                            description="ESA's Earth observation satellite providing high-resolution NO₂ tropospheric column data and aerosol optical depth. Used to estimate AQI in areas without ground stations."
                            url="sentinel.esa.int"
                        />
                        <DataSourceCard
                            title="NASA FIRMS"
                            icon={Flame}
                            description="NASA's Fire Information for Resource Management System. Provides near real-time thermal hotspots from MODIS and VIIRS satellites to track biomass burning."
                            url="firms.modaps.eosdis.nasa.gov"
                            badge="Critical"
                        />
                        <DataSourceCard
                            title="IoT Sensor Network"
                            icon={Database}
                            description="A planned dense grid of calibrated low-cost sensors across city wards for hyper-local, ground-level measurements. Integration in progress."
                            url="roadmap.airsense.in"
                            badge="Roadmap"
                        />
                    </div>

                    <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-zinc-100 shadow-sm">
                        <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
                            <Info className="h-4 w-4 text-teal-600" />
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Data Refresh Rate</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-zinc-100 font-bold text-zinc-700">
                                    <tr>
                                        <th className="px-6 py-4">Source</th>
                                        <th className="px-6 py-4">Update Frequency</th>
                                        <th className="px-6 py-4">Coverage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 text-zinc-600">
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">OpenAQ</td>
                                        <td className="px-6 py-4">Every 15 minutes</td>
                                        <td className="px-6 py-4">Available stations</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">Meteorological</td>
                                        <td className="px-6 py-4">Every 15 minutes</td>
                                        <td className="px-6 py-4">All locations</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">Satellite (Sentinel-5P)</td>
                                        <td className="px-6 py-4">Daily</td>
                                        <td className="px-6 py-4">India-wide</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">NASA FIRMS (Thermal)</td>
                                        <td className="px-6 py-4">Every 3 hours</td>
                                        <td className="px-6 py-4">Global/National</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">Interpolated estimates</td>
                                        <td className="px-6 py-4">Every 15 minutes</td>
                                        <td className="px-6 py-4">Gap-filled</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 mb-6 text-center">
                            <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 font-bold px-8">
                                <Link href="/data-sources">
                                    Explore Detailed Methodology <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: FOR ADMINISTRATORS */}
            <section className="py-24 bg-teal-600 text-white overflow-hidden relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl font-bold md:text-4xl mb-6">Designed for City Administrators</h2>
                    <p className="max-w-3xl mx-auto text-teal-50 text-lg leading-relaxed mb-10">
                        AirSense provides a secure, role-based dashboard for municipal administrators and pollution control officials. City-level admins see ward-by-ward data for their jurisdiction. Central administrators can monitor all cities across India. No manual data collection required — the platform delivers automated anomaly detection and AI-generated policy briefs directly to your dashboard.
                    </p>
                    <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-bold px-8 shadow-xl">
                        <a href="mailto:admin@airsense.in?subject=Admin Access Request">
                            Request Admin Access <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                    </Button>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 opacity-20 transform -rotate-12">
                    <div className="w-96 h-96 border-[40px] border-white rounded-full" />
                </div>
                <div className="absolute top-0 right-0 opacity-10">
                    <Wind className="w-80 h-80" />
                </div>
            </section>

            {/* SECTION 6: TECHNOLOGY STACK */}
            <section className="py-24 bg-white border-b border-zinc-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-12">Built with Modern, Open Technologies</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            "Next.js", "TypeScript", "Supabase", "Mapbox GL JS",
                            "Apache Kafka (roadmap)", "Anthropic Claude", "Sentinel Hub",
                            "OpenAQ", "Recharts", "Tailwind CSS", "Vercel", "PostgreSQL"
                        ].map((tech) => (
                            <TechChip key={tech} label={tech} />
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 7: BUILT BY */}
            <section className="py-24 bg-zinc-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-teal-600 text-white flex items-center justify-center text-3xl font-extrabold mb-6 shadow-lg shadow-teal-500/20">
                            BP
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900">Bibhu Pradhan</h3>
                        <p className="text-teal-600 font-semibold mb-4 underline decoration-teal-200 underline-offset-4 decoration-2">Software Developer & GenAI Enthusiast</p>
                        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                            Passionate about building technology that creates meaningful impact in society. AirSense is a vision to bridge the gap between environmental data and actionable civic governance.
                        </p>
                        <div className="flex gap-4">
                            <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200">
                                <a href="https://github.com/bibhupradhanofficial" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200">
                                <a href="https://www.linkedin.com/in/bibhupradhanofficial/" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 8: FAQ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl mb-4">Frequently Asked Questions</h2>
                        <p className="text-zinc-500">
                            Everything you need to know about our methodology and data.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-zinc-100 px-4 transition-all hover:bg-zinc-50/50">
                            <AccordionTrigger className="text-left font-bold text-zinc-900 hover:text-teal-600 no-underline py-6">
                                Is AirSense data accurate?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed pb-6">
                                AirSense aggregates data from established sources like the OpenAQ network and ESA's Sentinel-5P satellite. In areas with active ground monitoring stations, accuracy is high. In interpolated zones (areas between stations), data is an AI-based estimate and should be treated as indicative rather than reference-grade.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border-zinc-100 px-4 transition-all hover:bg-zinc-50/50">
                            <AccordionTrigger className="text-left font-bold text-zinc-900 hover:text-teal-600 no-underline py-6">
                                How is AQI calculated?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed pb-6">
                                AirSense uses the US EPA AQI formula, which computes a sub-index for each pollutant (PM2.5, PM10, NO₂, SO₂, CO, O₃) and reports the highest sub-index as the final AQI score. This is the same methodology used by CPCB India.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border-zinc-100 px-4 transition-all hover:bg-zinc-50/50">
                            <AccordionTrigger className="text-left font-bold text-zinc-900 hover:text-teal-600 no-underline py-6">
                                Do I need to create an account to use AirSense?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed pb-6">
                                No. The citizen portal is fully public. You can check AQI for any location in India without logging in. Accounts are only required for city administrators accessing the management dashboard.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border-zinc-100 px-4 transition-all hover:bg-zinc-50/50">
                            <AccordionTrigger className="text-left font-bold text-zinc-900 hover:text-teal-600 no-underline py-6">
                                How often is the data updated?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed pb-6">
                                AQI readings are refreshed every 15 minutes from ground station networks and meteorological APIs. Satellite-derived data updates once per day.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5" className="border-zinc-100 px-4 transition-all hover:bg-zinc-50/50">
                            <AccordionTrigger className="text-left font-bold text-zinc-900 hover:text-teal-600 no-underline py-6">
                                My location's AQI seems incorrect. What should I do?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed pb-6">
                                If your area does not have an active ground monitoring station, AirSense uses spatial interpolation and satellite estimates, which can have higher uncertainty. You can submit a data issue by emailing <a href="mailto:feedback@airsense.in" className="text-teal-600 hover:underline">feedback@airsense.in</a>.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6" className="border-zinc-100 px-4 transition-all hover:bg-zinc-50/50">
                            <AccordionTrigger className="text-left font-bold text-zinc-900 hover:text-teal-600 no-underline py-6">
                                Will IoT sensors be added?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed pb-6">
                                Yes. IoT ground-sensor integration is on our roadmap and will provide hyper-local, ward-level accuracy. The current platform is designed to incorporate IoT data seamlessly once deployed.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-7" className="border-zinc-100 px-4 transition-all hover:bg-zinc-50/50">
                            <AccordionTrigger className="text-left font-bold text-zinc-900 hover:text-teal-600 no-underline py-6">
                                How does AirSense track crop burning?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed pb-6">
                                We integrate with the NASA FIRMS (Fire Information for Resource Management System) satellite feed to detect thermal anomalies in real-time. By cross-referencing these fire hotspots with wind patterns, we can accurately determine when a pollution spike in a city like Delhi is caused by stubble burning hundreds of kilometers away.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-zinc-50 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-zinc-900 mb-8">Ready to check your local air?</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8">
                            <Link href="/search">Search Locations</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50 font-bold px-8">
                            <Link href="/health-guide">Health Guide</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
