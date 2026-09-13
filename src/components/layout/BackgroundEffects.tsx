import Image from 'next/image';

/** A single static raster layer; opaque data surfaces protect text contrast. */
export function BackgroundEffects() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <Image
        src="/images/cricket-stadium-bg.png"
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover object-center filter brightness-[0.28] contrast-[1.1] opacity-40 dark:opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/90 to-background" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <Image
        src="/images/fractal-glass.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.05] mix-blend-multiply dark:opacity-[0.08] dark:mix-blend-screen"
      />
    </div>
  );
}
