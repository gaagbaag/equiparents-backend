// src/roles/roleController.js

import asyncHandler from "express-async-handler";
import {
  getAllRoles as fetchAllRoles,
  getRoleById as fetchRoleById,
  createRole as addRole,
  updateRole as modifyRole,
  deleteRole as removeRole,
} from "./roleService.js"; // Asegúrate de que roleService.js tenga todas las funciones necesarias

/**
 * 📌 Obtener todos los roles
 */
export const getAllRoles = asyncHandler(async (req, res) => {
  try {
    const roles = await fetchAllRoles();
    res.status(200).json({ status: "success", data: roles });
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener roles." });
  }
});

/**
 * 📌 Obtener un rol por ID
 */
export const getRoleById = asyncHandler(async (req, res) => {
  try {
    const role = await fetchRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({
        status: "error",
        message: "Rol no encontrado",
      });
    }
    res.status(200).json({ status: "success", data: role });
  } catch (error) {
    console.error("❌ Error al obtener el rol:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener el rol",
    });
  }
});

/**
 * 📌 Crear un nuevo rol
 */
export const createRole = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validaciones
  if (!name || !description) {
    return res.status(400).json({
      status: "error",
      message: "Nombre y descripción son requeridos",
    });
  }

  try {
    const newRole = await addRole({ name, description });
    res.status(201).json({
      status: "success",
      message: "Rol creado exitosamente",
      data: newRole,
    });
  } catch (error) {
    console.error("❌ Error al crear rol:", error);
    res.status(500).json({
      status: "error",
      message: "Error al crear el rol",
    });
  }
});

/**
 * 📌 Actualizar un rol
 */
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // Validar que al menos un dato esté presente
  if (!name && !description) {
    return res.status(400).json({
      status: "error",
      message: "Debe proporcionar datos para actualizar",
    });
  }

  try {
    const updatedRole = await modifyRole(id, { name, description });
    res.status(200).json({
      status: "success",
      message: "Rol actualizado exitosamente",
      data: updatedRole,
    });
  } catch (error) {
    console.error("❌ Error al actualizar el rol:", error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el rol",
    });
  }
});

/**
 * 📌 Eliminar un rol
 */
export const deleteRole = asyncHandler(async (req, res) => {
  try {
    await removeRole(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Rol eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar rol:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar rol",
    });
  }
});
