// unit tests for core utilities and auth middleware
const assert = require('assert');
const jwt = require('jsonwebtoken');
const { generateTimeSlots, timeToMinutes, minutesToTime } = require('../utils/slotGenerator');
const { generateAppointmentReference } = require('../utils/refGenerator');
const {
  isValidEmail,
  isValidDateString,
  isValidTimeString,
  validateRegistration,
  validateLogin,
  validateAppointmentBooking,
  validateSchedule,
} = require('../middleware/validationMiddleware');
const { authenticateToken, authorizeRoles, JWT_SECRET } = require('../middleware/authMiddleware');

let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`  PASS: ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`  FAIL: ${testName}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`  PASS: ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`  FAIL: ${testName}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

console.log('\nRunning MediQueue unit tests...\n');

// reference code generator
console.log('Testing reference code generator...');
runTest('generates appointment reference code with MQ prefix', () => {
  const ref = generateAppointmentReference();
  assert.match(ref, /^MQ-\d{8}-[A-Z0-9]{4}$/);
});

runTest('reference codes do not immediately collide in a loop', () => {
  const set = new Set();
  for (let i = 0; i < 500; i++) {
    const ref = generateAppointmentReference();
    assert.strictEqual(set.has(ref), false, `Collision on: ${ref}`);
    set.add(ref);
  }
});

// time slot generator
console.log('\nTesting slot generator...');
runTest('generates correct slots for 9 to 11 am shift (30 min duration)', () => {
  const schedule = {
    start_time: '09:00:00',
    end_time: '11:00:00',
    slot_duration_minutes: 30,
  };
  const slots = generateTimeSlots(schedule, [], '2030-01-01');
  assert.strictEqual(slots.length, 4);
  assert.strictEqual(slots[0].time, '09:00:00');
  assert.strictEqual(slots[1].time, '09:30:00');
  assert.strictEqual(slots[2].time, '10:00:00');
  assert.strictEqual(slots[3].time, '10:30:00');
  assert.strictEqual(slots[0].isAvailable, true);
});

runTest('marks booked slot unavailable while others stay free', () => {
  const schedule = {
    start_time: '09:00:00',
    end_time: '10:00:00',
    slot_duration_minutes: 20,
  };
  const slots = generateTimeSlots(schedule, ['09:20:00'], '2030-01-01');
  assert.strictEqual(slots.length, 3);
  assert.strictEqual(slots[0].isAvailable, true);
  assert.strictEqual(slots[1].time, '09:20:00');
  assert.strictEqual(slots[1].isBooked, true);
  assert.strictEqual(slots[1].isAvailable, false);
  assert.strictEqual(slots[2].isAvailable, true);
});

runTest('disables past time slots if date is today', () => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const schedule = {
    start_time: '00:00:00',
    end_time: '00:30:00',
    slot_duration_minutes: 15,
  };
  const slots = generateTimeSlots(schedule, [], todayStr);
  assert.strictEqual(slots[0].isPast, true);
  assert.strictEqual(slots[0].isAvailable, false);
});

// validation middleware
console.log('\nTesting validation middleware...');
runTest('validates standard email formats', () => {
  assert.strictEqual(isValidEmail('patient@example.com'), true);
  assert.strictEqual(isValidEmail('invalid-email-address'), false);
  assert.strictEqual(isValidEmail('missing@domain'), false);
});

runTest('validates date string format YYYY-MM-DD', () => {
  assert.strictEqual(isValidDateString('2026-11-22'), true);
  assert.strictEqual(isValidDateString('22-11-2026'), false);
  assert.strictEqual(isValidDateString('invalid-date'), false);
});

runTest('catches registration errors when required fields are missing', () => {
  const mockReq = { body: { name: '', email: 'bademail', phone: '', password: '123' } };
  let errorStatus = null;
  let responseData = null;
  const mockRes = {
    status: (code) => {
      errorStatus = code;
      return { json: (d) => (responseData = d) };
    },
  };

  validateRegistration(mockReq, mockRes, () => {});
  assert.strictEqual(errorStatus, 400);
  assert.strictEqual(responseData.success, false);
  assert.ok(responseData.errors.length >= 3);
});

runTest('catches past dates in appointment booking validator', () => {
  const mockReq = {
    body: {
      doctor_id: 1,
      appointment_date: '2020-01-01',
      appointment_time: '10:00:00',
    },
  };
  let errorStatus = null;
  let responseData = null;
  const mockRes = {
    status: (code) => {
      errorStatus = code;
      return { json: (d) => (responseData = d) };
    },
  };

  validateAppointmentBooking(mockReq, mockRes, () => {});
  assert.strictEqual(errorStatus, 400);
  assert.ok(responseData.errors.some((e) => e.includes('past dates')));
});

runTest('rejects schedule when start time is not earlier than end time', () => {
  const mockReq = {
    body: {
      day_of_week: 'Monday',
      start_time: '14:00',
      end_time: '10:00',
      slot_duration_minutes: 20,
    },
  };
  let errorStatus = null;
  let responseData = null;
  const mockRes = {
    status: (code) => {
      errorStatus = code;
      return { json: (d) => (responseData = d) };
    },
  };

  validateSchedule(mockReq, mockRes, () => {});
  assert.strictEqual(errorStatus, 400);
  assert.ok(responseData.errors.some((e) => e.includes('strictly earlier than end time')));
});

