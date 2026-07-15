-- Seed: Planes iniciales para el sistema de comercialización
-- Ejecutar después de subscription-plans.sql

INSERT INTO plans (name, slug, description, price, features, max_guests, is_trial, trial_days, volume_discount, status, sort_order) VALUES 
('Trial', 'trial', 'Prueba gratuita de 7 días con todas las funcionalidades', 0.00, '["all"]', 30, 1, 7, NULL, 'active', 0),
('Invitación Digital', 'invitacion-digital', 'Landing page personalizable para tu evento con gestión de invitados y QR codes', 499.00, '["landing_builder", "guest_management", "qr_codes"]', NULL, 0, NULL, '[{"min_qty": 3, "discount_pct": 10}, {"min_qty": 5, "discount_pct": 15}]', 'active', 1),
('Tarjeta Física', 'tarjeta-fisica', 'Editor de tarjetas físicas con exportación a PDF de alta calidad', 399.00, '["card_editor", "pdf_export"]', NULL, 0, NULL, '[{"min_qty": 3, "discount_pct": 10}, {"min_qty": 5, "discount_pct": 15}]', 'active', 2),
('Completo', 'completo', 'Acceso total: landing page + tarjetas + todas las funcionalidades', 799.00, '["all"]', NULL, 0, NULL, '[{"min_qty": 3, "discount_pct": 10}, {"min_qty": 5, "discount_pct": 15}, {"min_qty": 10, "discount_pct": 20}]', 'active', 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);
