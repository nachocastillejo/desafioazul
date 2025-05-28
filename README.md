# Policía Nacional Oposiciones

## Desarrollo

```bash
npm run dev
```

## Producción

### ⚠️ Importante para Producción

**NUNCA uses el plan gratuito de Supabase en producción** porque:
- Los proyectos se pausan después de 1 semana de inactividad
- No hay backups automáticos
- Soporte limitado

### Configuración Recomendada para Producción

1. **Upgrade a Supabase Pro Plan** ($25/mes)
2. **Variables de entorno de producción:**
   ```
   VITE_SUPABASE_URL=tu-url-de-produccion
   VITE_SUPABASE_ANON_KEY=tu-key-de-produccion
   ```

3. **Monitoreo:**
   - Configura alertas en Supabase Dashboard
   - Implementa health checks
   - Usa servicios de monitoreo como UptimeRobot

### Deployment

1. **Netlify/Vercel:**
   - Configura las variables de entorno
   - Asegúrate de usar el plan Pro de Supabase

2. **Variables de entorno requeridas:**
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima
   ```

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/nachocastillejo/sb1-uk64qnav)