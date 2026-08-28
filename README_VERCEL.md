# Tarot Luna — despliegue en Vercel

Este ZIP contiene la web completa preparada como proyecto Next.js para Vercel.

## Prueba rápida

1. Descomprime el ZIP y súbelo a un repositorio de GitHub, o impórtalo directamente desde Vercel.
2. En Vercel pulsa **Add New > Project**, selecciona el proyecto y deja la configuración detectada de Next.js.
3. Pulsa **Deploy**. TikTok, Instagram, correo y Google Forms funcionan sin configurar variables.

## Activar la agenda con base de datos

1. Crea un proyecto en Supabase.
2. Abre el editor SQL, pega el contenido de `supabase-schema.sql` y ejecútalo.
3. En Vercel > Project > Settings > Environment Variables añade `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` usando `.env.example` como guía.
4. Vuelve a desplegar.

La clave `SUPABASE_SERVICE_ROLE_KEY` se utiliza únicamente en la ruta del servidor y nunca se expone al navegador. Si no conectas Supabase, la web se despliega y el botón de Google Forms sigue disponible, pero la agenda interna no podrá guardar citas.

## Aviso por correo opcional

Para enviar un aviso a `lunatarotista211@gmail.com` al guardar una cita interna, añade `RESEND_API_KEY` y un remitente verificado en `RESERVATION_FROM_EMAIL`.

## Reglas actuales de reserva

- 10 minutos: 10 € (consulta exprés).
- 30 minutos: 25 €.
- 60 minutos: 50 €.
- Todas las reservas requieren un mínimo de 24 horas exactas de antelación.
- La disponibilidad se calcula en bloques de 10 minutos.
- Una cita solo debe ocupar definitivamente el horario tras confirmarse el pago.

## Redsys y panel de administración

`.env.example` contiene los nombres de las variables privadas necesarias. No escribas credenciales reales dentro de ningún archivo ni las subas a GitHub: añádelas únicamente como variables de entorno protegidas en Vercel.

## Enlaces incluidos

- TikTok: https://www.tiktok.com/@tarotlunaaa4
- Instagram: https://www.instagram.com/tarot_lunaaaa/
- Google Forms: https://docs.google.com/forms/d/e/1FAIpQLSc78b-8jgqQ2H8LxFUBAC1dWDGHJ1tQGdZ9xrBSQ_Bk56jI-A/viewform?usp=header
