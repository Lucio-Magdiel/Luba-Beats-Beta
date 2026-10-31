# 🔐 Configuración de Culqi para Luba Beats Beta

## 📋 Información para el Registro en Culqi

### Datos del Comercio
- **Nombre del comercio:** Luba Beats Beta
- **RUC:** 10247817897
- **Razón Social:** BACA PUMA LUIS
- **Actividad Económica (CIIU):** 6201 - Actividades de programación informática
- **Actividad Comercial (MCC):** 5734 - Computer Software Stores

### URLs del Sistema

#### 🌐 URLs de Producción (Dominio Real)
```
Sitio Web: https://beats.luba-home.online
Webhook URL: https://beats.luba-home.online/api/webhooks/culqi
Success URL: https://beats.luba-home.online/payment/success
Cancel URL: https://beats.luba-home.online/payment/cancel
Error URL: https://beats.luba-home.online/payment/error
```

#### 🧪 URLs de Desarrollo (para registro inicial)
```
Sitio Web: http://localhost:3000
Webhook URL: https://tu-proyecto.ngrok.io/api/webhooks/culqi
Success URL: http://localhost:3000/payment/success
Cancel URL: http://localhost:3000/payment/cancel
Error URL: http://localhost:3000/payment/error
```

#### 🚀 URLs de Staging (Vercel)
```
Sitio Web: https://luba-beats-beta.vercel.app
Webhook URL: https://luba-beats-beta.vercel.app/api/webhooks/culqi
Success URL: https://luba-beats-beta.vercel.app/payment/success
Cancel URL: https://luba-beats-beta.vercel.app/payment/cancel
Error URL: https://luba-beats-beta.vercel.app/payment/error
```

---

## 🔑 API Keys de Culqi

Una vez aprobada tu cuenta, obtendrás:

### Ambiente de Pruebas (Testing)
```env
CULQI_PUBLIC_KEY_TEST=pk_test_xxxxxxxxxxxxxxxx
CULQI_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxx
```

### Ambiente de Producción
```env
CULQI_PUBLIC_KEY_LIVE=pk_live_xxxxxxxxxxxxxxxx
CULQI_SECRET_KEY_LIVE=sk_live_xxxxxxxxxxxxxxxx
```

---

## 📱 Métodos de Pago Habilitados

Con Culqi en Perú tendrás acceso a:

### ✅ Yape
- Pago mediante QR
- Confirmación instantánea
- Sin comisión adicional para el cliente

### ✅ Plin
- Pago mediante QR
- Multi-banco (BCP, Interbank, BBVA, Scotia, etc.)
- Confirmación instantánea

### ✅ Tarjetas de Crédito/Débito
- Visa, Mastercard, Amex, Diners
- Cuotas sin intereses (configurable)
- 3D Secure

### ✅ PagoEfectivo
- Pago en efectivo en agentes
- Código de pago válido por 24-48 horas
- Confirmación automática

### ✅ Banca Móvil/Internet
- BCP, Interbank, BBVA, Scotiabank
- Transferencias directas

---

## 💰 Comisiones de Culqi (Perú)

### Yape / Plin
- **Comisión:** 2.99% + S/ 0.30
- **Liquidación:** T+1 días hábiles

### Tarjetas de Crédito/Débito
- **Comisión Visa/Mastercard:** 3.59% + S/ 0.30
- **Comisión Amex:** 3.99% + S/ 0.30
- **Liquidación:** T+1 días hábiles

### PagoEfectivo
- **Comisión:** S/ 3.00 fijo
- **Liquidación:** T+1 días hábiles

---

## 🔧 Endpoints de API que Implementaremos

### 1. Crear Token de Tarjeta (Frontend → Culqi)
```javascript
// Frontend usa Culqi.js v3
POST https://api.culqi.com/v2/tokens
```

### 2. Crear Cargo (Backend)
```javascript
// src/app/api/payments/culqi/charge/route.ts
POST https://api.culqi.com/v2/charges
```

### 3. Crear Orden (Yape/Plin)
```javascript
// src/app/api/payments/culqi/order/route.ts
POST https://api.culqi.com/v2/orders
```

### 4. Webhook de Confirmación
```javascript
// src/app/api/webhooks/culqi/route.ts
POST https://lubabeats.com/api/webhooks/culqi
```

### 5. Verificar Estado de Pago
```javascript
// Backend
GET https://api.culqi.com/v2/charges/:id
GET https://api.culqi.com/v2/orders/:id
```

---

## 📝 Pasos para Completar el Registro

### Paso 1: Registro Inicial ✅ (estás aquí)
1. Ve a https://culqi.com/
2. Clic en "Crear cuenta gratis"
3. Llena el formulario con los datos arriba
4. **URL del sitio:** Usa `https://beats.luba-home.online` ✨ (tu dominio real)

