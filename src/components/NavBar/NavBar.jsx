"use client";
// PRGminer Navbar

// Author: Naveen Duhan

// import dependencies


import { useState, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineHome } from "react-icons/ai";
import { FaTerminal } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { BiHelpCircle } from "react-icons/bi";

// get base url from environment variables
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// navbar links
const NAVBAR_LINKS = [
  {href: "/", label: "Home", icon: AiOutlineHome},
  {href: "/prediction", label: "Prediction", icon: FaTerminal},
  {href: "/standalone", label: "Standalone", icon: FaTerminal},
  {href: "/help", label: "Help", icon: BiHelpCircle},

];
// memoized logo component
const Logo = memo(({ src, alt, width, height, className }) => {
  return (
   
      <Image src={src} alt={alt} width={width} height={height} className={className} />

  );
});

Logo.displayName = "Logo";

// navigation link component

const NavLink = memo(({href, label, icon: Icon, className}) => {
  return (
    <Link href={href} className={className}>
      <Icon className="text-xl"/>
      {label}
    </Link>
  );
});

NavLink.displayName = "NavLink";

// navbar component
const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsOpen(prev =>!prev);
    }, []);

 return (
    <nav className="bg-gradient-to-r from-blue-300/50 to-purple-300/50 shadow-lg py-4 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between">
          {/* Left Logo Section (Desktop) */}
          <div className="hidden md:flex items-center space-x-4 sm:space-x-6 lg:space-x-10">
            <Logo
              src={`${basePath}/images/lab_logo_red.png`}
              alt="Lab Logo"
              width={170}
              height={170}
              className="w-24 sm:w-32 lg:w-[150px] h-auto object-contain"
            />
            <Logo
              src={`${basePath}/images/logo.png`}
              alt="Logo"
              width={100}
              height={100}
              className="w-16 sm:w-20 lg:w-[80px] h-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center font-semibold space-x-4 lg:space-x-8 text-black">
            {NAVBAR_LINKS.map(({ href, icon, label }) => (
              <NavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                className="hover:text-rose-600 transition-colors flex items-center gap-2 group"
              />
            ))}
          </div>

          {/* Right Logo Section (Desktop) */}
          <div className="hidden sm:flex items-center">
            <Logo
              src={`${basePath}/images/usulogo2.png`}
              alt="USU Logo"
              width={150}
              height={150}
              className="w-24 sm:w-28 lg:w-[120px] h-auto object-contain"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-white hover:text-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-gradient-to-r from-blue-500 to-indigo-600 mt-0">
            <div className="flex flex-col items-center space-y-4 mb-6 py-6">
              <div className="flex items-center justify-center space-x-4">
                <Logo
                  src={`${basePath}/images/lab_logo_red.png`}
                  alt="Lab Logo"
                  width={170}
                  height={170}
                  className="w-24 h-auto object-contain"
                />
                <Logo
                  src={`${basePath}/images/logo.png`}
                  alt="Logo"
                  width={100}
                  height={100}
                  className="w-16 h-auto object-contain"
                />
              </div>
              <Logo
                src={`${basePath}/images/usulogo2.png`}
                alt="USU Logo"
                width={150}
                height={150}
                className="w-24 h-auto object-contain"
              />
            </div>
            <div className="px-2 pb-3 space-y-1">
              {NAVBAR_LINKS.map(({ href, icon, label }) => (
                <NavLink
                  key={href}
                  href={href}
                  icon={icon}
                  label={label}
                  className="px-3 py-2 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;