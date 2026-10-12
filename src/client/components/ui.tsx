import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { t } from '../i18n/es';
import { formatDate } from '../lib/format';
import { WhatsAppIcon } from './Icons';

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'link';

const cls = (variant: Variant, extra = '') => `btn btn-${variant} ${extra}`.trim();

export function Button({
  variant = 'secondary',
  className,
  busy = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; busy?: boolean }) {
  return (
    <button type="button" className={cls(variant, className)} {...props} disabled={busy || disabled} aria-busy={busy || undefined}>
      {children}
    </button>
  );
}

/** Navegación interna con aspecto de botón. */
export function NavButton({
  to,
  variant = 'secondary',
  className,
  children,
}: {
  to: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={to} className={cls(variant, className)}>
      {children}
    </Link>
  );
}

/** Abre WhatsApp en una pestaña nueva (sin enviar datos a terceros desde nuestro servidor). */
export function WhatsAppButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls('whatsapp')}>
      <WhatsAppIcon />
      {children}
    </a>
  );
}

export function BackButton({ to, label = t.back }: { to: string; label?: string }) {
  return (
    <Link href={to} className="btn btn-secondary back">
      {label}
    </Link>
  );
}

/**
 * Contenedor de pantalla: al montarse lleva el foco al título y sube arriba,
 * para que los lectores de pantalla anuncien la pantalla nueva.
 */
export function Page({ children, title, eyebrow, back }: { children: ReactNode; title: ReactNode; eyebrow?: ReactNode; back?: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);
  return (
    <main className="page">
      {back}
      <div className="title-block">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 ref={heading} tabIndex={-1}>
          {title}
        </h1>
      </div>
      {children}
    </main>
  );
}

export function Card({ title, children, as: Tag = 'section' }: { title?: ReactNode; children: ReactNode; as?: 'section' | 'div' }) {
  return (
    <Tag className="card">
      {title && <h2>{title}</h2>}
      {children}
    </Tag>
  );
}

export function Facts({ deliveryDate, budget }: { deliveryDate: string | null; budget: string | null }) {
  if (!deliveryDate && !budget) return null;
  return (
    <dl className="facts">
      {deliveryDate && (
        <div className="fact">
          <dt>{t.delivery}</dt>
          <dd>{formatDate(deliveryDate)}</dd>
        </div>
      )}
      {budget && (
        <div className="fact">
          <dt>{t.budget}</dt>
          <dd>{budget}</dd>
        </div>
      )}
    </dl>
  );
}

export function Notice({ tone = 'warn', children }: { tone?: 'warn' | 'ok'; children: ReactNode }) {
  return <p className={tone === 'ok' ? 'notice-ok' : 'notice'}>{children}</p>;
}
