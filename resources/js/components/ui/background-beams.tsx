"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute inset-0 z-0 h-full w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
                className
            )}
        >
            <svg
                className="absolute left-[-10%] top-[-10%] h-[120%] w-[120%] opacity-20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,1000 L1000,1000 L1000,0 L0,0 Z"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="0.5"
                    className="animate-[beam_20s_linear_infinite]"
                    style={{
                        strokeDasharray: "10 100",
                        strokeDashoffset: "0",
                    }}
                />
                <path
                    d="M200,1000 L1200,1000 L1200,0 L200,0 Z"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="0.5"
                    className="animate-[beam_25s_linear_infinite_reverse]"
                    style={{
                        strokeDasharray: "20 120",
                        strokeDashoffset: "50",
                    }}
                />
                <path
                    d="M-200,1000 L800,1000 L800,0 L-200,0 Z"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="0.5"
                    className="animate-[beam_30s_linear_infinite]"
                    style={{
                        strokeDasharray: "15 150",
                        strokeDashoffset: "20",
                    }}
                />
            </svg>
        </div>
    );
};
