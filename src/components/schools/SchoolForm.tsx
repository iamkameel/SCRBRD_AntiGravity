"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { SchoolActionState, deleteSchoolAction } from "@/app/actions/schoolActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, GraduationCap, Palette, Shield, Image as ImageIcon, X } from "lucide-react";
import { storage } from "@/lib/firebase";
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
    <Button type="submit" disabled={pending}>
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
  const [state, action] = useFormState(schoolAction, initialState);
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setClientErrors(prev => ({ ...prev, logoUrl: 'Please upload an image file' }));
      return;
    }

    // Validate file size (max 2MB)
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

  // Client-side validation
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
      {/* Hidden inputs for colors */}
      <input type="hidden" name="primaryColor" value={primaryColor} />
      <input type="hidden" name="secondaryColor" value={secondaryColor} />

      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            School {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {mode === 'create' ? 'Add New School' : 'Edit School'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the school details below. Fields marked with * are required.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">School Name *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      defaultValue={initialData.name}
                      onChange={(e) => setSchoolName(e.target.value)}
                      onBlur={(e) => validateField('name', e.target.value)}
                      placeholder="e.g. Westville Boys' High"
                      required 
                    />
                    {(clientErrors.name || state.fieldErrors?.name) && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {clientErrors.name || state.fieldErrors?.name[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abbreviation">Abbreviation</Label>
                    <Input 
                      id="abbreviation" 
                      name="abbreviation" 
                      defaultValue={initialData.abbreviation}
                      onChange={(e) => setAbbreviation(e.target.value)}
                      onBlur={(e) => validateField('abbreviation', e.target.value)}
                      placeholder="e.g. WBHS"
                      maxLength={10}
                    />
                    {clientErrors.abbreviation && (
                      <p className="text-sm text-destructive">{clientErrors.abbreviation}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="motto">Motto</Label>
                    <Input 
                      id="motto" 
                      name="motto" 
                      defaultValue={initialData.motto}
                      onBlur={(e) => validateField('motto', e.target.value)}
                      placeholder="e.g. Incepto Ne Desistam"
                    />
                    {clientErrors.motto && (
                      <p className="text-sm text-destructive">{clientErrors.motto}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="establishmentYear">Established Year</Label>
                    <Input 
                      id="establishmentYear" 
                      name="establishmentYear" 
                      type="number"
                      min="1000"
                      max={new Date().getFullYear()}
                      defaultValue={initialData.establishmentYear}
                      onBlur={(e) => validateField('establishmentYear', e.target.value)}
                      placeholder="e.g. 1955"
                    />
                    {clientErrors.establishmentYear && (
                      <p className="text-sm text-destructive">{clientErrors.establishmentYear}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input 
                      id="contactEmail" 
                      name="contactEmail" 
                      type="email"
                      defaultValue={initialData.contactEmail}
                      onBlur={(e) => validateField('contactEmail', e.target.value)}
                      placeholder="info@school.edu"
                    />
                    {clientErrors.contactEmail && (
                      <p className="text-sm text-destructive">{clientErrors.contactEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input 
                      id="contactPhone" 
                      name="contactPhone" 
                      defaultValue={initialData.contactPhone}
                      onBlur={(e) => validateField('contactPhone', e.target.value)}
                      placeholder="+27 31 123 4567"
                    />
                    {clientErrors.contactPhone && (
                      <p className="text-sm text-destructive">{clientErrors.contactPhone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    defaultValue={initialData.address}
                    onBlur={(e) => validateField('address', e.target.value)}
                    placeholder="Full street address"
                  />
                  {clientErrors.address && (
                    <p className="text-sm text-destructive">{clientErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Principal</Label>
                    <Input 
                      id="principal" 
                      name="principal" 
                      defaultValue={initialData.principal}
                      onBlur={(e) => validateField('principal', e.target.value)}
                      placeholder="e.g. Mr. J. Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input 
                      id="contactName" 
                      name="contactName" 
                      defaultValue={initialData.contactName}
                      onBlur={(e) => validateField('contactName', e.target.value)}
                      placeholder="e.g. Mrs. A. Jones"
                    />
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Branding
                </h3>
                
                {/* Color Presets */}
                <div className="space-y-2">
                  <Label>Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full border hover:border-primary transition-colors text-xs"
                        title={preset.name}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <span className="hidden sm:inline">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColorInput">Primary Color</Label>
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
                          className="w-10 h-10 rounded-lg border-2 cursor-pointer shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                        />
                      </div>
                      <Input 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#1e3a5f"
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColorInput">Secondary Color</Label>
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
                          className="w-10 h-10 rounded-lg border-2 cursor-pointer shadow-sm"
                          style={{ backgroundColor: secondaryColor }}
                        />
                      </div>
                      <Input 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        placeholder="#ffd700"
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUpload">School Logo</Label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      {logoUrl && (
                        <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={logoUrl} 
                            alt="Logo Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 rounded-bl-md hover:bg-destructive/90"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploading}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    {isUploading && (
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }} 
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{Math.round(uploadProgress)}%</p>
                      </div>
                    )}
                    
                    <input type="hidden" name="logoUrl" value={logoUrl} />
                    
                    <p className="text-xs text-muted-foreground">
                      Upload a PNG or JPG file (max 2MB).
                    </p>
                    {clientErrors.logoUrl && (
                      <p className="text-sm text-destructive">{clientErrors.logoUrl}</p>
                    )}
                  </div>
                </div>
              </div>

              {state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between bg-muted/50">
              {mode === 'edit' && initialData.id ? (
                <DeleteConfirmationDialog 
                  entityName="school" 
                  onDelete={async () => {
                    await deleteSchoolAction(initialData.id);
                  }}
                />
              ) : (
                <div></div> 
              )}
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <SubmitButton mode={mode} />
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Badge Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Badge Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Badge */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={logoUrl} 
                    alt="School Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                      border: `4px solid ${secondaryColor}`
                    }}
                  >
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: secondaryColor }}
                    >
                      {abbreviation || schoolName.substring(0, 2).toUpperCase() || 'SC'}
                    </span>
                  </div>
                )}
              </div>

              {/* School Name */}
              <div className="text-center">
                <p className="font-bold text-lg">{schoolName || 'School Name'}</p>
                <p className="text-sm text-muted-foreground">{abbreviation || 'ABV'}</p>
              </div>

              {/* Color Swatches */}
              <div className="flex gap-2">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-sm border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Primary</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-sm border"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Secondary</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jersey Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Kit Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative w-32 h-40">
                {/* Jersey Shape */}
                <svg viewBox="0 0 100 120" className="w-full h-full">
                  {/* Main Body */}
                  <path 
                    d="M20 30 L0 40 L0 120 L100 120 L100 40 L80 30 L70 15 L30 15 Z"
                    fill={primaryColor}
                    stroke={secondaryColor}
                    strokeWidth="2"
                  />
                  {/* Collar */}
                  <path 
                    d="M30 15 Q50 25 70 15"
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth="3"
                  />
                  {/* Logo Placeholder */}
                  <circle cx="80" cy="50" r="8" fill={secondaryColor} opacity="0.8" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
