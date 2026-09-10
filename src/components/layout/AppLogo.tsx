import Image from 'next/image';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2 text-xl font-semibold text-[hsl(var(--accent))]">
      <Image
        src="/images/scrbrd-logo.png"
        alt="SCRBRD Logo"
        width={180}
        height={45}
        className="h-12 w-auto object-contain"
        priority
      />
    </div>
  );
}
