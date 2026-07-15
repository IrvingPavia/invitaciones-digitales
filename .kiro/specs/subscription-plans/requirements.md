# Requirements Document

## Introduction

Sistema de comercialización para la plataforma Vitely que permite a usuarios potenciales auto-registrarse desde la landing page pública, seleccionar un paquete de evento, realizar el pago único y acceder a las funcionalidades correspondientes según el paquete adquirido. El modelo es de pago por evento (pay-per-event): los usuarios compran 1 o más eventos, cada uno con una fecha de expiración vinculada a la fecha del evento. No existe facturación recurrente ni suscripciones mensuales/anuales.

## Glossary

- **Sistema_Registro**: Módulo encargado del auto-registro de nuevos usuarios desde la landing page pública
- **Sistema_Paquetes**: Módulo que gestiona la definición, visualización y asignación de paquetes de evento
- **Sistema_Pagos**: Módulo que procesa pagos únicos y gestiona transacciones con pasarelas externas
- **Sistema_Permisos**: Módulo que controla el acceso a funcionalidades basado en los paquetes activos del usuario
- **Sistema_Eventos**: Módulo que gestiona el ciclo de vida de los eventos (activación, desactivación, postergación)
- **Panel_Admin**: Interfaz de administración para gestionar paquetes, compras y usuarios
- **Landing_Publica**: Página de marketing pública de Vitely con información de paquetes y opción de registro
- **Pasarela_Pagos**: Servicio externo de procesamiento de pagos (Stripe, MercadoPago)
- **Paquete**: Tipo de producto que el usuario compra para crear un evento (Invitación Digital, Tarjeta Física, Completo)
- **Evento_Comprado**: Unidad de uso adquirida por el usuario; tiene fecha de evento y fecha de desactivación
- **Periodo_Gracia**: Período de 2 a 3 días calendario después de la fecha del evento durante el cual la invitación permanece activa
- **Postergacion**: Cambio de la fecha de un evento ya comprado, sujeto a tarifa adicional y restricciones
- **Usuario_Prospecto**: Persona que se registra desde la landing pública y aún no ha adquirido un paquete
- **Evento_Completado**: Evento cuya fecha más período de gracia han pasado y se considera finalizado

## Requirements

### Requerimiento 1: Auto-registro de usuarios

**User Story:** Como visitante de la landing page de Vitely, quiero poder registrarme de forma autónoma, para poder acceder a la plataforma sin depender de un administrador.

#### Criterios de Aceptación

1. THE Landing_Publica SHALL mostrar un botón "Registrarse" visible en la navegación principal
2. WHEN un visitante accede al formulario de registro, THE Sistema_Registro SHALL solicitar nombre completo, correo electrónico y contraseña
3. WHEN un visitante envía el formulario con datos válidos, THE Sistema_Registro SHALL crear una cuenta con rol "client" y estado "pendiente_verificacion"
4. WHEN un visitante envía el formulario con un correo ya registrado, THE Sistema_Registro SHALL mostrar un mensaje indicando que el correo ya está en uso
5. WHEN una cuenta es creada exitosamente, THE Sistema_Registro SHALL enviar un correo electrónico de verificación con un enlace de activación válido por 24 horas
6. WHEN un usuario accede al enlace de verificación dentro del período válido, THE Sistema_Registro SHALL activar la cuenta y redirigir al dashboard
7. IF un usuario accede a un enlace de verificación expirado, THEN THE Sistema_Registro SHALL mostrar un mensaje de expiración con opción de reenviar el correo de verificación
8. WHILE una cuenta tiene estado "pendiente_verificacion", THE Sistema_Registro SHALL impedir el acceso al dashboard

### Requerimiento 2: Definición de paquetes de evento

**User Story:** Como administrador de Vitely, quiero definir paquetes de evento con distintas funcionalidades y precios, para ofrecer opciones diferenciadas a los clientes bajo un modelo de pago por evento.

