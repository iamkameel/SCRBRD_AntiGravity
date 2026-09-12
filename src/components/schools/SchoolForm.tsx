"use client";

import { useState, useActionState } from "react";
import { SchoolActionState, deleteSchoolAction } from "@/app/actions/schoolActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, GraduationCap, Palette, Image as ImageIcon, X } from "lucide-react";
import { storage } from "@/lib/firebase-storage";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useFormStatus } from "react-dom";
import { schoolSchema } from "@/lib/validations/schoolSchema";
import { z } from "zod";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";

interface SchoolFormProps {
  mode: 'create' | 'edit';
  schoolAction: (prevState: SchoolActionState, formData: FormData) => Promise<SchoolActionState>;
  initialState: SchoolActionState;
  initialData?: any;
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-primary to-sky-500 hover:from-primary/90 hover:to-sky-500/90 text-white font-semibold shadow-lg shadow-primary/25 border-0"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Creating...' : 'Saving...'}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Create School' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

// Preset color palettes for schools
const COLOR_PRESETS = [
  { name: 'Navy & Gold', primary: '#1e3a5f', secondary: '#ffd700' },
  { name: 'Maroon & White', primary: '#800000', secondary: '#ffffff' },
  { name: 'Green & Gold', primary: '#006400', secondary: '#ffd700' },
  { name: 'Royal Blue & White', primary: '#4169e1', secondary: '#ffffff' },
  { name: 'Black & Gold', primary: '#000000', secondary: '#ffd700' },
  { name: 'Red & Black', primary: '#dc143c', secondary: '#000000' },
  { name: 'Purple & Gold', primary: '#663399', secondary: '#ffd700' },
  { name: 'Teal & White', primary: '#008080', secondary: '#ffffff' },
];

export function SchoolForm({ mode, schoolAction, initialState, initialData = {} }: SchoolFormProps) {
  const [state, action] = useActionState(schoolAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  
  // State
  const [primaryColor, setPrimaryColor] = useState(initialData.brandColors?.primary || '#1e3a5f');
  const [secondaryColor, setSecondaryColor] = useState(initialData.brandColors?.secondary || '#ffd700');
  const [schoolName, setSchoolName] = useState(initialData.name || '');
  const [abbreviation, setAbbreviation] = useState(initialData.abbreviation || '');
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setClientErrors(prev => ({ ...prev, logoUrl: 'Please upload an image file' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setClientErrors(prev => ({ ...prev, logoUrl: 'Image size must be less than 2MB' }));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setClientErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.logoUrl;
      return newErrors;
    });

    try {
      const storageRef = ref(storage, `schools/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setClientErrors(prev => ({ ...prev, logoUrl: 'Failed to upload image' }));
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setLogoUrl(downloadURL);
          setIsUploading(false);
        }
      );
    } catch (error: any) {
      console.error("Error starting upload:", error);
      setClientErrors(prev => ({ ...prev, logoUrl: 'Failed to start upload' }));
      setIsUploading(false);
    }
  };

  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof schoolSchema.shape;
      if (field in schoolSchema.shape) {
        schoolSchema.shape[field].parse(value);
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setClientErrors(prev => ({
          ...prev,
          [name]: error.issues[0].message
        }));
      }
    }
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  const showSuccess = state.success;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="primaryColor" value={primaryColor} />
      <input type="hidden" name="secondaryColor" value={secondaryColor} />

      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertDescription>
            School {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/40 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/30">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-head text-foreground">
                  {mode === 'create' ? 'Add New School' : 'Edit School Information'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure school branding, details, and contact points. Fields marked with * are required.
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-xs text-primary uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium">School Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={initialData.name}
                    onChange={(e) => setSchoolName(e.target.value)}
                    onBlur={(e) => validateField('name', e.target.value)}
                    placeholder="e.g. Westville Boys' High"
                    className="bg-card/50 border-border/50 focus:border-primary text-sm"
                    required 
                  />
                  {(clientErrors.name || state.fieldErrors?.name) && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {clientErrors.name || state.fieldErrors?.name[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abbreviation" className="text-xs font-medium">Abbreviation</Label>
                  <Input 
                    id="abbreviation" 
                    name="abbreviation" 
                    defaultValue={initialData.abbreviation}
                    onChange={(e) => setAbbreviation(e.target.value)}
                    onBlur={(e) => validateField('abbreviation', e.target.value)}
                    placeholder="e.g. WBHS"
                    maxLength={10}
                    className="bg-card/50 border-border/50 focus:border-primary text-sm font-mono"
                  />
                  {clientErrors.abbreviation && (
                    <p className="text-xs text-rose-400">{clientErrors.abbreviation}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motto" className="text-xs font-medium">Motto</Label>
                  <Input 
                    id="motto" 
                    name="motto" 
                    defaultValue={initialData.motto}
                    onBlur={(e) => validateField('motto', e.target.value)}
                    placeholder="e.g. Incepto Ne Desistam"
                    className="bg-card/50 border-border/50 focus:border-primary text-sm"
                  />
                  {clientErrors.motto && (
                    <p className="text-xs text-rose-400">{clientErrors.motto}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishmentYear" className="text-xs font-medium">Established Year</Label>
                  <Input 
                    id="establishmentYear" 
                    name="establishmentYear" 
                    type="number"
                    min="1000"
                    max={new Date().getFullYear()}
                    defaultValue={initialData.establishmentYear}
                    onBlur={(e) => validateField('establishmentYear', e.target.value)}
                    placeholder="e.g. 1955"
                    className="bg-card/50 border-border/50 focus:border-primary text-sm font-mono"
                  />
                  {clientErrors.establishmentYear && (
                    <p className="text-xs text-rose-400">{clientErrors.establishmentYear}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <h3 className="font-semibold text-xs text-sky-400 uppercase tracking-wider">Contact & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-xs font-medium">Email</Label>
                  <Input 
                    id="contactEmail" 
                    name="contactEmail" 
                    type="email"
                    defaultValue={initialData.contactEmail}
                    onBlur={(e) => validateField('contactEmail', e.target.value)}
                    placeholder="info@school.edu"
                    className="bg-card/50 border-border/50 focus:border-primary text-sm"
                  />
                  {clientErrors.contactEmail && (
                    <p className="text-xs text-rose-400">{clientErrors.contactEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-xs font-medium">Phone</Label>
                  <Input 
                    id="contactPhone" 
                    name="contactPhone" 
                    defaultValue={initialData.contactPhone}
                    onBlur={(e) => validateField('contactPhone', e.target.value)}
                    placeholder="+27 31 123 4567"
                    className="bg-card/50 border-border/50 focus:border-primary text-sm font-mono"
                  />
                  {clientErrors.contactPhone && (
                    <p className="text-xs text-rose-400">{clientErrors.contactPhone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-medium">Address</Label>
                <Input 
                  id="address" 
                  name="address" 
                  defaultValue={initialData.address}
                  onBlur={(e) => validateField('address', e.target.value)}
                  placeholder="Full street address"
                  className="bg-card/50 border-border/50 focus:border-primary text-sm"
                />
                {clientErrors.address && (
                  <p className="text-xs text-rose-400">{clientErrors.address}</p>
                )}
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <h3 className="font-semibold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Brand Customization
              </h3>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium">Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-card/60 hover:border-primary transition-all text-xs"
                      title={preset.name}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-white/20" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span 
                        className="w-3 h-3 rounded-full border border-white/20" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <span className="hidden sm:inline font-medium text-foreground">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColorInput" className="text-xs font-medium">Primary Color</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        id="primaryColorInput"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      />
                      <div 
                        className="w-10 h-10 rounded-xl border-2 border-white/20 cursor-pointer shadow-md"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <Input 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#1e3a5f"
                      className="flex-1 font-mono text-xs bg-card/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColorInput" className="text-xs font-medium">Secondary Color</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        id="secondaryColorInput"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      />
                      <div 
                        className="w-10 h-10 rounded-xl border-2 border-white/20 cursor-pointer shadow-md"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                    <Input 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#ffd700"
                      className="flex-1 font-mono text-xs bg-card/50 border-border/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {state.error && (
              <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              {mode === 'edit' && initialData.id ? (
                <DeleteConfirmationDialog 
                  entityName="school" 
                  onDelete={async () => {
                    await deleteSchoolAction(initialData.id);
                  }}
                />
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <Button variant="outline" type="button" onClick={() => window.history.back()} className="border-border/50 text-xs">
                  Cancel
                </Button>
                <SubmitButton mode={mode} />
              </div>
            </div>
          </div>
        </div>

        {/* Badge & Kit Preview Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Badge & Kit Preview
            </h3>
            
            <div className="flex flex-col items-center gap-4 py-2">
              <div 
                className="w-28 h-28 rounded-2xl p-2 flex items-center justify-center shadow-xl backdrop-blur-md transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: '#171a17',
                  border: `3px solid ${secondaryColor}`
                }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={logoUrl} 
                    alt="School Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl font-extrabold font-head" style={{ color: secondaryColor }}>
                    {abbreviation || schoolName.substring(0, 2).toUpperCase() || 'SC'}
                  </span>
                )}
              </div>

              <div className="text-center">
                <p className="font-bold text-base text-foreground font-head">{schoolName || 'School Name'}</p>
                <p className="text-xs font-mono text-muted-foreground">{abbreviation || 'ABV'}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <div className="text-center">
                  <div 
                    className="w-10 h-10 rounded-xl shadow-md border border-white/20"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">Primary</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-10 h-10 rounded-xl shadow-md border border-white/20"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">Secondary</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
