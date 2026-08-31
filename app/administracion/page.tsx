import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Clock3, Euro, ShieldCheck, UserRound } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminReservationActions } from "@/components/admin-reservation-actions";
import { getAdminUser } from "@/lib/admin-auth";
import { getAdminReservations } from "@/lib/admin-reservations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false, nocache: true },
};

const statusLabels: Record<string, string> = {
  pending_payment: "Pendiente de pago",
  paid: "Pagada",
  payment_failed: "Pago fallido",
  cancelled: "Cancelada",
  refunded: "Reembolsada",
  completed: "Completada",
  no_show: "No presentada",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getAdminUser();
  if (!user) redirect("/administracion/acceso");
  const { status } = await searchParams;
  const reservations = await getAdminReservations(status);
  const paidTotal = reservations.filter((item) => item.status === "paid").reduce((total, item) => total + item.amount_cents, 0);

  return <main className="admin-page">
    <header className="admin-header">
      <div><p className="eyebrow"><ShieldCheck /> Sesión empresarial protegida</p><h1>Agenda de Tarot Luna</h1><p>{user.email}</p></div>
      <AdminLogoutButton />
    </header>

    <section className="admin-stats" aria-label="Resumen">
      <div><CalendarDays /><span>Registros mostrados</span><strong>{reservations.length}</strong></div>
      <div><Euro /><span>Pagado mostrado</span><strong>{(paidTotal / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</strong></div>
      <div><Clock3 /><span>Antelación mínima</span><strong>24 horas</strong></div>
    </section>

    <nav className="admin-filters" aria-label="Filtrar citas">
      <Link href="/administracion" className={!status ? "active" : ""}>Todas</Link>
      {Object.entries(statusLabels).map(([value, label]) => <Link key={value} href={`/administracion?status=${value}`} className={status === value ? "active" : ""}>{label}</Link>)}
    </nav>

    <section className="admin-list">
      {reservations.length === 0 ? <div className="admin-empty"><CalendarDays /><h2>No hay citas con este estado</h2><p>Las nuevas solicitudes aparecerán aquí automáticamente.</p></div> : reservations.map((item) => <article className="admin-reservation" key={item.reservation_key}>
        <div className="admin-reservation-main">
          <div className="admin-date"><strong>{new Date(`${item.appointment_date}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</strong><span>{item.appointment_time.slice(0, 5)} · {item.duration} min</span></div>
          <div><h2>{item.name}</h2><p className="admin-category">{item.category} · {(item.amount_cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p></div>
          <span className={`admin-status status-${item.status}`}>{statusLabels[item.status] ?? item.status}</span>
        </div>
        <div className="admin-contact"><span><UserRound /> {item.email}</span><span>{item.phone}</span></div>
        {item.notes && <p className="admin-notes">{item.notes}</p>}
        <AdminReservationActions reservationKey={item.reservation_key} status={item.status} />
        <footer><span>Solicitud #{item.id}</span><span>{item.payment_order ? `Pedido ${item.payment_order}` : "Sin referencia de pago"}</span></footer>
      </article>)}
    </section>
  </main>;
}
