"use client";
import Link from "next/link";
import { Mail, Menu, MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navigation } from "@/lib/site-content";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <div className="site-shell">
    <header className="site-header"><div className="header-inner">
      <Link href="/" className="brand" aria-label="Tarot Luna, inicio"><span className="brand-mark"><MoonStar /></span><span><b>Tarot</b> Luna</span></Link>
      <nav className="desktop-nav" aria-label="Navegación principal">{navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
      <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="menu-button" aria-label="Abrir menú"><Menu /></Button></SheetTrigger>
        <SheetContent className="mobile-menu"><SheetHeader><SheetTitle>Tarot Luna</SheetTitle><SheetDescription>Consultas privadas y personalizadas</SheetDescription></SheetHeader><nav>{navigation.map((item) => <SheetClose asChild key={item.href}><Link href={item.href}>{item.label}</Link></SheetClose>)}</nav></SheetContent>
      </Sheet>
    </div></header>
    {children}
    <footer className="site-footer"><div className="footer-grid">
      <div><Link href="/" className="brand footer-brand"><MoonStar /> Tarot Luna</Link><p>Consultas privadas, cercanas y personalizadas.</p></div>
      <div><h2>Contacto</h2><a href="mailto:lunatarotista211@gmail.com"><Mail /> lunatarotista211@gmail.com</a></div>
      <div><h2>Redes sociales</h2><a href="https://www.instagram.com/tarot_lunaaaa/" target="_blank" rel="noreferrer"><span className="social-icon">◎</span> @tarot_lunaaaa</a><a href="https://www.tiktok.com/@tarotlunaaa4" target="_blank" rel="noreferrer"><span className="tiktok-icon">♪</span> @tarotlunaaa4</a></div>
    </div><p className="footer-note">El tarot ofrece orientación personal y no sustituye asesoramiento médico, jurídico o financiero.</p></footer>
  </div>;
}

