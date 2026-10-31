export function StoreMarks({ soon }: { soon: string }) {
  return (
    <div className="store-availability">
      <div className="store-marks">
        <span className="store-mark">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M17.05 12.54c.03 3.16 2.77 4.21 2.8 4.23-.02.07-.44 1.5-1.45 2.98-.88 1.28-1.79 2.55-3.22 2.58-1.4.03-1.85-.83-3.45-.83-1.6 0-2.1.8-3.42.86-1.38.05-2.43-1.39-3.31-2.66-1.8-2.6-3.18-7.35-1.33-10.56.92-1.59 2.56-2.6 4.34-2.63 1.36-.03 2.64.92 3.47.92.83 0 2.4-1.14 4.04-.97.68.03 2.6.28 3.83 2.08-.1.06-2.29 1.33-2.3 4zm-2.64-7.83c.73-.88 1.22-2.1 1.08-3.32-1.05.04-2.33.7-3.09 1.58-.68.78-1.28 2.03-1.12 3.23 1.17.09 2.37-.6 3.13-1.49z" />
          </svg>
          <span>App Store</span>
        </span>
        <span className="store-mark">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M3 2.4v19.2L12.6 12 3 2.4zm1.5-.7 12 6.9-2.8 2.8L4.5 1.7zm9.2 10.9 2.8 2.8-12 6.9 9.2-9.7zm1.4-.6 3-3 3.5 2c.8.4.8 1.6 0 2l-3.5 2-3-3z" />
          </svg>
          <span>Google Play</span>
        </span>
      </div>
      <p>{soon}</p>
    </div>
  );
}