### Paso 2: Verificación de Identidad
1. Subir foto de DNI (ambos lados)
2. Subir selfie sosteniendo DNI
3. Esperar aprobación (24-48 horas)

### Paso 3: Verificación Bancaria
1. Agregar cuenta bancaria para recibir liquidaciones
2. Verificar cuenta (depósito de validación)

### Paso 4: Activar Ambiente de Pruebas
1. Acceder al Dashboard de Culqi
2. Ir a **Desarrollo → API Keys**
3. Copiar las llaves de **Test**
4. Pegarlas en tu archivo `.env.local`

### Paso 5: Configurar Webhooks
1. En Dashboard → **Webhooks**
2. Agregar URL: `https://tu-proyecto.ngrok.io/api/webhooks/culqi`
3. Seleccionar eventos:
   - `charge.succeeded`
   - `charge.failed`
   - `order.succeeded`
   - `order.expired`
   - `refund.succeeded`

### Paso 6: Activar Producción
1. Completar información comercial
2. Aprobar términos y condiciones
3. Activar cuenta en vivo
4. Obtener llaves de **Live**

---

## 🧪 Tarjetas de Prueba (Ambiente Test)

### Tarjeta de Crédito Exitosa
```
Número: 4111 1111 1111 1111
CVV: 123
Fecha: 09/25
Email: test@culqi.com
```

### Tarjeta que Falla
```
Número: 4000 0000 0000 0002
CVV: 123
Fecha: 09/25
```

### Números de Celular para Yape/Plin (Test)
```
Número: 999999999
Monto: Cualquiera
```

---

## 🔐 Variables de Entorno

Agrega esto a tu `.env.local`:

```env
# ============================================
# CULQI PAYMENT GATEWAY (PERÚ)
# ============================================

# Ambiente (development | production)
CULQI_ENVIRONMENT=development

# API Keys de Testing
CULQI_PUBLIC_KEY_TEST=pk_test_xxxxxxxxxxxxxxxx
CULQI_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxx

# API Keys de Producción (vacío hasta activar)
CULQI_PUBLIC_KEY_LIVE=
CULQI_SECRET_KEY_LIVE=

# Webhooks
CULQI_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# URLs de Retorno
CULQI_SUCCESS_URL=http://localhost:3000/payment/success
CULQI_CANCEL_URL=http://localhost:3000/payment/cancel
CULQI_ERROR_URL=http://localhost:3000/payment/error

# Configuración
CULQI_CURRENCY=PEN
CULQI_COUNTRY=PE
```

---

## 📚 Recursos Útiles

- 📖 **Documentación:** https://docs.culqi.com/
- 🎮 **Playground:** https://developers.culqi.com/
- 💬 **Soporte:** soporte@culqi.com
- 📞 **Teléfono:** +51 1 642 9000
- 🏢 **Oficina:** Av. José Pardo 601, Miraflores, Lima

---

## 🚀 Próximos Pasos

Una vez tengas las API Keys:

1. ✅ Copiar las llaves a `.env.local`
2. ⏳ Implementar endpoint de creación de cargo
3. ⏳ Implementar endpoint de webhook
4. ⏳ Crear UI de checkout con Yape/Plin
5. ⏳ Probar con tarjetas de prueba
6. ⏳ Probar pagos con Yape/Plin en test
7. ⏳ Activar producción

---

## 💡 Tips Importantes

### ✅ Mejores Prácticas
- Nunca expongas `CULQI_SECRET_KEY` en el frontend
- Usa `CULQI_PUBLIC_KEY` solo en el frontend
- Valida webhooks con la firma HMAC
- Registra todas las transacciones en tu DB antes de confirmar
- Maneja estados de pago de forma idempotente

### ⚠️ Cuidado con:
- Pagos duplicados (usar idempotency key)
- Webhooks duplicados (verificar `providerTransactionId`)
- Expiración de órdenes Yape/Plin (15 minutos)
- Rate limits de API (100 req/min)

---

## 🎯 Estrategia de Implementación

### Fase 1: Setup (Esta semana)
- [x] Crear cuenta en Culqi
- [ ] Obtener API keys de test
- [ ] Configurar variables de entorno

### Fase 2: Desarrollo (Próxima semana)
- [ ] Implementar payment factory
- [ ] Crear endpoints de API
- [ ] Integrar Culqi.js en frontend
- [ ] Crear UI de checkout

### Fase 3: Testing (Semana 3)
- [ ] Probar tarjetas de prueba
- [ ] Probar Yape/Plin en sandbox
- [ ] Validar webhooks
- [ ] Probar refunds

### Fase 4: Producción (Semana 4)
- [ ] Activar cuenta live
- [ ] Migrar a llaves de producción
- [ ] Configurar webhooks en producción
- [ ] Monitoreo y logs

---

¿Necesitas ayuda con algún paso específico? 🚀
