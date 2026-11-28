'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { withBasePath } from '@/lib/base-path';

const NAV_LINKS = [
  { name: 'Overview', href: '/' },
  { name: 'Predict', href: '/prediction' },
  { name: 'CLI Package', href: '/standalone' },
  { name: 'Guide', href: '/help' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const lastCollapsedWidth = useRef(0);

  const syncLayout = useCallback((forceMeasure = false) => {
    const header = headerRef.current;
    const inner = innerRef.current;
    const menu = menuRef.current;
    if (!header || !inner || !menu) return;

    const currentlyWide = header.classList.contains('is-wide');
    const currentWidth = inner.clientWidth;

    if (!currentlyWide && !forceMeasure && currentWidth <= lastCollapsedWidth.current) {
      return;
    }

    const wasOpen = menu.matches(':popover-open');
    header.classList.add('is-measuring', 'is-wide');
    menu.removeAttribute('popover');

    const fits = inner.scrollWidth <= inner.clientWidth;
    if (fits) {
      lastCollapsedWidth.current = 0;
    } else {
      header.classList.remove('is-wide');
      lastCollapsedWidth.current = currentWidth;
      menu.setAttribute('popover', 'auto');
      if (wasOpen) {
        try {
          menu.showPopover();
        } catch {
          // Ignore
        }
      }
    }

    requestAnimationFrame(() => {
      header.classList.remove('is-measuring');
    });
  }, []);

  useEffect(() => {
    syncLayout(true);
    const header = headerRef.current;
    const menu = menuRef.current;
    if (!header || !menu) return;

    const observer = new ResizeObserver(() => syncLayout(false));
    observer.observe(header);
    observer.observe(menu);
    return () => observer.disconnect();
  }, [syncLayout]);

  const closeMobilePopover = () => {
    const menu = menuRef.current;
    if (menu?.hasAttribute('popover') && menu.matches(':popover-open')) {
      try {
        menu.hidePopover();
      } catch {
        // Ignore
      }
    }
  };

  return (
    <header ref={headerRef} className="site-header is-wide">
      <div
        ref={innerRef}
        className="header-inner mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center gap-7 h-full">
          <Link href="/" className="flex items-center gap-2.5 text-white" aria-label="PRGminer home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--tomato)] font-mono text-xs font-extrabold text-white">
              PRG
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">PRGminer</span>
          </Link>

          <nav className="site-nav flex items-center h-full" aria-label="Primary">
            <button
              className="menu-button inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-3.5 py-2 text-sm font-bold text-white hover:bg-white/10"
              type="button"
              popoverTarget="prg-site-menu"
              popoverTargetAction="toggle"
              aria-controls="prg-site-menu"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
              <span>Menu</span>
            </button>

            <ul ref={menuRef} id="prg-site-menu" className="site-menu">
              {NAV_LINKS.map(({ name, href }) => {
                const active =
                  href === '/'
                    ? pathname === '/'
                    : pathname === href || pathname?.startsWith(`${href}/`);
                return (
                  <li key={href} className="flex items-center">
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className="prg-nav-link"
                      onClick={closeMobilePopover}
                    >
                      <span>{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <a
            href="https://kaabil.net"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-white transition hover:text-[#ff9c92]"
          >
            <span className="font-bold text-[#ff867a]">KAABiL</span> · Bioinformatics Lab
          </a>
          <span className="h-4 w-px bg-white/20" aria-hidden="true" />
          <a
            href="https://www.usu.edu"
            target="_blank"
            rel="noreferrer"
            aria-label="Utah State University"
          >
            <Image
              src={withBasePath('/images/usulogo2.png')}
              alt="Utah State University"
              width={136}
              height={36}
              className="h-7 w-auto brightness-0 invert opacity-95 transition hover:opacity-100"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
