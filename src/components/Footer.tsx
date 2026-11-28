import Image from 'next/image';
import Link from 'next/link';
import { withBasePath } from '@/lib/base-path';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--surface)] py-7">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="space-y-1.5 text-sm text-[var(--ink-secondary)]">
          <p className="text-base font-bold text-[var(--navy)]">
            PRGminer · Kaundal Artificial Intelligence &amp; Advanced Bioinformatics Lab (KAABiL)
          </p>
          <p>
            Department of Plants, Soils &amp; Climate · Center for Integrated BioSystems · Utah State
            University
          </p>
          <p className="pt-0.5 font-mono text-[13px] text-[var(--ink-secondary)]">
            <a
              href="https://doi.org/10.3389/fpls.2025.1411525"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[var(--tomato)] hover:underline"
            >
              Front. Plant Sci. 16:1411525 (2025)
            </a>
            {' · '}
            <a
              href="https://github.com/usubioinfo/PRGminer"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[var(--navy)] hover:underline"
            >
              github.com/usubioinfo/PRGminer
            </a>
            {' · '}
            <Link href="/help" className="font-semibold hover:text-[var(--navy)] hover:underline">
              User Guide
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a href="https://kaabil.net" target="_blank" rel="noreferrer">
            <Image
              src={withBasePath('/images/lab_logo_red.png')}
              alt="KAABiL Lab"
              width={130}
              height={38}
              className="h-8 w-auto object-contain"
            />
          </a>
          <a href="https://www.usu.edu" target="_blank" rel="noreferrer">
            <Image
              src={withBasePath('/images/usulogo2.png')}
              alt="Utah State University"
              width={126}
              height={38}
              className="h-8 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
