USE master;
GO
CREATE LOGIN cooked_app WITH PASSWORD = 'MOT_DE_PASSE';
GO

USE cooked;
GO
CREATE USER cooked_app FOR LOGIN cooked_app;
GO

ALTER ROLE db_datareader ADD MEMBER cooked_app;
ALTER ROLE db_datawriter ADD MEMBER cooked_app;
GO

GRANT EXECUTE TO cooked_app;
GO