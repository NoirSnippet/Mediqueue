import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Database,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          {/* Column 1: Brand & Academic Overview */}
          <div className="footer-brand-col">
            <Link to="/" className="brand-logo" style={{ marginBottom: '14px' }}>
              <div className="brand-icon">
                <Activity size={18} />
              </div>
              <span className="brand-name">MediQueue</span>
              <span className="brand-badge">Clinic</span>
            </Link>

            <p className="footer-text">
              Smart Doctor Appointment & Queue System designed to streamline outpatient scheduling,
              eliminate crowded waiting rooms, and give patients live queue transparency.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/doctors">Find Doctors</Link>
              </li>
              <li>
                <Link to="/bookings">Current Bookings</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/about">About & System</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div className="footer-col">
            <h4 className="footer-title">Portals</h4>
            <ul className="footer-links">
              <li>
                <Link to="/login">Patient Sign In</Link>
              </li>
              <li>
                <Link to="/register">Patient Registration</Link>
              </li>
              <li>
                <Link to="/login">Doctor Cockpit</Link>
              </li>
              <li>
                <Link to="/login">Admin Console</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk & Timings */}
          <div className="footer-col">
            <h4 className="footer-title">Clinic Desk</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <Clock size={15} className="footer-contact-icon" />
                <span>Mon – Sat: 8:00 AM – 8:00 PM</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={15} className="footer-contact-icon" />
                <span>+91 98765 43210</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={15} className="footer-contact-icon" />
                <span>info@mediqueue.com</span>
              </div>
              <div className="footer-contact-item">
                <MapPin size={15} className="footer-contact-icon" />
                <span>Metro Health Complex, Wing B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Project Badge */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p className="footer-copy">
              &copy; {currentYear} <strong>MediQueue</strong> — Smart Doctor Appointment & Queue System.
            </p>
            <div className="footer-academic-badge">
              <span>BCA Final-Year Capstone Project</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
