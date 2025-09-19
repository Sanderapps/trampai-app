import { LucideProps } from "lucide-react";
import React from "react";

interface JobInfoItemProps {
    icon: React.ComponentType<LucideProps>;
    label?: string;
    value: string;
}

export function JobInfoItem({ icon: Icon, label, value }: JobInfoItemProps) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
                {label && <p className="font-semibold">{label}</p>}
                <p className="text-muted-foreground">{value}</p>
            </div>
        </div>
    );
}
