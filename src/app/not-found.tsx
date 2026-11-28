import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-12 sm:py-16">
      <section
        aria-labelledby="not-found-heading"
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-white"
      >
        <div className="space-y-4 p-6 sm:p-8">
          <p className="font-mono text-xs font-extrabold uppercase tracking-wider text-[var(--tomato)]">
            404 · Page Not Found
          </p>
          <h1
            id="not-found-heading"
            className="font-display text-2xl font-bold text-[var(--navy)] sm:text-3xl"
          >
            Page not found
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--ink-secondary)]">
            The requested address does not match an active PRGminer page or stored job.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/" className="btn-navy">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Overview</span>
            </Link>
            <Link href="/prediction" className="btn-outline-sharp">
              <span>Predict Sequences</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
