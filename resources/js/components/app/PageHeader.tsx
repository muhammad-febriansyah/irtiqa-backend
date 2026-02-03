import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    subtitle?: string;
    action?: React.ReactNode;
}

export default function PageHeader({
    title,
    breadcrumbs = [],
    subtitle,
    action,
}: PageHeaderProps) {
    return (
        <section className="relative pt-44 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-primary">
            {/* Subtle Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Content */}
            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
                        <div className="flex-grow">
                            {/* Title - Left aligned */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
                                {title}
                            </h1>

                            {/* Subtitle - Left aligned */}
                            {subtitle && (
                                <p className="text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {action && (
                            <div className="flex-shrink-0">
                                {action}
                            </div>
                        )}
                    </div>

                    {/* Breadcrumbs below title/subtitle - Left aligned */}
                    {breadcrumbs.length > 0 && (
                        <nav className="flex items-center space-x-2 text-sm">
                            <Link
                                href="/"
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                Home
                            </Link>

                            {breadcrumbs.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ChevronRight size={14} className="text-white/40" />
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className="text-white/70 hover:text-white transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="text-white font-medium">
                                            {item.label}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </nav>
                    )}
                </motion.div>
            </div>

            {/* Bottom border line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10" />
        </section>
    );
}
