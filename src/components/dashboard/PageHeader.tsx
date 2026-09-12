import { ReactNode } from "react";
import { D } from "@/lib/design-system";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div 
      className="relative overflow-hidden rounded-[32px] p-10 mb-8 border transition-all duration-700 shadow-2xl"
      style={{ 
        background: D.surf1, 
        borderColor: D.border,
        boxShadow: `0 25px 60px -25px ${D.indigo}20` 
      }}
    >
      {/* Strategic Mesh & Pulses */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          background: `radial-gradient(circle at top right, ${D.indigo}30, transparent 70%)` 
        }} 
      />
      <div 
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl animate-pulse pointer-events-none" 
        style={{ background: `${D.indigo}15` }} 
      />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 
            className="text-xl md:text-2xl font-bold tracking-tight text-white"
            style={{ 
              fontFamily: D.head, 
              color: D.textPrimary,
            }}
          >
            {title}
          </h1>
          <p 
            className="text-xs font-medium text-slate-400 max-w-2xl leading-relaxed"
            style={{ fontFamily: D.sans }}
          >
            {description}
          </p>
        </div>
        {children && (
          <div className="flex-shrink-0 relative z-20">
            {children}
          </div>
        )}
      </div>

      {/* Corporate Sub-Marker */}
      <div 
        className="absolute bottom-0 right-10 h-1 w-24 rounded-t-full opacity-30"
        style={{ background: D.indigo }}
      />
    </div>
  );
}
