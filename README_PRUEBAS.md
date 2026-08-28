# Tarot Luna — prueba de agenda y base de datos

Esta entrega contiene el código completo de la web y una agenda persistente con base de datos D1.

## Qué funciona

- Horarios automáticos según el día de la semana.
- Consultas de 30 o 60 minutos.
- Consulta de disponibilidad antes de mostrar las horas.
- Bloqueo de todas las franjas ocupadas por una reserva.
- Protección frente a reservas simultáneas y solapamientos.
- Reservas guardadas con estado `pending`.
- Google Forms como alternativa de reserva.
- Preparación para avisos por correo mediante Resend.

## Horario configurado

- Lunes y viernes: 09:00–13:00 y 18:00–21:00.
- Martes, miércoles y jueves: 18:00–21:00.
- Sábados y domingos: 10:00–13:00 y 17:00–20:00.

Las franjas se generan cada 30 minutos. Una consulta de 60 minutos bloquea dos franjas consecutivas.

## Probar el proyecto

Requisitos: Node.js 22 o superior.

1. Descomprime el ZIP.
2. Abre una terminal dentro de la carpeta.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev` para la interfaz.
5. Para probar la persistencia real debe desplegarse con una base D1 vinculada como `DB`; las migraciones están incluidas en `drizzle/`.

## Correos y pagos

El correo automático se activa configurando `RESEND_API_KEY` y `RESERVATION_FROM_EMAIL` en el alojamiento. El destinatario ya está fijado en `lunatarotista211@gmail.com`.

Bizum todavía no cobra dinero. Para activarlo hay que añadir la pasarela del banco o Redsys con las credenciales del comercio y los precios definitivos.

No incluyas nunca contraseñas, claves bancarias o claves de correo dentro de los archivos del proyecto.
