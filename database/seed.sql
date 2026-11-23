-- seed data for initial setup (all demo account passwords: password123)

USE mediqueue_db;

-- 1. clinic
INSERT INTO clinics (id, clinic_name, address, contact_number, email, opening_time, closing_time)
VALUES 
(1, 'MediQueue Central Health Center', '104 Healthcare Boulevard, Medical District, City', '+91-9876543210', 'info@mediqueue.com', '08:00:00', '20:00:00')
ON DUPLICATE KEY UPDATE clinic_name=VALUES(clinic_name);

-- 2. users (admin, doctors, patients)
INSERT INTO users (id, name, email, phone, password_hash, role, account_status)
VALUES
-- admin
(1, 'System Administrator', 'admin@mediqueue.com', '+91-9000000001', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'admin', 'active'),

-- doctors
(2, 'Dr. Sarah Jenkins', 'dr.sarah@mediqueue.com', '+91-9000000002', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'doctor', 'active'),
(3, 'Dr. Rajesh Sharma', 'dr.rajesh@mediqueue.com', '+91-9000000003', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'doctor', 'active'),
(4, 'Dr. Priya Patel', 'dr.priya@mediqueue.com', '+91-9000000004', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'doctor', 'active'),
(5, 'Dr. Arjun Mehta', 'dr.arjun@mediqueue.com', '+91-9000000005', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'doctor', 'active'),
(6, 'Dr. Ananya Sen', 'dr.ananya@mediqueue.com', '+91-9000000006', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'doctor', 'active'),

-- patients
(7, 'John Doe', 'john.doe@example.com', '+91-9888800001', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'patient', 'active'),
(8, 'Jane Smith', 'jane.smith@example.com', '+91-9888800002', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'patient', 'active'),
(9, 'Robert Brown', 'robert.brown@example.com', '+91-9888800003', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'patient', 'active'),
(10, 'Emily Davis', 'emily.davis@example.com', '+91-9888800004', '$2a$10$aK3I5k62wDZsH2Pg/lZxZe/e0Asnl6RcJDsTg0UByuS32rgSIXJcu', 'patient', 'active'),
(11, 'Upendra', 'tashansingh57@gmail.com', '+918791640669', '$2a$10$dtb7AIyUkw2XcX8zAwNTaOm1NYrbFveQ/mxh68ulpVjFmEY4T.OCa', 'patient', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. doctor profiles
INSERT INTO doctors (id, user_id, clinic_id, specialization, qualification, experience_years, consultation_fee, bio, room_number, availability_status)
VALUES
(1, 2, 1, 'Cardiology', 'MBBS, MD (Cardiology)', 3, 100.00, 'Junior resident cardiologist assisting with general cardiac screening, blood pressure, and routine ECG checkups.', 'Room 101', 'available'),
(2, 3, 1, 'General Medicine', 'MBBS', 2, 50.00, 'Medical officer consulting for seasonal viral fever, cough, flu, and basic health consultations.', 'Room 102', 'available'),
(3, 4, 1, 'Pediatrics', 'MBBS, DCH', 3, 80.00, 'Pediatric resident providing child wellness checks, vaccination consultations, and common cold care.', 'Room 103', 'available'),
(4, 5, 1, 'Orthopedics', 'MBBS, MS (Orthopedics)', 4, 100.00, 'Orthopedic resident handling joint stiffness, posture checks, sprains, and general bone consultations.', 'Room 104', 'available'),
(5, 6, 1, 'Dermatology', 'MBBS, DVD', 2, 80.00, 'Junior dermatologist helping with acne care, skin rashes, basic allergies, and skincare advice.', 'Room 105', 'available')
ON DUPLICATE KEY UPDATE specialization=VALUES(specialization);

-- 4. patient profiles
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, emergency_contact, address, medical_history)
VALUES
(1, 7, '1990-05-15', 'male', 'O+', '+91-9888899991', '45 Park Avenue, City Center', 'Seasonal bronchial allergy.'),
(2, 8, '1994-08-22', 'female', 'B+', '+91-9888899992', '12 Green Wood Road', 'No known chronic illness.'),
(3, 9, '1985-11-10', 'male', 'A+', '+91-9888899993', '77 Lake View Colony', 'Mild hypertension under routine medication.'),
(4, 10, '1998-02-14', 'female', 'AB+', '+91-9888899994', '88 Hilltop Heights', 'No significant prior medical conditions.'),
(5, 11, '2005-01-23', 'male', 'O+', '08791640669', 'Bhawapur, GTB Nagar, Kareli, Prayagraj, Uttar Pradesh 211016', 'Healthy patient profile.')
ON DUPLICATE KEY UPDATE gender=VALUES(gender);

