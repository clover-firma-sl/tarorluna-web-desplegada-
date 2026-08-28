import { Suspense } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ReservationForm } from "@/components/reservation-form";

const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc78b-8jgqQ2H8LxFUBAC1dWDGHJ1tQGdZ9xrBSQ_Bk56jI-A/viewform?usp=header";

export default function ReservePage() {
  return <SiteShell><main className="inner-page reserve-page">
    <div className="section-heading"><p className="eyebrow">Agenda online</p><h1>Reserva tu consulta</h1><p>Elige la forma de reserva que te resulte más cómoda.</p></div>
    <section className="google-form-card" aria-labelledby="google-form-title">
      <span className="google-form-icon"><FileText /></span>
      <div><p className="eyebrow">Opción recomendada</p><h2 id="google-form-title">Reservar mediante Google Forms</h2><p>Completa el formulario de Tarot Luna. La solicitud llegará directamente a <strong>lunatarotista211@gmail.com</strong>.</p></div>
      <a className="primary-button" href={googleFormUrl} target="_blank" rel="noreferrer">Abrir formulario <ExternalLink /></a>
    </section>
    <div className="reservation-divider"><span>O reserva desde nuestra agenda</span></div>
    <Suspense fallback={<p>Cargando agenda…</p>}><ReservationForm /></Suspense>
  </main></SiteShell>;
}
