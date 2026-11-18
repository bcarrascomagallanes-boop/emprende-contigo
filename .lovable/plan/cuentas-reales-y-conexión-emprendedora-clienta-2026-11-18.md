# Cuentas reales y conexión Emprendedora ↔ Clienta

## Qué vas a tener
- **Inicio de sesión real** con correo y contraseña propia para cada persona. Al registrarse llega un correo de confirmación con enlace. También "Olvidé mi contraseña" con enlace al correo.
- Al registrarse, la persona elige si es **Clienta** o **Emprendedora**. El perfil de **Administrador** no se puede elegir: solo se activa para **bcarrascomagallanes@gmail.com** y **angieeugenia09@gmail.com** (cada una crea su propia contraseña al registrarse; yo nunca la veo).
- **Clienta**: ve la lista de emprendedoras (Gina Magallanes destacada), elige una, ve sus servicios y ofertas, reserva cita y le escribe mensajes.
- **Emprendedora**: recibe las reservas en su agenda, contesta los mensajes de sus clientas, crea/edita/elimina sus servicios y sus ofertas, y edita su perfil de negocio.
- **Administrador**: ve a todas las emprendedoras y puede modificar cualquier agenda, agregar o eliminar servicios, y editar o eliminar perfiles de emprendedoras.
- Todo se guarda en la nube (no en el aparato), así clienta y emprendedora ven lo mismo en tiempo real.

## Pasos
1. Activar Lovable Cloud (base de datos y cuentas).
2. Tablas: perfiles, roles (separados, seguros), negocios, servicios, ofertas, citas, mensajes; con reglas para que cada quien vea solo lo suyo y el administrador vea todo.
3. Asignación automática del rol administrador solo a los dos correos autorizados.
4. Pantallas de registro, ingreso, confirmación y nueva contraseña.
5. Conectar las vistas de clienta y emprendedora existentes a los datos reales, y crear el panel de administrador.
6. Probar el recorrido completo: clienta reserva y escribe → emprendedora lo ve y responde → administrador lo edita.

## Detalles técnicos
- Roles en tabla `user_roles` + función `has_role`; trigger en alta de usuario que asigna `admin` si el email está en la lista y si no el rol elegido (`cliente`/`emprendedor`), nunca admin desde el cliente.
- RLS: servicios/ofertas públicas de lectura; escritura por dueña o admin; citas y mensajes visibles a clienta y emprendedora involucradas y admin.
- Mensajes con realtime.
- Se reemplaza el acceso de ejemplo por sesión real; la selección de perfil deja de ser solo visual.
