# Gastos: el Sheet de Mission Control

Igual que Training: un Google Sheet tuyo guarda los datos y Mission Control los lee y escribe por un Apps Script con clave.

## Instalar (una vez, unos 3 minutos)

1. Crea un Google Sheet nuevo, por ejemplo «Gastos César».
2. **Extensiones → Apps Script**. Borra lo que haya y pega `Code.gs` entero. Guarda.
3. Arriba elige la función `instalar` y pulsa **Ejecutar**. Acepta los permisos. Crea las pestañas
   `Movimientos`, `Recurrentes` y `Categorías` (con categorías de partida) y escribe la clave en el registro.
4. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *yo*. Acceso: *cualquier usuario*.
   Copia la URL, que acaba en `/exec`.
5. En Mission Control → **Gastos**, pega `URL#clave` (la URL, `#` y la clave del paso 3) y pulsa Conectar.

La clave no está en el código: vive en las propiedades del script. Sin ella el script no responde nada.

## Pestañas

| Pestaña | Columnas |
| --- | --- |
| Movimientos | Fecha, Tipo (Gasto o Ingreso), Importe, Categoría, Concepto, Cuenta, Origen, ID |
| Recurrentes | ID, Tipo, Importe, Categoría, Concepto, Frecuencia (mensual, anual o semanal), Día, Mes, Desde, Hasta, Activo |
| Categorías | Tipo, Categoría, Presupuesto mensual (opcional) |

Puedes editar el Sheet a mano cuando quieras: la app lo relee al abrirse. Los cargos recurrentes se apuntan solos
en Movimientos el día que tocan, con el ID `r-<recurrente>-<fecha>`, así que nunca se duplican.
