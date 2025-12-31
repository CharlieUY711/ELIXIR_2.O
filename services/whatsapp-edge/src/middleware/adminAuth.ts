/**
 * Middleware de autenticación para endpoints administrativos
 * Fail-closed: rechaza por defecto si no hay token válido
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que valida token de autenticación para endpoints admin
 * Token se obtiene de variable de entorno ADMIN_TOKEN o header Authorization
 * Comportamiento fail-closed: rechaza si no hay token válido
 */
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Obtener token de variable de entorno (prioridad) o header Authorization
  const expectedToken = process.env.ADMIN_TOKEN;
  const authHeader = req.headers.authorization;

  // Fail-closed: si no hay token configurado, rechazar
  if (!expectedToken || expectedToken.trim() === '') {
    res.status(403).json({ 
      message: 'Acceso denegado' 
    });
    return;
  }

  // Extraer token del header (formato: "Bearer <token>" o solo "<token>")
  let providedToken: string | undefined;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      providedToken = authHeader.substring(7);
    } else {
      providedToken = authHeader;
    }
  }

  // Fail-closed: si no hay token en request, rechazar
  if (!providedToken) {
    res.status(401).json({ 
      message: 'Autenticación requerida' 
    });
    return;
  }

  // Validar token (comparación constante en tiempo)
  if (providedToken !== expectedToken) {
    res.status(403).json({ 
      message: 'Acceso denegado' 
    });
    return;
  }

  // Token válido, continuar
  next();
}

