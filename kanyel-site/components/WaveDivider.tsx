export default function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M0,40 C240,90 480,0 720,30 C960,60 1200,100 1440,50 L1440,100 L0,100 Z"
        fill="var(--color-bg)"
      />
    </svg>
  );
}
