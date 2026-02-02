import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input p-8 bg-white border border-[#E5E7EB] justify-between flex flex-col space-y-4",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {icon}
                </div>
                <div className="font-bold text-[#111827] mb-2 text-xl">
                    {title}
                </div>
                <div className="font-normal text-[#6B7280] text-sm leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );
};
