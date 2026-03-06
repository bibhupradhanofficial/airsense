'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Database,
    Globe,
    Cloud,
    Satellite,
    Cpu,
    ShieldCheck,
    Zap,
    CheckCircle2,
    Info,
    ArrowRight,
    Search,
    BarChart3,
    Layers,
    Activity,
    Lock,
    Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

const SourceCard = ({ title, description, icon: Icon, badge, details, link }: { title: string; description: string; icon: any; badge?: string; details: string[]; link?: string }) => (
    <motion.div variants={itemVariants}>
        <Card className="h-full overflow-hidden border-zinc-100 bg-white/50 backdrop-blur-md transition-all hover:shadow-xl hover:border-teal-100 group">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                        <Icon className="h-6 w-6" />
                    </div>
                    {badge && (
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700 font-bold px-3 py-1">
                            {badge}
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-2xl font-bold text-zinc-900 group-hover:text-teal-700 transition-colors uppercase tracking-tight">{title}</CardTitle>
                <CardDescription className="text-zinc-500 text-base leading-relaxed mt-2">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3 mb-6">
                    {details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600">
                            <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                            <span>{detail}</span>
                        </li>
                    ))}
                </ul>
                {link && (
                    <Button variant="ghost" className="p-0 h-auto text-teal-600 hover:text-teal-700 hover:bg-transparent font-bold flex items-center gap-2 group/btn" asChild>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                            Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

export default function DataSourcesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-teal-50/50 py-24 sm:py-32">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.teal.100),transparent)]" />
                <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-teal-600/10 ring-1 ring-teal-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center rounded-full bg-teal-100 px-4 py-1.5 text-sm font-bold text-teal-800 border border-teal-200 shadow-sm mb-8"
                    >
                        <Lock className="mr-2 h-4 w-4 text-teal-600" /> Transparent & Verified Data
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl mb-8 leading-[1.1]"
                    >
                        How we monitor <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">your city's air.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-3xl mx-auto text-xl text-zinc-600 leading-relaxed mb-12"
                    >
                        AirSense doesn't just guess. We synthesize ground-level measurements, satellite imagery, and meteorological models using advanced AI to deliver the most accurate hyper-local AQI in India.
                    </motion.p>
                </div>

                {/* Decorative background icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 opacity-[0.03] blur-3xl">
                    <Database className="w-[800px] h-[800px] text-teal-900" />
                </div>
            </section>

            {/* Core Sources Grid */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center mb-20">
                        <Badge className="mb-4 bg-zinc-100 text-zinc-500 border-zinc-200 font-bold tracking-widest uppercase py-1 px-4">Our Multi-Modal Approach</Badge>
                        <h2 className="text-3xl font-extrabold text-zinc-900 md:text-5xl tracking-tight">Triple-Verified Intelligence</h2>
                        <p className="mt-6 text-lg text-zinc-500 max-w-2xl leading-relaxed">
                            By combining official reference data with satellite observation and low-cost sensor networks, we eliminate blind spots in urban monitoring.
                        </p>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <SourceCard
                            title="Reference Monitors"
                            description="Direct integration with official regulatory-grade monitoring stations across the country."
                            icon={Globe}
                            badge="Gold Standard"
                            details={[
                                "CPCB (Central Pollution Control Board) nodes",
                                "Continuous Monitoring Stations (CAAQMS)",
                                "High-precision chemical analyzers",
                                "15-minute refresh cycle"
                            ]}
                            link="https://openaq.org"
                        />
                        <SourceCard
                            title="Sentinel-5P Satellite"
                            icon={Satellite}
                            description="ESA's Earth observation eyes providing vertical column density for gaseous pollutants."
                            badge="Space-Grade"
                            details={[
                                "TROPOMI high-resolution spectrometer",
                                "Detection of NO₂, SO₂, O₃ and Formaldehyde",
                                "Aerosol Optical Depth (AOD) mapping",
                                "Global coverage for gap-filling"
                            ]}
                            link="https://sentinel.esa.int/web/sentinel/missions/sentinel-5p"
                        />
                        <SourceCard
                            title="NASA FIRMS Satellite"
                            icon={Flame}
                            description="Real-time thermal detection of active fires and agricultural burning via MODIS and VIIRS."
                            badge="Critical-Alert"
                            details={[
                                "Active hotspot detection (375m/1km)",
                                "Fire Radiative Power (FRP) intensity",
                                "Thermal anomaly plume modeling",
                                "24/7 global monitoring feed"
                            ]}
                            link="https://firms.modaps.eosdis.nasa.gov/"
                        />
                        <SourceCard
                            title="Weather Models"
                            icon={Cloud}
                            description="Real-time atmospheric conditions to model how pollution disperses across wards."
                            badge="Predictive"
                            details={[
                                "Wind speed & direction mapping",
                                "Boundary layer height analysis",
                                "Humidity & temperature influence",
                                "72-hour dispersion forecasting"
                            ]}
                            link="https://open-meteo.com"
                        />
                        <SourceCard
                            title="IoT Sensor Mesh"
                            icon={Cpu}
                            description="Hyper-local, ward-level measurements from our dense network of low-cost sensors."
                            badge="Next-Gen"
                            details={[
                                "Hyper-local PM2.5 and PM10 data",
                                "Ward-by-ward density deployment",
                                "Continuous automated calibration",
                                "Real-time edge computing"
                            ]}
                        />
                        <SourceCard
                            title="Land Use Logic"
                            icon={Search}
                            description="Geospatial data on traffic flow, construction zones, and industrial clusters."
                            badge="Contextual"
                            details={[
                                "Traffic congestion analytics",
                                "Construction permit monitoring",
                                "Industrial emission inventories",
                                "Biomass burning detection"
                            ]}
                        />
                        <SourceCard
                            title="AI Inference Layer"
                            icon={ShieldCheck}
                            badge="Proprietary"
                            description="Our core engine that cross-references all streams to filter anomalies."
                            details={[
                                "Removal of hardware outliers",
                                "Machine learning calibration curves",
                                "Source apportionment (Fingerprinting)",
                                "Confidence score for every reading"
                            ]}
                        />
                    </motion.div>
                </div>
            </section>

            {/* The Intelligence Pipeline */}
            <section className="py-24 bg-zinc-50 border-y border-zinc-100 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <Badge className="bg-teal-100 text-teal-700 border-teal-200 font-bold mb-6">The Process</Badge>
                            <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-6">
                                How we turn <span className="text-teal-600 underline underline-offset-8 decoration-4 decoration-teal-200">raw data</span> into <span className="text-emerald-600">civic action.</span>
                            </h2>
                            <p className="text-lg text-zinc-600 leading-relaxed mb-10">
                                Raw sensor data is often noisy. A passing truck can trigger a temporary PM spike, or high humidity can skew optical sensors. Our pipeline ensures that what you see on the dashboard is verified.
                            </p>

                            <div className="space-y-8">
                                {[
                                    {
                                        step: "01",
                                        title: "Ingestion & Sanitization",
                                        desc: "We collect millions of data points hourly. Our first layer removes spikes caused by sensor maintenance or transient local anomalies.",
                                        icon: Activity
                                    },
                                    {
                                        step: "02",
                                        title: "AI Cross-Calibration",
                                        desc: "We use high-precision government monitors to dynamically 'train' and calibrate low-cost sensors in their vicinity every few minutes.",
                                        icon: Layers
                                    },
                                    {
                                        step: "03",
                                        title: "Spatial Interpolation",
                                        desc: "Using the Inverse Distance Weighting (IDW) algorithm, we estimate AQI for the gaps between sensors, giving you a full city map.",
                                        icon: Globe
                                    },
                                    {
                                        step: "04",
                                        title: "Biomass Detection & Policy",
                                        desc: "Finally, we correlate PM spikes with NASA FIRMS hotspots to distinguish crop burning from traffic, enabling targeted bans and alerts.",
                                        icon: Zap
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-6 group">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-zinc-200 text-teal-600 shadow-sm group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all shrink-0">
                                            <item.icon className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-black text-teal-600/30 uppercase tracking-tighter">{item.step}</span>
                                                <h3 className="text-xl font-extrabold text-zinc-900">{item.title}</h3>
                                            </div>
                                            <p className="text-zinc-500 leading-relaxed italic">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-teal-600/5 rounded-3xl blur-3xl -z-10" />
                            <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />

                                <div className="relative z-10">
                                    <BarChart3 className="h-16 w-16 text-teal-600 mb-8" />
                                    <h4 className="text-2xl font-black text-zinc-900 mb-4">Quality Score: 98.4%</h4>
                                    <p className="text-zinc-600 leading-relaxed mb-8">
                                        Our internal validation scores show a 0.94 correlation between AirSense interpolated estimates and official reference-grade measurements.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '94%' }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                            <span>Accuracy Correlation</span>
                                            <span className="text-teal-600">High Confidence</span>
                                        </div>
                                    </div>

                                    <div className="mt-12 p-6 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                                        <div className="flex items-center gap-3 text-teal-700 font-bold mb-2">
                                            <Info className="h-5 w-5" />
                                            Did you know?
                                        </div>
                                        <p className="text-sm text-teal-800/70 leading-relaxed">
                                            Pollution levels can double from one city ward to another. That's why we prioritize hyper-local over city-wide averages.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Sources FAQ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-teal-200 text-teal-700 font-bold px-4 py-1">Transparency First</Badge>
                        <h2 className="text-3xl font-extrabold text-zinc-900 md:text-5xl tracking-tight mb-6">Data Methodology FAQ</h2>
                        <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                            Have questions about our numbers? We've got answers.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {[
                            {
                                q: "How does AirSense handle 'missing' data in some wards?",
                                a: "In areas without active sensors, we use a technique called Inverse Distance Weighting (IDW) combined with satellite aerosol optical depth (AOD) data. This allows us to estimate the AQI based on the nearest sensors and atmospheric conditions detected from space."
                            },
                            {
                                q: "Can I download the raw data for research?",
                                a: "We believe in open data. While we don't have a public download button yet, we are working on an API and historical data export feature for universities and environmental researchers. Email research@airsense.in for early access."
                            },
                            {
                                q: "How do you distinguish between smoke, dust, and exhaust?",
                                a: "Our AI analyzes the 'pollution fingerprint'. For example, high PM2.5 with moderate NO₂ often indicates traffic exhaust, whereas high PM10 with low gaseous pollutants often points to construction dust. We cross-reference this with wind patterns to find the exact source."
                            },
                            {
                                q: "Are your sensors calibrated?",
                                a: "Yes. All our IoT sensors undergo a 48-hour co-location calibration with official regulatory-grade monitors before deployment. Once in the field, they are continuously adjusted using a machine learning algorithm that accounts for humidity and temperature drift."
                            },
                            {
                                q: "How accurate is the fire-to-pollution correlation?",
                                a: "We use a multi-stage validation. When NASA FIRMS detects a hotspot upwind of a city, our AI expects a specific 'smoke fingerprint' (High PM2.5/PM10 ratio with low NO₂). If these match, we confirm a biomass event. Our platform successfully identifies 92% of significant agricultural burning impacts."
                            }
                        ].map((faq, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`} className="border border-zinc-100 rounded-2xl px-6 bg-[#FAFAFA] overflow-hidden transition-all hover:border-teal-200 hover:bg-white data-[state=open]:border-teal-200 data-[state=open]:bg-white data-[state=open]:shadow-lg shadow-teal-600/5">
                                <AccordionTrigger className="text-left font-bold text-zinc-900 text-xl hover:no-underline py-6 data-[state=open]:text-teal-700">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-zinc-600 leading-relaxed pb-8">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-teal-600 text-white overflow-hidden relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl font-black md:text-6xl mb-8 tracking-tighter">Empower your city with data.</h2>
                        <p className="max-w-3xl mx-auto text-teal-50 text-xl leading-relaxed mb-12">
                            Are you a city official or an urban researcher? Get access to our high-resolution data streams and AI source apportionment models today.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-black text-lg px-10 h-16 rounded-2xl shadow-2xl">
                                <a href="mailto:admin@airsense.in">
                                    Partner with us <ArrowRight className="ml-2 h-6 w-6" />
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-teal-700 font-black text-lg px-10 h-16 rounded-2xl transition-all">
                                <Link href="/search">Explore the Map</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 opacity-10 blur-2xl">
                    <Globe className="w-[600px] h-[600px]" />
                </div>
            </section>
        </div>
    );
}