// auth and roles
console.log('\nTesting authentication and role guard...');
runTest('encodes and decodes patient JWT token', () => {
  const token = jwt.sign(
    { id: 10, email: 'patient@example.com', role: 'patient', patient_id: 2 },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.id, 10);
  assert.strictEqual(decoded.role, 'patient');
});

runTest('returns 401 if auth header is missing', () => {
  const mockReq = { headers: {} };
  let statusCode = null;
  let resData = null;
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return { json: (d) => (resData = d) };
    },
  };

  authenticateToken(mockReq, mockRes, () => {});
  assert.strictEqual(statusCode, 401);
  assert.strictEqual(resData.success, false);
});

runTest('blocks patient from accessing doctor routes (403 forbidden)', () => {
  const mockReq = { user: { role: 'patient', name: 'John Doe' } };
  let statusCode = null;
  let resData = null;
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return { json: (d) => (resData = d) };
    },
  };

  const doctorGuard = authorizeRoles('doctor');
  doctorGuard(mockReq, mockRes, () => {});
  assert.strictEqual(statusCode, 403);
  assert.ok(resData.message.includes('Forbidden'));
});

runTest('allows permitted roles to continue', () => {
  const mockReq = { user: { role: 'doctor', name: 'Dr. Sarah' } };
  let nextCalled = false;
  const mockNext = () => {
    nextCalled = true;
  };
  const doctorGuard = authorizeRoles('doctor', 'admin');
  doctorGuard(mockReq, {}, mockNext);
  assert.strictEqual(nextCalled, true);
});

// queue numbering simulation
console.log('\nTesting queue logic simulation...');
runTest('increments queue numbers sequentially for each doctor', () => {
  const queueSim = [];
  function addQueueToken(doctorId, date) {
    const existing = queueSim.filter((q) => q.doctor_id === doctorId && q.date === date);
    const nextNum = existing.length + 1;
    const token = {
      id: queueSim.length + 1,
      doctor_id: doctorId,
      date,
      queue_number: nextNum,
      status: 'Waiting',
    };
    queueSim.push(token);
    return token;
  }

  const q1 = addQueueToken(1, '2026-11-23');
  const q2 = addQueueToken(1, '2026-11-23');
  const q3 = addQueueToken(1, '2026-11-23');
  const qDoc2 = addQueueToken(2, '2026-11-23');

  assert.strictEqual(q1.queue_number, 1);
  assert.strictEqual(q2.queue_number, 2);
  assert.strictEqual(q3.queue_number, 3);
  assert.strictEqual(qDoc2.queue_number, 1);
});

runTest('call next transitions current patient to Completed and next to In Consultation', () => {
  const queue = [
    { queue_number: 1, status: 'In Consultation', called_at: Date.now() },
    { queue_number: 2, status: 'Waiting', called_at: null },
    { queue_number: 3, status: 'Waiting', called_at: null },
  ];

  const current = queue.find((q) => q.status === 'In Consultation');
  if (current) current.status = 'Completed';

  const nextWaiting = queue.find((q) => q.status === 'Waiting');
  assert.ok(nextWaiting);
  assert.strictEqual(nextWaiting.queue_number, 2);

  nextWaiting.status = 'In Consultation';
  nextWaiting.called_at = Date.now();

  assert.strictEqual(queue[0].status, 'Completed');
  assert.strictEqual(queue[1].status, 'In Consultation');
  assert.strictEqual(queue[2].status, 'Waiting');
});

runTest('ignores cancelled appointments when counting waiting patients', () => {
  const queue = [
    { queue_number: 1, status: 'Completed' },
    { queue_number: 2, status: 'Cancelled' },
    { queue_number: 3, status: 'Waiting' },
    { queue_number: 4, status: 'Waiting' },
  ];

  const activeWaiting = queue.filter((q) => q.status === 'Waiting');
  assert.strictEqual(activeWaiting.length, 2);
  assert.strictEqual(activeWaiting[0].queue_number, 3);
});

// double-booking prevention simulation
console.log('\nTesting double-booking collision check...');
runTest('catches conflict when booking the same doctor slot twice', () => {
  const activeBookings = [
    { doctor_id: 1, appointment_date: '2026-11-25', appointment_time: '10:00:00', status: 'Confirmed' },
  ];

  function tryBookSlot(doctorId, date, time) {
    const conflict = activeBookings.find(
      (b) =>
        b.doctor_id === doctorId &&
        b.appointment_date === date &&
        b.appointment_time === time &&
        b.status !== 'Cancelled'
    );
    if (conflict) {
      throw new Error('This time slot was just booked by another patient. Please select another slot.');
    }
    const newBooking = { doctor_id: doctorId, appointment_date: date, appointment_time: time, status: 'Confirmed' };
    activeBookings.push(newBooking);
    return newBooking;
  }

  const b1 = tryBookSlot(1, '2026-11-25', '10:30:00');
  assert.strictEqual(b1.appointment_time, '10:30:00');

  assert.throws(
    () => {
      tryBookSlot(1, '2026-11-25', '10:00:00');
    },
    /just booked by another patient/
  );
});

console.log(`\nResults: ${testsPassed} passed, ${testsFailed} failed.\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
