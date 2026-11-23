-- MediQueue database schema (MySQL / MariaDB)

CREATE DATABASE IF NOT EXISTS mediqueue_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE mediqueue_db;

-- drop tables in reverse foreign key order if resetting
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS queues;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctor_schedules;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS clinics;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- users table for auth (patients, doctors, admin)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    account_status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- clinic info
CREATE TABLE clinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '20:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- doctor profiles linked to user account
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    clinic_id INT NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10, 2) DEFAULT 300.00,
    bio TEXT,
    room_number VARCHAR(30) DEFAULT 'Consultation Room 101',
    availability_status ENUM('available', 'on_leave', 'busy') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    INDEX idx_doctor_spec (specialization),
    INDEX idx_doctor_status (availability_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- patient profiles with medical info
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    date_of_birth DATE NULL,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    blood_group VARCHAR(20) DEFAULT 'Not Specified',
    emergency_contact VARCHAR(20) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    medical_history TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- weekly recurring doctor schedules
CREATE TABLE doctor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 20,
    max_patients_per_slot INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT uq_doctor_day UNIQUE (doctor_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- appointment bookings
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_reference VARCHAR(30) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    clinic_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason_for_visit VARCHAR(255) DEFAULT 'General Consultation',
    appointment_status ENUM('Booked', 'Confirmed', 'Waiting', 'In Consultation', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Booked',
    cancellation_reason VARCHAR(255) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appointment_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    INDEX idx_appt_date_doc (doctor_id, appointment_date),
    INDEX idx_appt_patient (patient_id),
    INDEX idx_appt_status (appointment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- live patient queue tokens
CREATE TABLE queues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE,
    doctor_id INT NOT NULL,
    queue_date DATE NOT NULL,
    queue_number INT NOT NULL,
    queue_status ENUM('Waiting', 'In Consultation', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Waiting',
    called_at TIMESTAMP NULL DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_queue_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_queue_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT uq_doctor_date_queue_num UNIQUE (doctor_id, queue_date, queue_number),
    INDEX idx_queue_lookup (doctor_id, queue_date, queue_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
