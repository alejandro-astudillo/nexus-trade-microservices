# 📜 Contexto Técnico: NexusTrade - Order Engine (C#)

### 1. Propósito del Servicio

El **Order Engine** es el cerebro transaccional del sistema. Su responsabilidad es gestionar el ciclo de vida de las órdenes de compra/venta de activos (cripto/stocks), validar reglas de negocio financieras y coordinar con otros servicios la ejecución de las mismas.

### 2. Stack Tecnológico & Arquitectura

* **Lenguaje/Runtime:** .NET 8+ / C#
* **Arquitectura:** Clean Architecture (Separación por proyectos `.csproj`).
* **Patrón de Diseño:** **DDD (Domain-Driven Design)** para la lógica de negocio.
* **Persistencia:** PostgreSQL con Entity Framework Core (Enfoque *Code-First*).
* **Mensajería:** RabbitMQ (Consumidor de precios, Publicador de eventos de orden).

### 3. Estructura de Proyectos (Namespaces)

* `NexusTrade.Orders.Domain`: Corazón del sistema. Contiene Entidades, Value Objects e interfaces de Repositorios. **Sin dependencias externas.**
* `NexusTrade.Orders.Application`: Casos de uso (Commands/Queries), DTOs y lógica de orquestación.
* `NexusTrade.Orders.Infrastructure`: Implementación de base de datos, clientes de RabbitMQ y adaptadores externos.
* `NexusTrade.Orders.Api`: Punto de entrada HTTP, Controladores y configuración de Inyección de Dependencias.

### 4. Modelo de Dominio (Entidades y Reglas)

* **Aggregate Root:** `Order` (Entidad principal).
* **Atributos:** `Id`, `UserId`, `Symbol`, `OrderType` (Buy/Sell), `Status` (Pending, Executed, Cancelled), `Price`, `Quantity`.


* **Value Objects:** `Money` (Manejo de precisión decimal), `OrderStatus` (Estado de la orden).
* **Reglas Críticas:** * Una orden no puede crearse con precio o cantidad .
* Solo se puede ejecutar una orden si el precio actual del mercado coincide con el precio de la orden.
* El cambio de estado debe ser atómico y disparar un **Domain Event**.

### 5. Integraciones Externas (Contratos)

El servicio depende de información externa definida en la carpeta raíz `shared/contracts/`:

* **Entrada (Input):** Escucha eventos `PriceUpdatedEvent` (JSON) desde RabbitMQ (publicados por el servicio de Go).
* **Salida (Output):** Debe notificar al servicio de **Wallet (Java)** para congelar o descontar saldo mediante eventos o gRPC.

### 6. Flujo de Trabajo (Workflow)

1. **Recepción:** La API recibe un `PlaceOrderCommand`.
2. **Validación:** Se valida la regla de negocio en el Dominio.
3. **Persistencia:** La orden se guarda en Postgres como `Pending`.
4. **Matching:** Al recibir un precio desde RabbitMQ, el servicio busca órdenes `Pending` que coincidan y las marca como `Executed`.
5. **Notificación:** Se publica un evento `OrderExecutedEvent` para que otros servicios actúen.
