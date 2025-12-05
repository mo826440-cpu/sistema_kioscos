-- =====================================================
-- Esquema de la tabla SYNC_QUEUE (Cola de Sincronización)
-- =====================================================
--
-- Esta tabla almacena los cambios que deben sincronizarse
-- con el servidor central cuando haya conexión a internet
--
-- Campos:
--   id: Identificador único
--   entity_type: Tipo de entidad ('sale', 'product', etc.)
--   entity_id: ID de la entidad (ej: ID de la venta)
--   action: Acción realizada ('create', 'update', 'delete')
--   data: Datos completos en formato JSON
--   retries: Número de intentos de sincronización
--   status: Estado ('pending', 'processing', 'completed', 'failed')
--   error_message: Mensaje de error si falló
--   created_at: Cuándo se creó el registro
--   synced_at: Cuándo se sincronizó exitosamente
--
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    data TEXT NOT NULL,
    retries INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);

-- =====================================================
-- Notas de Uso
-- =====================================================
--
-- Ejemplo de uso:
--
-- Cuando se crea una venta offline, se agrega a la cola:
--
-- INSERT INTO sync_queue (entity_type, entity_id, action, data)
-- VALUES ('sale', 123, 'create', '{"sale_number":"V-00123","total":150.50,...}');
--
-- El worker de sincronización lee los registros con status='pending'
-- e intenta enviarlos al servidor. Si tiene éxito, cambia status='completed'
-- y registra la fecha en synced_at.
--
-- Si falla, incrementa retries y actualiza error_message.
-- Después de 3 intentos fallidos, cambia a status='failed' para revisión manual.
--
-- =====================================================

