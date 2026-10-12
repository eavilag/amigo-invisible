export function GiftIcon({ className = 'hero-gift' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <rect x="14" y="48" width="92" height="62" rx="8" className="gift-box" strokeWidth="5" />
      <rect x="8" y="34" width="104" height="22" rx="6" className="gift-lid" strokeWidth="5" />
      <rect x="52" y="34" width="16" height="76" className="gift-ribbon" />
      <path
        d="M60 34c-6-16-30-22-30-8 0 8 18 8 30 8zm0 0c6-16 30-22 30-8 0 8-18 8-30 8z"
        className="gift-ribbon gift-bow"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z"
      />
    </svg>
  );
}
