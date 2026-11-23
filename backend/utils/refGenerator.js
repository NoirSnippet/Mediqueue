/**
 * Generates a unique, human-readable appointment reference code
 * Format: MQ-YYYYMMDD-XXXX (e.g., MQ-20261122-8F2K)
 */
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let counter = Math.floor(Math.random() * 1000);

function generateAppointmentReference() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  counter = (counter + 1) % (chars.length * chars.length);
  const c1 = chars.charAt(Math.floor(Math.random() * chars.length));
  const c2 = chars.charAt(Math.floor(Math.random() * chars.length));
  const c3 = chars.charAt(Math.floor(counter / chars.length));
  const c4 = chars.charAt(counter % chars.length);

  return `MQ-${datePart}-${c1}${c2}${c3}${c4}`;
}

module.exports = {
  generateAppointmentReference,
};