#### Criterios de Aceptación

1. THE Sistema_Paquetes SHALL soportar tres tipos de paquete: "Invitación Digital" (solo landing page builder), "Tarjeta Física" (solo editor de tarjetas + PDF) y "Completo" (acceso total a landing + tarjetas)
2. THE Sistema_Paquetes SHALL asociar cada paquete con un precio unitario por evento
3. THE Sistema_Paquetes SHALL soportar un paquete gratuito de prueba ("Trial") con duración de 7 días, limitado a 1 evento con máximo 30 invitados
4. WHEN un administrador crea o edita un paquete desde el Panel_Admin, THE Sistema_Paquetes SHALL permitir configurar: nombre, descripción, precio unitario, funcionalidades incluidas, límite de invitados y estado (activo/inactivo)
5. WHERE un usuario compra múltiples eventos del mismo paquete en una sola transacción, THE Sistema_Paquetes SHALL aplicar un descuento por volumen configurable desde el Panel_Admin
6. THE Sistema_Paquetes SHALL almacenar el historial de cambios de precios sin afectar compras existentes
7. WHILE un paquete tiene estado "inactivo", THE Sistema_Paquetes SHALL ocultar el paquete de la vista pública pero mantener activos los eventos ya comprados asociados

### Requerimiento 3: Visualización y selección de paquetes

**User Story:** Como usuario registrado, quiero ver los paquetes disponibles con sus características y precios, para elegir el que mejor se adapte a mi evento.

#### Criterios de Aceptación

1. WHEN un usuario verificado inicia sesión por primera vez sin paquetes comprados, THE Sistema_Paquetes SHALL redirigir al catálogo de paquetes disponibles
2. THE Sistema_Paquetes SHALL mostrar cada paquete con: nombre, precio unitario, lista de funcionalidades incluidas, límite de invitados y un botón de selección
3. WHEN un usuario selecciona un paquete de pago, THE Sistema_Paquetes SHALL solicitar la cantidad de eventos a comprar y redirigir al flujo de pago con el monto total calculado
4. WHEN un usuario selecciona el paquete Trial, THE Sistema_Paquetes SHALL activar el período de prueba inmediatamente sin requerir datos de pago
5. THE Sistema_Paquetes SHALL resaltar visualmente el paquete recomendado ("Completo") para orientar la decisión del usuario
6. WHERE un usuario selecciona comprar más de un evento, THE Sistema_Paquetes SHALL mostrar el precio unitario, el descuento por volumen aplicado y el monto total antes de proceder al pago

### Requerimiento 4: Procesamiento de pagos

**User Story:** Como usuario que seleccionó un paquete, quiero poder pagar de forma segura con distintos métodos, para activar mis eventos rápidamente.

#### Criterios de Aceptación

1. THE Sistema_Pagos SHALL integrarse con al menos una pasarela de pagos compatible con tarjetas de crédito/débito y transferencias bancarias en Latinoamérica
2. WHEN un usuario inicia el proceso de pago, THE Sistema_Pagos SHALL crear una sesión de pago segura en la Pasarela_Pagos con el monto total correspondiente a la cantidad de eventos y paquete seleccionado
3. WHEN la Pasarela_Pagos confirma un pago exitoso mediante webhook, THE Sistema_Pagos SHALL registrar los eventos comprados y asignarlos a la cuenta del usuario con estado "disponible"
4. IF la Pasarela_Pagos reporta un pago fallido, THEN THE Sistema_Pagos SHALL notificar al usuario del fallo y mantener la opción de reintentar el pago
5. THE Sistema_Pagos SHALL registrar cada transacción con: usuario, paquete, cantidad de eventos, monto total, método de pago, estado, fecha y referencia externa de la pasarela
6. THE Sistema_Pagos SHALL procesar cada compra como un pago único sin generar cargos recurrentes ni suscripciones automáticas
7. WHEN un usuario solicita una postergación de evento, THE Sistema_Pagos SHALL procesar el cobro adicional por postergación como una transacción independiente

### Requerimiento 5: Ciclo de vida de eventos comprados

**User Story:** Como usuario que compró un paquete de eventos, quiero que mis eventos se gestionen automáticamente según la fecha del evento, para no preocuparme por activaciones o desactivaciones manuales.

#### Criterios de Aceptación

1. WHEN un usuario configura la fecha de un evento comprado, THE Sistema_Eventos SHALL calcular la fecha de desactivación automática sumando 3 días calendario a la fecha del evento
2. WHEN la fecha actual supera la fecha de desactivación de un evento, THE Sistema_Eventos SHALL cambiar el estado del evento a "completado" y desactivar el acceso público a la invitación
3. WHILE un evento tiene estado "disponible" y no tiene fecha de evento asignada, THE Sistema_Eventos SHALL permitir al usuario configurar la fecha del evento sin restricción
4. WHILE un evento tiene estado "activo" y la fecha actual es anterior a la fecha de desactivación, THE Sistema_Eventos SHALL mantener la invitación accesible públicamente
5. WHEN un usuario solicita postergar la fecha de su evento, THE Sistema_Eventos SHALL verificar que faltan más de 7 días calendario para la fecha actual del evento antes de permitir la postergación
6. IF un usuario solicita postergar un evento con 7 días o menos para la fecha actual del evento, THEN THE Sistema_Eventos SHALL rechazar la solicitud e informar que la postergación no está disponible dentro de los 7 días previos al evento
7. IF un usuario solicita postergar un evento que ya fue postergado previamente, THEN THE Sistema_Eventos SHALL rechazar la solicitud e informar que cada evento solo puede postergarse una vez
8. WHEN una postergación es aprobada y el cobro adicional es confirmado, THE Sistema_Eventos SHALL actualizar la fecha del evento y recalcular la fecha de desactivación
9. THE Sistema_Eventos SHALL registrar cada postergación en el historial del evento con: fecha original, nueva fecha, fecha de solicitud y referencia de la transacción de pago
10. THE Sistema_Eventos SHALL incluir las políticas de postergación (tarifa, límite de una vez, restricción de 7 días) en los Términos y Condiciones aceptados por el usuario al momento de la compra

### Requerimiento 6: Gestión de compras en panel de administración

**User Story:** Como administrador de Vitely, quiero gestionar las compras y eventos de los usuarios, para tener control sobre los ingresos y poder resolver incidencias.

#### Criterios de Aceptación

1. THE Panel_Admin SHALL mostrar un listado de todas las compras con filtros por estado (disponible, activo, completado, trial), paquete y fecha
2. WHEN un administrador consulta una compra, THE Panel_Admin SHALL mostrar: usuario, paquete, cantidad de eventos, fecha de compra, monto pagado, estado de cada evento y historial de pagos
3. WHEN un administrador necesita resolver una incidencia, THE Panel_Admin SHALL permitir extender manualmente la fecha de desactivación de un evento con registro en audit log
4. THE Panel_Admin SHALL mostrar un dashboard de métricas con: ingresos del mes, eventos vendidos por paquete, tasa de conversión trial-a-compra y eventos activos totales
5. WHEN un administrador desactiva un paquete, THE Panel_Admin SHALL mostrar el número de eventos activos afectados y solicitar confirmación antes de proceder
6. THE Panel_Admin SHALL permitir exportar el listado de compras y transacciones en formato Excel

### Requerimiento 7: Sección de paquetes en landing page pública

**User Story:** Como visitante de la landing page de Vitely, quiero ver los paquetes disponibles con sus precios y características, para evaluar si el servicio se ajusta a mis necesidades antes de registrarme.

#### Criterios de Aceptación

1. THE Landing_Publica SHALL incluir una sección "Paquetes y Precios" visible en la navegación principal
2. THE Landing_Publica SHALL mostrar los paquetes activos en formato de cards comparativas con: nombre, precio por evento, lista de funcionalidades, límite de invitados y botón de acción
3. WHEN un visitante hace clic en "Comenzar" en un paquete, THE Landing_Publica SHALL redirigir al formulario de registro con el paquete preseleccionado como parámetro
4. THE Landing_Publica SHALL mostrar una tabla comparativa indicando qué incluye cada paquete para facilitar la decisión del visitante
5. THE Landing_Publica SHALL mostrar una sección de preguntas frecuentes (FAQ) debajo de los paquetes respondiendo dudas comunes sobre pagos, postergaciones, desactivación automática y funcionalidades
6. WHERE la Landing_Publica muestra precios por volumen, THE Landing_Publica SHALL indicar el descuento aplicable al comprar múltiples eventos en una sola transacción

### Requerimiento 8: Gestión de cuenta y eventos por el usuario

**User Story:** Como usuario que compró eventos, quiero gestionar mi cuenta y ver el estado de mis eventos desde el dashboard, para tener control sobre mi perfil y mis compras.

#### Criterios de Aceptación

1. THE Sistema_Paquetes SHALL proveer una sección "Mis Eventos" en el dashboard del usuario mostrando: eventos disponibles, eventos activos con fecha y días restantes, eventos completados y paquete asociado a cada evento
2. WHEN un usuario desea postergar un evento, THE Sistema_Paquetes SHALL mostrar la tarifa de postergación, la restricción de 7 días previos y el límite de una postergación por evento antes de confirmar
3. WHEN un usuario desea comprar más eventos, THE Sistema_Paquetes SHALL permitir acceder al catálogo de paquetes y realizar una nueva compra sin afectar los eventos existentes
4. THE Sistema_Paquetes SHALL mostrar el historial de compras del usuario con: fecha, paquete, cantidad de eventos, monto y estado de la transacción
5. THE Sistema_Paquetes SHALL permitir al usuario actualizar su información de perfil: nombre, correo electrónico y contraseña
6. WHEN un usuario cambia su correo electrónico, THE Sistema_Registro SHALL requerir verificación del nuevo correo antes de aplicar el cambio

### Requerimiento 9: Control de acceso por paquete

**User Story:** Como plataforma, quiero que los usuarios solo accedan a las funcionalidades incluidas en su paquete activo, para garantizar la monetización correcta del servicio.

#### Criterios de Aceptación

1. WHILE un usuario tiene un evento activo con paquete "Invitación Digital", THE Sistema_Permisos SHALL permitir acceso al builder de landing pages para ese evento y bloquear el acceso al editor de tarjetas físicas
2. WHILE un usuario tiene un evento activo con paquete "Tarjeta Física", THE Sistema_Permisos SHALL permitir acceso al editor de tarjetas y PDF para ese evento y bloquear el acceso al builder de landing pages
3. WHILE un usuario tiene un evento activo con paquete "Completo", THE Sistema_Permisos SHALL permitir acceso a todas las funcionalidades de la plataforma para ese evento
4. WHILE un usuario tiene el Trial activo, THE Sistema_Permisos SHALL permitir acceso completo limitado a 1 evento con máximo 30 invitados
5. IF un usuario sin eventos disponibles intenta crear un nuevo evento, THEN THE Sistema_Permisos SHALL mostrar un mensaje indicando que debe comprar un paquete con opción de ir al catálogo
6. IF un usuario intenta acceder a una funcionalidad no incluida en el paquete de su evento, THEN THE Sistema_Permisos SHALL mostrar un mensaje informativo con opción de comprar un paquete que incluya la funcionalidad
7. WHEN un evento cambia a estado "completado", THE Sistema_Permisos SHALL cambiar el acceso de ese evento a modo "solo lectura" permitiendo ver la información pero no editar
8. THE Sistema_Permisos SHALL evaluar los permisos del usuario en cada solicitud al backend verificando paquete del evento y estado del evento
