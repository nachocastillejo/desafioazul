# Configuración de Stripe para Desafío Azul

## Pasos para completar la integración de Stripe

### 1. Configurar variables de entorno

Necesitas agregar las siguientes variables a tu archivo `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_secreto_del_webhook
STRIPE_PRICE_ID=price_tu_id_del_precio
```

### 2. Obtener las claves de Stripe

1. Ve a tu [Dashboard de Stripe](https://dashboard.stripe.com/)
2. En el panel de navegación, ve a **Developers > API keys**
3. Copia tu **Secret key** (empieza por `sk_test_`)
4. Pégala en `STRIPE_SECRET_KEY` en tu archivo `.env`

### 3. Crear un producto y precio

1. En tu Dashboard de Stripe, ve a **Products**
2. Haz clic en **Add product**
3. Configura tu producto:
   - **Name**: Suscripción Premium Desafío Azul
   - **Description**: Acceso completo a todas las funcionalidades premium
4. En la sección de precios:
   - **Pricing model**: Standard pricing
   - **Price**: €9.99
   - **Billing period**: Monthly
5. Guarda el producto y copia el **Price ID** (empieza por `price_`)
6. Pégalo en `STRIPE_PRICE_ID` en tu archivo `.env`

### 4. Configurar webhook

1. En tu Dashboard de Stripe, ve a **Developers > Webhooks**
2. Haz clic en **Add endpoint**
3. **Endpoint URL**: `https://tu-proyecto-supabase.supabase.co/functions/v1/stripe-webhooks-final`
4. **Description**: Webhook para Desafío Azul
5. En **Events to send**, selecciona estos eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Guarda el webhook y copia el **Signing secret** (empieza por `whsec_`)
7. Pégalo en `STRIPE_WEBHOOK_SECRET` en tu archivo `.env`

### 4a. Configurar el Portal de Cliente de Stripe

Para permitir que los usuarios gestionen su suscripción (cancelar, cambiar método de pago, etc.), necesitas configurar las URLs a las que Stripe puede redirigirlos de forma segura.

1.  En tu [Dashboard de Stripe](https://dashboard.stripe.com/), ve a **Configuración** (icono de engranaje en la esquina superior derecha).
2.  En la sección "Configuración del producto", haz clic en **Facturación**.
3.  Dentro de la página de Facturación, haz clic en la pestaña **Portal de clientes**.
4.  Busca la sección **"Enlaces de redireccionamiento"**.
5.  Haz clic en **"+ Agregar un enlace"**.
6.  Añade la URL de tu página de suscripción. Para el entorno de desarrollo, es:
    -   `http://localhost:5173/suscripcion`
7.  Guarda los cambios.
> **Nota:** Cuando despliegues tu aplicación a producción, deberás añadir también la URL de producción (ej: `https://tu-app.com/suscripcion`).

### 5. Aplicar migraciones de base de datos

```bash
supabase db push
```