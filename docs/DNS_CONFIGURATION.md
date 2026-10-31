# 🌐 Configuración DNS para Luba Beats

## 📍 Dominio: luba-home.online (GoDaddy)

---

## 🎯 Objetivo

Configurar el subdominio `beats.luba-home.online` para apuntar a la aplicación Next.js desplegada en Vercel.

---

## 🔧 Pasos en GoDaddy

### 1. Acceder a DNS Management

1. Ve a https://dcc.godaddy.com/
2. Inicia sesión con tu cuenta
3. Busca **luba-home.online**
4. Click en **DNS** o **Manage DNS**

---

### 2. Configurar Dominio Principal (luba-home.online)

Si quieres usar el dominio principal para el portal:

```dns
Tipo    Nombre    Valor                           TTL
────────────────────────────────────────────────────────
A       @         76.76.21.21                     600
A       www       76.76.21.21                     600
CNAME   _vercel   cname.vercel-dns.com            600
```

---

### 3. Configurar Subdominio para Beats

**Opción A: CNAME a Vercel (RECOMENDADO)**

```dns
Tipo    Nombre    Valor                           TTL
────────────────────────────────────────────────────────
CNAME   beats     cname.vercel-dns.com            600
```

**Opción B: A Record (Alternativa)**

```dns
Tipo    Nombre    Valor                           TTL
────────────────────────────────────────────────────────
A       beats     76.76.21.21                     600
```

---

### 4. Resultado Final

Una vez configurado, tendrás:

```
✅ https://beats.luba-home.online → Luba Beats (Vercel)
✅ https://luba-home.online → Portal principal (futuro)
✅ https://www.luba-home.online → Portal principal
```

---

## 🚀 Configuración en Vercel

### 1. Acceder a tu Proyecto

1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `luba-beats-beta`
3. Ve a **Settings** → **Domains**

---

### 2. Agregar Dominio Personalizado

```bash
# En Vercel > Settings > Domains
# Agregar:

beats.luba-home.online
```

Vercel te mostrará:
- ✅ **Configured** - Si el DNS ya está apuntando correctamente
- ⚠️ **Invalid Configuration** - Si falta configurar en GoDaddy

---

### 3. Verificación

Vercel verificará automáticamente el dominio. Puede tardar:
- **5-15 minutos** normalmente
- **Hasta 48 horas** en casos raros (propagación DNS)

---

## 🔐 SSL/HTTPS Automático

Vercel genera automáticamente certificados SSL gratuitos con Let's Encrypt.

Una vez configurado, tendrás:
- ✅ HTTPS habilitado
- ✅ Redirect automático de HTTP → HTTPS
- ✅ Certificado renovado automáticamente

---

## ✅ Checklist de Configuración

### En GoDaddy:
- [ ] Iniciar sesión en GoDaddy
- [ ] Acceder a DNS Management de luba-home.online
- [ ] Agregar CNAME `beats` apuntando a `cname.vercel-dns.com`
- [ ] Guardar cambios
- [ ] Esperar propagación (5-15 min)

### En Vercel:
- [ ] Iniciar sesión en Vercel
- [ ] Ir al proyecto luba-beats-beta
- [ ] Settings → Domains
- [ ] Agregar `beats.luba-home.online`
- [ ] Esperar verificación automática
- [ ] Confirmar SSL habilitado

### En Culqi:
- [ ] Actualizar URL del sitio a `https://beats.luba-home.online`
- [ ] Actualizar Webhook URL
- [ ] Actualizar Success/Cancel/Error URLs

---

## 🧪 Verificar DNS

### Desde PowerShell/CMD:

```powershell
# Verificar CNAME
nslookup beats.luba-home.online

# Verificar propagación
ping beats.luba-home.online

# Verificar SSL
curl -I https://beats.luba-home.online
```

### Online:
- https://dnschecker.org/
- https://www.whatsmydns.net/

---

## 🎨 Subdominios Futuros

Para agregar más plataformas del ecosistema LUBA:

```dns
Tipo    Nombre       Valor                       Uso
─────────────────────────────────────────────────────────────
CNAME   beats        cname.vercel-dns.com       Marketplace
CNAME   hotel        cname.vercel-dns.com       Hotel
CNAME   restaurant   cname.vercel-dns.com       Restaurant
CNAME   api          cname.vercel-dns.com       API Gateway
CNAME   admin        cname.vercel-dns.com       Admin Panel
CNAME   cdn          cdn-provider.com           CDN
```

---

## 📧 Emails Profesionales

### Configurar Email con Google Workspace

1. Compra Google Workspace ($6/mes)
2. Verifica dominio en Google
3. Configura MX records en GoDaddy:

```dns
Tipo    Nombre    Valor                           Prioridad
──────────────────────────────────────────────────────────────
MX      @         aspmx.l.google.com              1
MX      @         alt1.aspmx.l.google.com         5
MX      @         alt2.aspmx.l.google.com         5
MX      @         alt3.aspmx.l.google.com         10
MX      @         alt4.aspmx.l.google.com         10
```

Tendrás emails como:
- info@luba-home.online
- support@luba-home.online
- beats@luba-home.online
- hotel@luba-home.online

---

## ⚠️ Problemas Comunes

### 1. "Domain not found" en Vercel
**Solución:** Espera 10-15 minutos para propagación DNS

### 2. SSL no se activa
**Solución:** Verifica que el DNS apunte correctamente con `nslookup`

### 3. "Invalid Configuration"
**Solución:** 
- Revisa que el CNAME sea exactamente `cname.vercel-dns.com`
- No agregues `https://` ni `/` al final

### 4. Cambios DNS no se reflejan
**Solución:** 
- Limpia caché DNS: `ipconfig /flushdns` (Windows)
- Usa navegación privada
- Espera hasta 48h en casos extremos

---

## 🎯 URLs Finales del Proyecto

### Producción
```
Landing: https://luba-home.online
Beats:   https://beats.luba-home.online
API:     https://beats.luba-home.online/api
Admin:   https://beats.luba-home.online/admin
```

### Desarrollo
```
Local:   http://localhost:3000
Preview: https://luba-beats-beta-git-main.vercel.app
```

---

## 📚 Referencias

- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-680)
- [DNS Propagation Checker](https://dnschecker.org/)

---

¿Necesitas ayuda configurando el DNS? ¡Avísame! 🚀
