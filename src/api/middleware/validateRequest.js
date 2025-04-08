import { validationResult } from "express-validator";

/**
 * 📌 Middleware de validación de solicitudes
 * @param {Array} validations - Reglas de validación de `express-validator`
 * @returns {Function} Middleware de validación
 */
export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Ejecuta todas las validaciones antes de procesar la solicitud
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Obtener los errores de validación
    const errors = validationResult(req);

    // Si existen errores de validación
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Errores en la validación de los datos",
        errors: errors.array().map((err) => ({
          field: err.param, // Campo que falló
          message: err.msg, // Mensaje de error asociado
          value: err.value, // Valor que causó el error (útil para depuración)
        })),
      });
    }

    // Si no hay errores, pasa al siguiente middleware
    next();
  };
};
