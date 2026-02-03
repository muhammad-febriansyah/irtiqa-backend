import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null;

    const translateLabel = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('previous') || lowerLabel.includes('sebelum')) {
            return <ChevronLeft size={18} />;
        }
        if (lowerLabel.includes('next') || lowerLabel.includes('lanjut')) {
            return <ChevronRight size={18} />;
        }
        // Clean up entities and trim
        return label.replace(/&laquo;|&raquo;/g, '').trim();
    };

    return (
        <nav className="flex flex-wrap items-center justify-center gap-2 mt-12 pb-8">
            {links.map((link, index) => {
                const labelContent = translateLabel(link.label);
                const isIcon = typeof labelContent !== 'string';

                if (link.url === null) {
                    return (
                        <div
                            key={index}
                            className={`h-10 flex items-center justify-center rounded-xl text-neutral-300 border border-neutral-100 cursor-not-allowed select-none ${isIcon ? 'w-10' : 'min-w-[2.5rem] px-4'
                                }`}
                        >
                            {labelContent}
                        </div>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`h-10 flex items-center justify-center rounded-xl border transition-all duration-300 font-bold text-sm ${isIcon ? 'w-10' : 'min-w-[2.5rem] px-4'
                            } ${link.active
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white border-neutral-100 text-neutral-600 hover:border-primary hover:text-primary hover:shadow-md'
                            }`}
                        preserveScroll
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        {labelContent}
                    </Link>
                );
            })}
        </nav>
    );
}
