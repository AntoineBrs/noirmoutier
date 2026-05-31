"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useProfile } from "./ProfileProvider";
import { Avatar } from "./Avatar";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/carnet", label: "Carnet de famille" },
];

export function Header() {
  const { current, signOut } = useProfile();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!current) return null;

  return (
    <header className="sticky top-0 z-40 glass border-b border-ocean-500/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🏝️</span>
          <span className="font-display text-lg sm:text-xl text-ocean-700 leading-none">
            Noirmoutier
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-ocean-500/12 text-ocean-700"
                    : "text-ocean-600/70 hover:text-ocean-700 hover:bg-ocean-500/8"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-ocean-500/8 transition-colors"
          >
            <Avatar profile={current} size={34} />
            <span className="hidden sm:block text-sm font-medium text-ocean-700">
              {current.name}
            </span>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 z-20 bg-white rounded-xl2 shadow-soft border border-ocean-500/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-ocean-500/10">
                  <p className="text-xs text-ocean-600/60">Connecté en tant que</p>
                  <p className="font-medium text-ocean-700">{current.name}</p>
                </div>
                <Link
                  href="/profil"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm text-ocean-700 hover:bg-ocean-500/8 transition-colors border-b border-ocean-500/10"
                >
                  Mon profil
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-ocean-700 hover:bg-ocean-500/8 transition-colors"
                >
                  Changer de profil
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation mobile */}
      <nav className="sm:hidden flex items-center justify-center gap-1 pb-2 px-2">
        {LINKS.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                active
                  ? "bg-ocean-500/12 text-ocean-700"
                  : "text-ocean-600/70"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
