import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-12 sm:py-16">
      <section
        aria-labelledby="not-found-heading"
        className="mx-auto max-w-2xl border border-[var(--line)] border-t-2 border-t-[var(--tomato)] bg-white"
      >
        <div className="space-y-4 p-6 sm:p-8">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--tomato)]">
            HTTP 404 · Route Not Found
          </p>
          <h1
            id="not-found-heading"
            className="font-display text-3xl font-semibold leading-tight text-[var(--navy)]"
          >
            This page does not exist in PRGminer
          </h1>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            The requested address does not match an active PRGminer route or stored job workspace.
            Return to the overview or jump directly to the Prediction Workbench, Standalone CLI
            distribution, or Reference Manual.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/" className="btn-navy">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Return to PRGminer Overview</span>
            </Link>
            <Link href="/prediction" className="btn-outline-sharp">
              <span>Open Prediction Workbench</span>
            </Link>
          </div>
        </div>

        <div className="grid divide-y divide-[var(--line)] border-t border-[var(--line)] bg-[var(--surface)] font-mono text-xs sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Link
            href="/prediction?example=panel"
            className="px-5 py-3 font-semibold text-[var(--navy)] hover:bg-white hover:text-[var(--tomato)]"
          >
            01 · 9-Protein Demo &rarr;
          </Link>
          <Link
            href="/standalone"
            className="px-5 py-3 font-semibold text-[var(--navy)] hover:bg-white hover:text-[var(--tomato)]"
          >
            02 · Standalone CLI &rarr;
          </Link>
          <Link
            href="/help"
            className="px-5 py-3 font-semibold text-[var(--navy)] hover:bg-white hover:text-[var(--tomato)]"
          >
            03 · Reference Manual &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
