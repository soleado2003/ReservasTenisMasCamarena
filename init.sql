CREATE DATABASE IF NOT EXISTS reserva_tenis;
CREATE DATABASE IF NOT EXISTS presupuestos_db;
CREATE USER IF NOT EXISTS 'reservas_user'@'%' IDENTIFIED WITH mysql_native_password BY 'Reservas1234-';
CREATE USER IF NOT EXISTS 'usuario_presupuestos'@'%' IDENTIFIED WITH mysql_native_password BY 'Sertec12345&';
GRANT ALL PRIVILEGES ON reserva_tenis.* TO 'reservas_user'@'%';
GRANT ALL PRIVILEGES ON presupuestos_db.* TO 'usuario_presupuestos'@'%';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpass';
FLUSH PRIVILEGES;
