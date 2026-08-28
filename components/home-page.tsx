import Link from "next/link";
import { ArrowRight, CalendarDays, LockKeyhole, MoonStar } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { categories } from "@/lib/site-content";

export function HomePage() { return <SiteShell><main>
  <section className="hero"><div className="hero-aura" /><div className="hero-content"><p className="eyebrow"><MoonStar /> Consultas privadas de tarot</p><h1>Descubre las respuestas que buscas</h1><p className="hero-copy">Una consulta cercana, confidencial y personalizada para ayudarte a encontrar claridad.</p><div className="hero-actions"><Link className="primary-button" href="/reservar">Reservar consulta <ArrowRight /></Link><Link className="secondary-button" href="/quienes-somos">Conoce a Tarot Luna</Link></div><div className="trust-row"><span><LockKeyhole /> Confidencial</span><span><CalendarDays /> Reserva online</span><span><MoonStar /> Lectura personal</span></div></div></section>
  <section className="section categories-section"><div className="section-heading"><p className="eyebrow">Elige tu consulta</p><h2>Una lectura para cada momento</h2><p>Selecciona el área que quieres tratar. La consulta será realizada personalmente por Tarot Luna.</p></div><div className="category-grid">{Object.entries(categories).map(([key, item]) => { const Icon = item.icon; return <Link href={`/${key}`} className="category-card" key={key}><span className="category-icon"><Icon /></span><p>{item.eyebrow}</p><h3>{item.title}</h3><span className="card-link">Ver consulta <ArrowRight /></span></Link>; })}</div></section>
  <section className="section booking-banner"><div><p className="eyebrow">Tu momento de claridad</p><h2>Reserva tu consulta en pocos minutos</h2><p>Elige el tipo de consulta, la duración y una franja disponible.</p></div><Link className="primary-button" href="/reservar">Ver agenda <CalendarDays /></Link></section>
</main></SiteShell>; }
