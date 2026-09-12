"use client";

import { useState, useActionState } from "react";
import { EquipmentActionState } from "@/app/actions/equipmentActions";
import { D } from '@/lib/design-system';
import { 
  Loader2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Package,
  ArrowLeft,
  ChevronRight,
  Box,
  Tag,
  Hash,
  Activity,
  Calendar,
  ShieldAlert,
  Edit3
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { equipmentSchema } from "@/lib/validations/equipmentSchema";
import { z } from "zod";
import Link from "next/link";

interface EquipmentFormProps {
  mode: 'create' | 'edit';
  equipmentAction: (prevState: EquipmentActionState, formData: FormData) => Promise<EquipmentActionState>;
  initialState: EquipmentActionState;
  initialData?: any;
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      style={{ 
        background: D.sky, 
        color: '#000', 
        border: 'none', 
        borderRadius: D.lg, 
        padding: '12px 24px', 
        fontFamily: D.head, 
        fontWeight: 900, 
        fontSize: '14px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.7 : 1,
        transition: 'transform 0.2s ease',
        width: 'auto'
      }}
      className="hover:scale-105 active:scale-95"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {mode === 'create' ? 'ADDING...' : 'SAVING...'}
        </>
      ) : (
        <>
          <Save size={18} />
          {mode === 'create' ? 'GENERATE RESOURCE' : 'UPDATE RESOURCE'}
          <ChevronRight size={18} />
        </>
      )}
    </button>
  );
}

export function EquipmentForm({ mode, equipmentAction, initialState, initialData = {} }: EquipmentFormProps) {
  const [state, action] = useActionState(equipmentAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof equipmentSchema.shape;
      if (field in equipmentSchema.shape) {
        (equipmentSchema.shape as any)[field].parse(value);
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (err) {
      const error = err as z.ZodError;
      if (error.issues) {
        setClientErrors(prev => ({
          ...prev,
          [name]: error.issues[0].message
        }));
      }
    }
  };

  const InputWrapper = ({ label, error, children, icon: Icon }: any) => (
    <div className="mb-6">
      <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2" style={{ fontFamily: D.head }}>
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-indigo-500" />}
          {label}
        </div>
      </label>
      {children}
      {error && (
        <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1 font-semibold">{error}</p>
      )}
    </div>
  );

  const inputClassName = "w-full bg-zinc-50 dark:bg-[#181820] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="text-zinc-900 dark:text-white">
      
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => window.history.back()}
          className="bg-zinc-100 dark:bg-[#0c0c10] border border-zinc-200 dark:border-white/10 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/30 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: D.head }}>
            {mode === 'create' ? 'GENERATE' : 'EDIT'} <span className="text-zinc-500 dark:text-zinc-400">RESOURCE</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Assign operational parameters to school assets.</p>
        </div>
      </div>

      <form action={action} className="bg-white dark:bg-[#0c0c10] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl">
        
        {state.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 mb-8">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Asset {mode === 'create' ? 'registered' : 'updated'} successfully in OS ledger.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div>
            <h3 className="text-xs font-black mb-6 opacity-50 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider" style={{ fontFamily: D.head }}>IDENTIFICATION</h3>
            
            <InputWrapper label="Resource Name *" error={clientErrors.name || state.fieldErrors?.name?.[0]} icon={Box}>
              <input 
                name="name" 
                defaultValue={initialData.name}
                onBlur={(e) => validateField('name', e.target.value)}
                placeholder="e.g. Premium Match Balls"
                className={inputClassName}
                required 
              />
            </InputWrapper>

            <InputWrapper label="Category *" error={state.fieldErrors?.category?.[0]} icon={Tag}>
              <select name="category" defaultValue={initialData.category} className={inputClassName} required>
                <option value="">Select category...</option>
                <option value="Bats">Bats</option>
                <option value="Balls">Balls</option>
                <option value="Protective Gear">Protective Gear</option>
                <option value="Stumps & Bails">Stumps & Bails</option>
                <option value="Training Equipment">Training Equipment</option>
                <option value="Groundskeeping">Groundskeeping</option>
                <option value="Scoreboard">Scoreboard</option>
                <option value="Other">Other</option>
              </select>
            </InputWrapper>

            <div className="grid grid-cols-2 gap-4">
               <InputWrapper label="Quantity *" error={clientErrors.quantity || state.fieldErrors?.quantity?.[0]} icon={Hash}>
                <input 
                  name="quantity"
                  type="number"
                  defaultValue={initialData.quantity}
                  onBlur={(e) => validateField('quantity', e.target.value)}
                  className={inputClassName}
                  required 
                />
              </InputWrapper>

              <InputWrapper label="Condition *" icon={Activity}>
                <select name="condition" defaultValue={initialData.condition || 'Good'} className={inputClassName} required>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </InputWrapper>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="text-xs font-black mb-6 opacity-50 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider" style={{ fontFamily: D.head }}>LOGISTICS</h3>

            <InputWrapper label="Storage Location *" error={clientErrors.location || state.fieldErrors?.location?.[0]} icon={ShieldAlert}>
              <input 
                name="location"
                defaultValue={initialData.location}
                onBlur={(e) => validateField('location', e.target.value)}
                placeholder="e.g. South Pavilion"
                className={inputClassName}
                required 
              />
            </InputWrapper>

            <div className="grid grid-cols-2 gap-4">
              <InputWrapper label="Acquisition Date" error={clientErrors.purchaseDate} icon={Calendar}>
                <input 
                  name="purchaseDate"
                  type="date"
                  defaultValue={initialData.purchaseDate?.split('T')[0]}
                  onBlur={(e) => validateField('purchaseDate', e.target.value)}
                  className={inputClassName}
                />
              </InputWrapper>

              <InputWrapper label="Unit Cost (ZAR)" error={clientErrors.purchasePrice} icon={Hash}>
                <input 
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  defaultValue={initialData.purchasePrice}
                  onBlur={(e) => validateField('purchasePrice', e.target.value)}
                  placeholder="0.00"
                  className={inputClassName}
                />
              </InputWrapper>
            </div>

            <InputWrapper label="Internal Ledger Notes" error={clientErrors.notes}>
              <textarea 
                name="notes"
                defaultValue={initialData.notes}
                onBlur={(e) => validateField('notes', e.target.value)}
                placeholder="Maintenance logs, serial numbers, etc."
                className={`${inputClassName} min-h-[100px] resize-y`}
                maxLength={500}
              />
            </InputWrapper>
          </div>

        </div>

        {state.error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 mt-8">
            <AlertTriangle size={18} className="text-rose-500" />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{state.error}</span>
          </div>
        )}

        <div className="mt-10 flex justify-end gap-3 border-t border-zinc-200 dark:border-white/10 pt-8">
          <button 
            type="button" 
            onClick={() => window.history.back()}
            className="bg-transparent text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 rounded-xl px-6 py-3 font-black text-sm hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/30 cursor-pointer transition-all"
            style={{ fontFamily: D.head }}
          >
            DISCARD
          </button>
          <SubmitButton mode={mode} />
        </div>

      </form>
    </div>
  );
}
