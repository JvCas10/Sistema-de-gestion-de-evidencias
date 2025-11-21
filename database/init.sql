USE master;
GO

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'Prueba_Tec')
BEGIN
    CREATE DATABASE Prueba_Tec;
END
GO

USE Prueba_Tec;
GO

-- TABLAS

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        rol_id INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(255),
        CONSTRAINT CHK_Roles_Nombre CHECK (nombre IN ('Tecnico', 'Coordinador', 'Administrador'))
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuario')
BEGIN
    CREATE TABLE Usuario (
        usuario_id INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol_id INT NOT NULL,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_ultima_modificacion DATETIME DEFAULT GETDATE(),
        activo BIT DEFAULT 1,
        CONSTRAINT FK_Usuario_Rol FOREIGN KEY (rol_id) REFERENCES Roles(rol_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Expedientes')
BEGIN
    CREATE TABLE Expedientes (
        expediente_id INT IDENTITY(1,1) PRIMARY KEY,
        numero_expediente VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(500) NOT NULL,
        tecnico_registro INT NOT NULL,
        coordinador_asignado INT NULL,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_revision DATETIME NULL,
        fecha_ultima_modificacion DATETIME DEFAULT GETDATE(),
        justificacion_rechazo VARCHAR(500) NULL,
        estado VARCHAR(20) DEFAULT 'EN_REGISTRO',
        CONSTRAINT FK_Expedientes_Tecnico FOREIGN KEY (tecnico_registro) REFERENCES Usuario(usuario_id),
        CONSTRAINT FK_Expedientes_Coordinador FOREIGN KEY (coordinador_asignado) REFERENCES Usuario(usuario_id),
        CONSTRAINT CHK_Expedientes_Estado CHECK (estado IN ('EN_REGISTRO', 'EN_REVISION', 'APROBADO', 'RECHAZADO'))
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Indicios')
BEGIN
    CREATE TABLE Indicios (
        indicio_id INT IDENTITY(1,1) PRIMARY KEY,
        nombre_objeto VARCHAR(200) NOT NULL,
        descripcion VARCHAR(500) NOT NULL,
        color VARCHAR(50),
        tamano_cm FLOAT,
        peso_gramos FLOAT,
        ubicacion VARCHAR(200),
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_ultima_modificacion DATETIME DEFAULT GETDATE(),
        expediente_id INT NOT NULL,
        tecnico_registro INT NOT NULL,
        CONSTRAINT FK_Indicios_Expediente FOREIGN KEY (expediente_id) REFERENCES Expedientes(expediente_id) ON DELETE CASCADE,
        CONSTRAINT FK_Indicios_Tecnico FOREIGN KEY (tecnico_registro) REFERENCES Usuario(usuario_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Expedientes_Estado')
    CREATE INDEX IDX_Expedientes_Estado ON Expedientes(estado);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Expedientes_Tecnico')
    CREATE INDEX IDX_Expedientes_Tecnico ON Expedientes(tecnico_registro);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Expedientes_Fecha')
    CREATE INDEX IDX_Expedientes_Fecha ON Expedientes(fecha_creacion);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Indicios_Expediente')
    CREATE INDEX IDX_Indicios_Expediente ON Indicios(expediente_id);
GO

-- DATOS INICIALES

IF NOT EXISTS (SELECT * FROM Roles)
BEGIN
    INSERT INTO Roles (nombre, descripcion) VALUES
    ('Administrador', 'Acceso total al sistema'),
    ('Coordinador', 'Revisa y aprueba expedientes'),
    ('Tecnico', 'Registra expedientes e indicios');
END
GO

IF NOT EXISTS (SELECT * FROM Usuario)
BEGIN
    SET IDENTITY_INSERT Usuario ON;
    
    INSERT INTO Usuario (usuario_id, nombre, email, password_hash, rol_id, activo) VALUES
    (11, 'Admin Sistema', 'admin@dicri.gob.gt', '$2b$10$CiwG.YuErrt2WgP8Z55V4.mG.VSNavXchaFeCHX4E2H6wSxcDM0Fi', 1, 1),
    (12, 'Jose Castellanos', 'jcastellanos@dicri.gob.gt', '$2b$10$CiwG.YuErrt2WgP8Z55V4.mG.VSNavXchaFeCHX4E2H6wSxcDM0Fi', 2, 1),
    (13, 'Victor Perez', 'vperez@dicri.gob.gt', '$2b$10$CiwG.YuErrt2WgP8Z55V4.mG.VSNavXchaFeCHX4E2H6wSxcDM0Fi', 3, 1);
    
    SET IDENTITY_INSERT Usuario OFF;
END
GO

-- STORED PROCEDURES: AUTENTICACION

IF OBJECT_ID('sp_CrearUsuario', 'P') IS NOT NULL DROP PROCEDURE sp_CrearUsuario;
GO
CREATE PROCEDURE sp_CrearUsuario
    @nombre VARCHAR(100),
    @email VARCHAR(255),
    @password_hash VARCHAR(255),
    @rol_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF EXISTS(SELECT 1 FROM Usuario WHERE email = @email)
        BEGIN
            THROW 50001, 'El email ya esta registrado', 1;
        END
        INSERT INTO Usuario (nombre, email, password_hash, rol_id) VALUES (@nombre, @email, @password_hash, @rol_id);
        SELECT SCOPE_IDENTITY() AS usuario_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ObtenerUsuarios', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerUsuarios;
GO
CREATE PROCEDURE sp_ObtenerUsuarios
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT u.usuario_id, u.nombre, u.email, u.rol_id, r.nombre as rol_nombre, u.activo, u.fecha_creacion
        FROM Usuario u
        INNER JOIN Roles r ON u.rol_id = r.rol_id
        ORDER BY u.fecha_creacion DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- STORED PROCEDURES: EXPEDIENTES

IF OBJECT_ID('sp_CrearExpediente', 'P') IS NOT NULL DROP PROCEDURE sp_CrearExpediente;
GO
CREATE PROCEDURE sp_CrearExpediente
    @numero_expediente VARCHAR(50),
    @descripcion VARCHAR(500),
    @tecnico_registro INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF EXISTS(SELECT 1 FROM Expedientes WHERE numero_expediente = @numero_expediente)
        BEGIN
            THROW 50002, 'El numero de expediente ya existe', 1;
        END
        INSERT INTO Expedientes (numero_expediente, descripcion, tecnico_registro, estado)
        VALUES (@numero_expediente, @descripcion, @tecnico_registro, 'EN_REGISTRO');
        SELECT SCOPE_IDENTITY() AS expediente_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ObtenerExpedientes', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerExpedientes;
GO
CREATE PROCEDURE sp_ObtenerExpedientes
    @estado VARCHAR(20) = NULL,
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT e.expediente_id, e.numero_expediente, e.descripcion, e.estado, e.fecha_creacion, e.fecha_revision,
               t.nombre as tecnico_nombre, c.nombre as coordinador_nombre,
               (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.expediente_id) as total_indicios
        FROM Expedientes e
        INNER JOIN Usuario t ON e.tecnico_registro = t.usuario_id
        LEFT JOIN Usuario c ON e.coordinador_asignado = c.usuario_id
        WHERE (@estado IS NULL OR e.estado = @estado)
        AND (@fecha_inicio IS NULL OR e.fecha_creacion >= @fecha_inicio)
        AND (@fecha_fin IS NULL OR e.fecha_creacion <= @fecha_fin)
        ORDER BY e.fecha_creacion DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ObtenerExpedientePorId', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerExpedientePorId;
GO
CREATE PROCEDURE sp_ObtenerExpedientePorId
    @expediente_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT e.expediente_id, e.numero_expediente, e.descripcion, e.estado, e.fecha_creacion, e.fecha_revision,
               e.justificacion_rechazo, e.tecnico_registro, e.coordinador_asignado,
               t.nombre as tecnico_nombre, t.email as tecnico_email,
               c.nombre as coordinador_nombre, c.email as coordinador_email,
               (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.expediente_id) as total_indicios
        FROM Expedientes e
        INNER JOIN Usuario t ON e.tecnico_registro = t.usuario_id
        LEFT JOIN Usuario c ON e.coordinador_asignado = c.usuario_id
        WHERE e.expediente_id = @expediente_id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ActualizarExpediente', 'P') IS NOT NULL DROP PROCEDURE sp_ActualizarExpediente;
GO
CREATE PROCEDURE sp_ActualizarExpediente
    @expediente_id INT,
    @descripcion VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @estado VARCHAR(20);
        SELECT @estado = estado FROM Expedientes WHERE expediente_id = @expediente_id;
        IF @estado != 'EN_REGISTRO'
        BEGIN
            THROW 50003, 'Solo se pueden editar expedientes en registro', 1;
        END
        UPDATE Expedientes SET descripcion = @descripcion, fecha_ultima_modificacion = GETDATE()
        WHERE expediente_id = @expediente_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_EnviarExpedienteRevision', 'P') IS NOT NULL DROP PROCEDURE sp_EnviarExpedienteRevision;
GO
CREATE PROCEDURE sp_EnviarExpedienteRevision
    @expediente_id INT,
    @coordinador_asignado INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @estado VARCHAR(20), @total_indicios INT;
        SELECT @estado = estado FROM Expedientes WHERE expediente_id = @expediente_id;
        SELECT @total_indicios = COUNT(*) FROM Indicios WHERE expediente_id = @expediente_id;
        IF @estado != 'EN_REGISTRO'
        BEGIN
            THROW 50004, 'Solo se pueden enviar a revision expedientes en registro', 1;
        END
        IF @total_indicios = 0
        BEGIN
            THROW 50005, 'El expediente debe tener al menos un indicio', 1;
        END
        UPDATE Expedientes SET estado = 'EN_REVISION', coordinador_asignado = @coordinador_asignado, fecha_ultima_modificacion = GETDATE()
        WHERE expediente_id = @expediente_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_AprobarExpediente', 'P') IS NOT NULL DROP PROCEDURE sp_AprobarExpediente;
GO
CREATE PROCEDURE sp_AprobarExpediente
    @expediente_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @estado VARCHAR(20);
        SELECT @estado = estado FROM Expedientes WHERE expediente_id = @expediente_id;
        IF @estado != 'EN_REVISION'
        BEGIN
            THROW 50006, 'Solo se pueden aprobar expedientes en revision', 1;
        END
        UPDATE Expedientes SET estado = 'APROBADO', fecha_revision = GETDATE(), fecha_ultima_modificacion = GETDATE()
        WHERE expediente_id = @expediente_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_RechazarExpediente', 'P') IS NOT NULL DROP PROCEDURE sp_RechazarExpediente;
GO
CREATE PROCEDURE sp_RechazarExpediente
    @expediente_id INT,
    @justificacion_rechazo VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @estado VARCHAR(20);
        SELECT @estado = estado FROM Expedientes WHERE expediente_id = @expediente_id;
        IF @estado != 'EN_REVISION'
        BEGIN
            THROW 50007, 'Solo se pueden rechazar expedientes en revision', 1;
        END
        IF @justificacion_rechazo IS NULL OR LEN(TRIM(@justificacion_rechazo)) = 0
        BEGIN
            THROW 50008, 'La justificacion del rechazo es requerida', 1;
        END
        UPDATE Expedientes SET estado = 'RECHAZADO', justificacion_rechazo = @justificacion_rechazo,
               fecha_revision = GETDATE(), fecha_ultima_modificacion = GETDATE()
        WHERE expediente_id = @expediente_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- STORED PROCEDURES: INDICIOS

IF OBJECT_ID('sp_CrearIndicio', 'P') IS NOT NULL DROP PROCEDURE sp_CrearIndicio;
GO
CREATE PROCEDURE sp_CrearIndicio
    @nombre_objeto VARCHAR(200),
    @descripcion VARCHAR(500),
    @color VARCHAR(50),
    @tamano_cm FLOAT,
    @peso_gramos FLOAT,
    @ubicacion VARCHAR(200),
    @expediente_id INT,
    @tecnico_registro INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @estado_expediente VARCHAR(20);
        SELECT @estado_expediente = estado FROM Expedientes WHERE expediente_id = @expediente_id;
        IF @estado_expediente != 'EN_REGISTRO'
        BEGIN
            THROW 50009, 'Solo se pueden agregar indicios a expedientes en registro', 1;
        END
        INSERT INTO Indicios (nombre_objeto, descripcion, color, tamano_cm, peso_gramos, ubicacion, expediente_id, tecnico_registro)
        VALUES (@nombre_objeto, @descripcion, @color, @tamano_cm, @peso_gramos, @ubicacion, @expediente_id, @tecnico_registro);
        UPDATE Expedientes SET fecha_ultima_modificacion = GETDATE() WHERE expediente_id = @expediente_id;
        SELECT SCOPE_IDENTITY() AS indicio_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ObtenerIndiciosPorExpediente', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerIndiciosPorExpediente;
GO
CREATE PROCEDURE sp_ObtenerIndiciosPorExpediente
    @expediente_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT i.indicio_id, i.nombre_objeto, i.descripcion, i.color, i.tamano_cm, i.peso_gramos, i.ubicacion,
               i.fecha_creacion, i.tecnico_registro, u.nombre as tecnico_nombre
        FROM Indicios i
        INNER JOIN Usuario u ON i.tecnico_registro = u.usuario_id
        WHERE i.expediente_id = @expediente_id
        ORDER BY i.fecha_creacion DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ActualizarIndicio', 'P') IS NOT NULL DROP PROCEDURE sp_ActualizarIndicio;
GO
CREATE PROCEDURE sp_ActualizarIndicio
    @indicio_id INT,
    @nombre_objeto VARCHAR(200),
    @descripcion VARCHAR(500),
    @color VARCHAR(50),
    @tamano_cm FLOAT,
    @peso_gramos FLOAT,
    @ubicacion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @expediente_id INT, @estado_expediente VARCHAR(20);
        SELECT @expediente_id = expediente_id FROM Indicios WHERE indicio_id = @indicio_id;
        SELECT @estado_expediente = estado FROM Expedientes WHERE expediente_id = @expediente_id;
        IF @estado_expediente != 'EN_REGISTRO'
        BEGIN
            THROW 50010, 'Solo se pueden editar indicios de expedientes en registro', 1;
        END
        UPDATE Indicios SET nombre_objeto = @nombre_objeto, descripcion = @descripcion, color = @color,
               tamano_cm = @tamano_cm, peso_gramos = @peso_gramos, ubicacion = @ubicacion, fecha_ultima_modificacion = GETDATE()
        WHERE indicio_id = @indicio_id;
        UPDATE Expedientes SET fecha_ultima_modificacion = GETDATE() WHERE expediente_id = @expediente_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_EliminarIndicio', 'P') IS NOT NULL DROP PROCEDURE sp_EliminarIndicio;
GO
CREATE PROCEDURE sp_EliminarIndicio
    @indicio_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @expediente_id INT, @estado_expediente VARCHAR(20);
        SELECT @expediente_id = expediente_id FROM Indicios WHERE indicio_id = @indicio_id;
        SELECT @estado_expediente = estado FROM Expedientes WHERE expediente_id = @expediente_id;
        IF @estado_expediente != 'EN_REGISTRO'
        BEGIN
            THROW 50011, 'Solo se pueden eliminar indicios de expedientes en registro', 1;
        END
        DELETE FROM Indicios WHERE indicio_id = @indicio_id;
        UPDATE Expedientes SET fecha_ultima_modificacion = GETDATE() WHERE expediente_id = @expediente_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- STORED PROCEDURES: REPORTES

IF OBJECT_ID('sp_ObtenerReportePorFechas', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerReportePorFechas;
GO
CREATE PROCEDURE sp_ObtenerReportePorFechas
    @fecha_inicio DATETIME,
    @fecha_fin DATETIME,
    @estado VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT e.expediente_id, e.numero_expediente, e.descripcion, e.estado, e.fecha_creacion, e.fecha_revision,
               t.nombre as tecnico_nombre, c.nombre as coordinador_nombre,
               (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.expediente_id) as total_indicios,
               DATEDIFF(day, e.fecha_creacion, ISNULL(e.fecha_revision, GETDATE())) as dias_proceso
        FROM Expedientes e
        INNER JOIN Usuario t ON e.tecnico_registro = t.usuario_id
        LEFT JOIN Usuario c ON e.coordinador_asignado = c.usuario_id
        WHERE e.fecha_creacion >= @fecha_inicio AND e.fecha_creacion <= @fecha_fin
        AND (@estado IS NULL OR e.estado = @estado)
        ORDER BY e.fecha_creacion DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ObtenerEstadisticas', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerEstadisticas;
GO
CREATE PROCEDURE sp_ObtenerEstadisticas
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SET @fecha_inicio = ISNULL(@fecha_inicio, DATEADD(month, -1, GETDATE()));
        SET @fecha_fin = ISNULL(@fecha_fin, GETDATE());
        SELECT COUNT(*) as total_expedientes,
               SUM(CASE WHEN estado = 'EN_REGISTRO' THEN 1 ELSE 0 END) as en_registro,
               SUM(CASE WHEN estado = 'EN_REVISION' THEN 1 ELSE 0 END) as en_revision,
               SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
               SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
               (SELECT COUNT(*) FROM Indicios i INNER JOIN Expedientes e ON i.expediente_id = e.expediente_id
                WHERE e.fecha_creacion >= @fecha_inicio AND e.fecha_creacion <= @fecha_fin) as total_indicios,
               AVG(CASE WHEN estado IN ('APROBADO', 'RECHAZADO') THEN DATEDIFF(day, fecha_creacion, fecha_revision) ELSE NULL END) as promedio_dias_revision
        FROM Expedientes
        WHERE fecha_creacion >= @fecha_inicio AND fecha_creacion <= @fecha_fin;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ObtenerExpedientesPorTecnico', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerExpedientesPorTecnico;
GO
CREATE PROCEDURE sp_ObtenerExpedientesPorTecnico
    @tecnico_id INT,
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT e.expediente_id, e.numero_expediente, e.descripcion, e.estado, e.fecha_creacion,
               (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.expediente_id) as total_indicios
        FROM Expedientes e
        WHERE e.tecnico_registro = @tecnico_id
        AND (@fecha_inicio IS NULL OR e.fecha_creacion >= @fecha_inicio)
        AND (@fecha_fin IS NULL OR e.fecha_creacion <= @fecha_fin)
        ORDER BY e.fecha_creacion DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('sp_ObtenerExpedientesParaRevision', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerExpedientesParaRevision;
GO
CREATE PROCEDURE sp_ObtenerExpedientesParaRevision
    @coordinador_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT e.expediente_id, e.numero_expediente, e.descripcion, e.fecha_creacion, t.nombre as tecnico_nombre,
               (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.expediente_id) as total_indicios,
               DATEDIFF(day, e.fecha_creacion, GETDATE()) as dias_en_revision
        FROM Expedientes e
        INNER JOIN Usuario t ON e.tecnico_registro = t.usuario_id
        WHERE e.estado = 'EN_REVISION' AND e.coordinador_asignado = @coordinador_id
        ORDER BY e.fecha_creacion ASC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO