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
    <div style={{ marginBottom: '24px' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '11px', 
        fontWeight: 900, 
        color: D.textMuted, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        marginBottom: '8px',
        fontFamily: D.head
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {Icon && <Icon size={12} />}
          {label}
        </div>
      </label>
      {children}
      {error && (
        <p style={{ color: D.rose, fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>{error}</p>
      )}
    </div>
  );

  const inputStyle = {
    width: '100%',
    background: D.surf2,
    border: `1px solid ${D.border}`,
    borderRadius: D.lg,
    padding: '12px 16px',
    fontSize: '14px',
    color: D.textPrimary,
    fontFamily: D.body,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ color: D.textPrimary }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => window.history.back()}
          style={{ 
            background: D.surf1, 
            border: `1px solid ${D.border}`, 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            color: D.textMuted
          }} className="hover:text-white hover:border-white/50">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontFamily: D.head, fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>
            {mode === 'create' ? 'GENERATE' : 'EDIT'} <span style={{ color: D.textMuted }}>RESOURCE</span>
          </h1>
          <p style={{ color: D.textMuted, fontSize: '14px' }}>Assign operational parameters to school assets.</p>
        </div>
      </div>

      <form action={action} style={{ 
        background: D.surf1, 
        border: `1px solid ${D.border}`, 
        borderRadius: D.xl, 
        padding: '32px',
        backdropFilter: 'blur(20px)'
      }}>
        
        {state.success && (
          <div style={{ background: `${D.emerald}15`, border: `1px solid ${D.emerald}30`, borderRadius: D.lg, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <CheckCircle2 size={18} color={D.emerald} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: D.emerald }}>
              Asset {mode === 'create' ? 'registered' : 'updated'} successfully in OS ledger.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Left Column */}
          <div>
            <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 900, marginBottom: '24px', opacity: 0.5 }}>IDENTIFICATION</h3>
            
            <InputWrapper label="Resource Name *" error={clientErrors.name || state.fieldErrors?.name?.[0]} icon={Box}>
              <input 
                name="name" 
                defaultValue={initialData.name}
                onBlur={(e) => validateField('name', e.target.value)}
                placeholder="e.g. Premium Match Balls"
                style={inputStyle}
                required 
              />
            </InputWrapper>

            <InputWrapper label="Category *" error={state.fieldErrors?.category?.[0]} icon={Tag}>
              <select name="category" defaultValue={initialData.category} style={inputStyle} required>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <InputWrapper label="Quantity *" error={clientErrors.quantity || state.fieldErrors?.quantity?.[0]} icon={Hash}>
                <input 
                  name="quantity"
                  type="number"
                  defaultValue={initialData.quantity}
                  onBlur={(e) => validateField('quantity', e.target.value)}
                  style={inputStyle}
                  required 
                />
              </InputWrapper>

              <InputWrapper label="Condition *" icon={Activity}>
                <select name="condition" defaultValue={initialData.condition || 'Good'} style={inputStyle} required>
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
            <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 900, marginBottom: '24px', opacity: 0.5 }}>LOGISTICS</h3>

            <InputWrapper label="Storage Location *" error={clientErrors.location || state.fieldErrors?.location?.[0]} icon={ShieldAlert}>
              <input 
                name="location"
                defaultValue={initialData.location}
                onBlur={(e) => validateField('location', e.target.value)}
                placeholder="e.g. South Pavilion"
                style={inputStyle}
                required 
              />
            </InputWrapper>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <InputWrapper label="Acquisition Date" error={clientErrors.purchaseDate} icon={Calendar}>
                <input 
                  name="purchaseDate"
                  type="date"
                  defaultValue={initialData.purchaseDate?.split('T')[0]}
                  onBlur={(e) => validateField('purchaseDate', e.target.value)}
                  style={inputStyle}
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
                  style={inputStyle}
                />
              </InputWrapper>
            </div>

            <InputWrapper label="Internal Ledger Notes" error={clientErrors.notes}>
              <textarea 
                name="notes"
                defaultValue={initialData.notes}
                onBlur={(e) => validateField('notes', e.target.value)}
                placeholder="Maintenance logs, serial numbers, etc."
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                maxLength={500}
              />
            </InputWrapper>
          </div>

        </div>

        {state.error && (
          <div style={{ background: `${D.rose}15`, border: `1px solid ${D.rose}30`, borderRadius: D.lg, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
            <AlertTriangle size={18} color={D.rose} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: D.rose }}>{state.error}</span>
          </div>
        )}

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${D.border}`, paddingTop: '32px' }}>
          <button 
            type="button" 
            onClick={() => window.history.back()}
            style={{ 
              background: 'transparent', 
              color: D.textMuted, 
              border: `1px solid ${D.border}`, 
              borderRadius: D.lg, 
              padding: '12px 24px', 
              fontFamily: D.head, 
              fontWeight: 900, 
              fontSize: '14px',
              cursor: 'pointer'
            }}
            className="hover:text-white hover:border-white/50"
          >
            DISCARD
          </button>
          <SubmitButton mode={mode} />
        </div>

      </form>
    </div>
  );
}
