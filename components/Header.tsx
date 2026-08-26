"use client";

import React, { useState } from "react";
import Link from "next/link";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header fixed top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-md border-b border-white/6 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-lg text-white">Ajudante</Link>
        </div>

        <nav>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-white/6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>

          <ul className={`hidden md:flex items-center gap-4 text-sm`}>
            <li><Link href="/about" className="hover:underline">Sobre</Link></li>
            <li><Link href="/features" className="hover:underline">Recursos</Link></li>
            <li><Link href="/docs" className="hover:underline">Docs</Link></li>
            <li><Link href="/contact" className="hover:underline">Contato</Link></li>
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-3 px-4 pb-4">
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/about" onClick={() => setOpen(false)}>Sobre</Link></li>
            <li><Link href="/features" onClick={() => setOpen(false)}>Recursos</Link></li>
            <li><Link href="/docs" onClick={() => setOpen(false)}>Docs</Link></li>
            <li><Link href="/contact" onClick={() => setOpen(false)}>Contato</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
