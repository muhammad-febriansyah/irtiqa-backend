"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import React, { useState } from "react";

interface NavbarProps {
    children: React.ReactNode;
    className?: string;
}

interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
    isScrolled?: boolean;
}

interface NavItemsProps {
    items: {
        name: string;
        link: string;
    }[];
    className?: string;
}

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavMenuProps {
    items: {
        name: string;
        link: string;
    }[];
    className?: string;
    isOpen?: boolean;
}

export const Navbar = ({ children, className }: NavbarProps) => {
    const { scrollY } = useScroll();
    const [visible, setVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setVisible(false);
        } else {
            setVisible(true);
        }
        setIsScrolled(latest > 50);
    });

    return (
        <div
            className={cn(
                "fixed inset-x-0 mx-auto z-50 transition-all duration-500 ease-in-out w-full",
                isScrolled ? "max-w-4xl top-10 px-4" : "max-w-6xl top-0 px-0",
                className
            )}
        >
            <NavBody visible={visible} isScrolled={isScrolled}>{children}</NavBody>
        </div>
    );
};

export const NavBody = ({
    children,
    className,
    visible = true,
    isScrolled = false,
}: NavBodyProps) => {
    return (
        <motion.div
            initial={{
                opacity: 1,
                y: -100,
            }}
            animate={{
                y: visible ? 0 : -100,
                opacity: visible ? 1 : 0,
            }}
            transition={{
                duration: 0.4,
                ease: "easeInOut",
            }}
            className={cn(
                "flex w-full relative transition-all duration-500 ease-in-out items-center justify-between",
                isScrolled
                    ? "border border-[#E5E7EB] rounded-full bg-white/80 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1)] px-8 py-2"
                    : "border-b border-transparent rounded-none bg-white px-8 py-4",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export const NavItems = ({ items, className }: NavItemsProps) => {
    return (
        <div className={cn("hidden md:flex items-center space-x-8", className)}>
            {items.map((item, idx) => (
                <a
                    key={idx}
                    href={item.link}
                    className="text-neutral-600 hover:text-primary text-sm font-medium transition-colors"
                >
                    {item.name}
                </a>
            ))}
        </div>
    );
};

export const MobileNav = ({ children, className }: MobileNavProps) => {
    return (
        <div className={cn("flex md:hidden w-full items-center", className)}>
            {children}
        </div>
    );
};

export const MobileNavHeader = ({
    children,
    className,
}: MobileNavHeaderProps) => {
    return (
        <div className={cn("flex items-center justify-between w-full", className)}>
            {children}
        </div>
    );
};

export const MobileNavMenu = ({
    items,
    className,
    isOpen,
}: MobileNavMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={cn(
                        "absolute top-full left-0 right-0 mt-4 p-6 bg-white/95 backdrop-blur-lg border border-neutral-200 rounded-3xl shadow-xl flex flex-col gap-4",
                        className
                    )}
                >
                    {items.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            className="text-neutral-700 hover:text-primary text-base font-medium transition-colors"
                        >
                            {item.name}
                        </a>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const MobileNavToggle = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}) => {
    return (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-neutral-600 hover:text-primary transition-colors"
        >
            {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
    );
};

export const NavbarButton = ({
    href,
    as: Tag = "a",
    children,
    className,
    variant = "primary",
    ...props
}: {
    href?: string;
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
        | React.ComponentPropsWithoutRef<"a">
        | React.ComponentPropsWithoutRef<"button">
    )) => {
    const baseStyles =
        "px-6 py-2 rounded-full text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-300 inline-block text-center";
    const variantStyles = {
        primary:
            "bg-primary text-white shadow-[0_4px_14px_0_rgba(0,150,137,0.39)] hover:bg-primary/90",
        secondary: "bg-transparent text-neutral-700 border border-neutral-200 hover:bg-neutral-50",
        dark: "bg-black text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.3)]",
        gradient:
            "bg-gradient-to-r from-[#009689] to-[#00796B] text-white shadow-[0_4px_14px_0_rgba(0,150,137,0.39)]",
    };

    return (
        <Tag
            href={href || undefined}
            className={cn(baseStyles, variantStyles[variant], className)}
            {...props}
        >
            {children}
        </Tag>
    );
};