-- 5. recurring weekly schedule for doctors
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active)
VALUES
-- Dr. Sarah Jenkins (Cardiology)
(1, 'Monday', '09:00:00', '13:00:00', 30, 1, TRUE),
(1, 'Tuesday', '09:00:00', '13:00:00', 30, 1, TRUE),
(1, 'Wednesday', '09:00:00', '13:00:00', 30, 1, TRUE),
(1, 'Thursday', '09:00:00', '13:00:00', 30, 1, TRUE),
(1, 'Friday', '09:00:00', '13:00:00', 30, 1, TRUE),
(1, 'Saturday', '09:00:00', '13:00:00', 30, 1, TRUE),

-- Dr. Rajesh Sharma (General Medicine)
(2, 'Monday', '10:00:00', '14:00:00', 20, 1, TRUE),
(2, 'Tuesday', '10:00:00', '14:00:00', 20, 1, TRUE),
(2, 'Wednesday', '10:00:00', '14:00:00', 20, 1, TRUE),
(2, 'Thursday', '10:00:00', '14:00:00', 20, 1, TRUE),
(2, 'Friday', '10:00:00', '14:00:00', 20, 1, TRUE),
(2, 'Saturday', '10:00:00', '14:00:00', 20, 1, TRUE),

-- Dr. Priya Patel (Pediatrics)
(3, 'Monday', '14:00:00', '18:00:00', 20, 1, TRUE),
(3, 'Tuesday', '14:00:00', '18:00:00', 20, 1, TRUE),
(3, 'Wednesday', '14:00:00', '18:00:00', 20, 1, TRUE),
(3, 'Thursday', '14:00:00', '18:00:00', 20, 1, TRUE),
(3, 'Friday', '14:00:00', '18:00:00', 20, 1, TRUE),

-- Dr. Arjun Mehta (Orthopedics)
(4, 'Monday', '09:30:00', '13:30:00', 30, 1, TRUE),
(4, 'Wednesday', '09:30:00', '13:30:00', 30, 1, TRUE),
(4, 'Friday', '09:30:00', '13:30:00', 30, 1, TRUE),
(4, 'Saturday', '09:30:00', '13:30:00', 30, 1, TRUE),

-- Dr. Ananya Sen (Dermatology)
(5, 'Tuesday', '14:00:00', '18:00:00', 25, 1, TRUE),
(5, 'Thursday', '14:00:00', '18:00:00', 25, 1, TRUE),
(5, 'Saturday', '14:00:00', '18:00:00', 25, 1, TRUE)
ON DUPLICATE KEY UPDATE start_time=VALUES(start_time), end_time=VALUES(end_time);

-- 6. sample appointments
INSERT INTO appointments (id, appointment_reference, patient_id, doctor_id, clinic_id, appointment_date, appointment_time, reason_for_visit, appointment_status)
VALUES
(1, 'MQ-DEMO-001', 1, 1, 1, CURDATE(), '09:00:00', 'Chest heaviness and routine ECG check', 'In Consultation'),
(2, 'MQ-DEMO-002', 2, 1, 1, CURDATE(), '09:30:00', 'High BP follow-up consultation', 'Waiting'),
(3, 'MQ-DEMO-003', 3, 1, 1, CURDATE(), '10:00:00', 'Pre-operative cardiac clearance', 'Waiting'),
(4, 'MQ-DEMO-004', 1, 2, 1, CURDATE(), '10:00:00', 'Viral fever and joint aches', 'Waiting'),
(5, 'MQ-DEMO-005', 4, 3, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', 'Pediatric checkup and vaccine review', 'Confirmed')
ON DUPLICATE KEY UPDATE appointment_status=VALUES(appointment_status);

-- 7. initial queue tokens for today
INSERT INTO queues (id, appointment_id, doctor_id, queue_date, queue_number, queue_status, called_at)
VALUES
(1, 1, 1, CURDATE(), 1, 'In Consultation', CURRENT_TIMESTAMP),
(2, 2, 1, CURDATE(), 2, 'Waiting', NULL),
(3, 3, 1, CURDATE(), 3, 'Waiting', NULL),
(4, 4, 2, CURDATE(), 1, 'Waiting', NULL)
ON DUPLICATE KEY UPDATE queue_status=VALUES(queue_status);
