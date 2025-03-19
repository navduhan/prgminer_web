// Footer component

// Author: Naveen Duhan

// import dependencies

'use client';
import { memo } from 'react';


// Footer links data
const FOOTER_LINKS = [
  { href: 'https://usu.edu', label: 'Utah State University' },
  { href: 'https://kaabil.net', label: 'Kaundal Bioinformatics Laboratory' },
  { href: 'https://caas.usu.edu/psc/', label: 'Department of Plants, Soils and Climate' },
  { href: 'https://biosystems.usu.edu', label: 'Center for Integrated BioSystems' }
];

// External link component with proper attributes
const ExternalLink = memo(({ href, children, className = '' }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`transition-colors duration-200 hover:text-rose-600 focus:text-rose-700 focus:outline-none focus:underline ${className}`}
  >
    {children}
  </a>
));
ExternalLink.displayName = 'ExternalLink';

// Divider component
const Divider = memo(() => (
  <span className="hidden md:inline text-gray-500 mx-1" aria-hidden="true">|</span>
));
Divider.displayName = 'Divider';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-gradient-to-r from-blue-300/50 to-purple-300/50 mt-5 border-t border-gray-200 py-4 md:py-6 shadow-inner">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center text-center gap-2 md:gap-3">
          <span className="text-gray-800 font-medium">© {currentYear} </span>
          <Divider />
          {FOOTER_LINKS.map((link, index) => (
            <div key={link.href} className="flex items-center">
            
              {index > 0 && <Divider />}
              <ExternalLink href={link.href} className="text-gray-800">
                {link.label}
              </ExternalLink>
            </div>
          ))}
        </div>
     
      </div>
    </footer>
  );
};

export default memo(Footer);
