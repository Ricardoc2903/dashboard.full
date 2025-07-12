// utils/confirmarEliminar.ts
import { Modal } from "antd";

/**
 * Muestra un modal de confirmación antes de ejecutar una acción destructiva.
 * @param entidad Nombre del elemento o entidad que se eliminará (ej. "Grupo", "Equipo")
 * @param nombre Nombre específico del ítem a eliminar (ej. "Grupo A", "Motor 1")
 * @param onConfirm Callback que se ejecuta si el usuario confirma
 */
export const confirmarEliminar = (
  entidad: string,
  nombre: string,
  onConfirm: () => void
) => {
  Modal.confirm({
    title: `¿Eliminar ${entidad} "${nombre}"?`,
    content: "Esta acción no se puede deshacer.",
    okText: "Eliminar",
    okType: "danger",
    cancelText: "Cancelar",
    onOk: onConfirm,
  });
};
