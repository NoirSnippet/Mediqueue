const { pool } = require('../config/db');

// helper for local YYYY-MM-DD date string
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// get current queue position for the logged-in patient
async function getPatientQueueStatus(req, res, next) {
  try {
    const patientId = req.user.patient_id;
    if (!patientId) {
      return res.status(403).json({
        success: false,
        message: 'Patient profile not found for this account.',
      });
    }

    const todayStr = req.query.date || getTodayStr();

    // find active queue row for today
    const [patientQueueRows] = await pool.query(
      `SELECT 
        q.id AS queue_id,
        q.queue_number,
        q.queue_status,
        q.queue_date,
        q.called_at,
        a.id AS appointment_id,
        a.appointment_reference,
        a.appointment_time,
        a.reason_for_visit,
        a.appointment_status,
        d.id AS doctor_id,
        u_doc.name AS doctor_name,
        d.specialization,
        d.room_number,
        c.clinic_name
       FROM queues q
       JOIN appointments a ON q.appointment_id = a.id
       JOIN doctors d ON q.doctor_id = d.id
       JOIN users u_doc ON d.user_id = u_doc.id
       JOIN clinics c ON a.clinic_id = c.id
       WHERE a.patient_id = ? 
         AND q.queue_date = ? 
         AND q.queue_status != 'Cancelled'
       ORDER BY a.appointment_time ASC
       LIMIT 1`,
      [patientId, todayStr]
    );

    if (patientQueueRows.length === 0) {
      return res.json({
        success: true,
        hasQueue: false,
        message: 'No active queue token found for today.',
        queue: null,
      });
    }

    const patientQueue = patientQueueRows[0];
    const doctorId = patientQueue.doctor_id;

    // check if a patient is currently inside the consultation room
    const [currentServingRows] = await pool.query(
      `SELECT queue_number, called_at
       FROM queues
       WHERE doctor_id = ? AND queue_date = ? AND queue_status = 'In Consultation'
       ORDER BY called_at DESC
       LIMIT 1`,
      [doctorId, todayStr]
    );

    const currentServingNumber = currentServingRows.length > 0 ? currentServingRows[0].queue_number : null;

    // calculate how many patients are ahead in line
    const [aheadCountRows] = await pool.query(
      `SELECT COUNT(*) AS ahead_count
       FROM queues
       WHERE doctor_id = ? 
         AND queue_date = ? 
         AND queue_status = 'Waiting'
         AND queue_number < ?`,
      [doctorId, todayStr, patientQueue.queue_number]
    );

    const aheadCount = aheadCountRows[0].ahead_count || 0;

    // total patients currently waiting
    const [totalWaitingRows] = await pool.query(
      `SELECT COUNT(*) AS total_waiting
       FROM queues
       WHERE doctor_id = ? AND queue_date = ? AND queue_status = 'Waiting'`,
      [doctorId, todayStr]
    );

    let statusMessage = 'You are in queue.';
    if (patientQueue.queue_status === 'In Consultation') {
      statusMessage = `You are currently in consultation with Dr. ${patientQueue.doctor_name} in ${patientQueue.room_number}.`;
    } else if (patientQueue.queue_status === 'Completed') {
      statusMessage = 'Your consultation has been completed for today.';
    } else if (patientQueue.queue_status === 'Waiting') {
      if (aheadCount === 0) {
        statusMessage = `You are NEXT in line! Please be ready near ${patientQueue.room_number}.`;
      } else {
        statusMessage = `There are ${aheadCount} patient${aheadCount > 1 ? 's' : ''} ahead of you in line.`;
      }
    }

    return res.json({
      success: true,
      hasQueue: true,
      queue: {
        ...patientQueue,
        currentServingNumber,
        aheadCount,
        totalWaiting: totalWaitingRows[0].total_waiting || 0,
        statusMessage,
      },
    });
  } catch (error) {
    next(error);
  }
}

// fetch live queue board for the doctor dashboard
async function getDoctorLiveQueue(req, res, next) {
  try {
    let doctorId = req.user.role === 'doctor' ? req.user.doctor_id : req.query.doctor_id;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required to fetch the queue.',
      });
    }

    const queueDate = req.query.date || getTodayStr();

    // get all queue tokens for today
    const [queueItems] = await pool.query(
      `SELECT 
        q.id AS queue_id,
        q.queue_number,
        q.queue_status,
        q.called_at,
        q.completed_at,
        a.id AS appointment_id,
        a.appointment_reference,
        a.appointment_time,
        a.reason_for_visit,
        a.appointment_status,
        a.notes,
        p.id AS patient_id,
        u.name AS patient_name,
        u.phone AS patient_phone,
        p.gender AS patient_gender,
        p.blood_group,
        p.date_of_birth
       FROM queues q
       JOIN appointments a ON q.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE q.doctor_id = ? AND q.queue_date = ?
       ORDER BY q.queue_number ASC`,
      [doctorId, queueDate]
    );

    const currentServing = queueItems.find((q) => q.queue_status === 'In Consultation') || null;
    const nextWaiting = queueItems.find((q) => q.queue_status === 'Waiting') || null;

    const totalCount = queueItems.length;
    const waitingCount = queueItems.filter((q) => q.queue_status === 'Waiting').length;
    const completedCount = queueItems.filter((q) => q.queue_status === 'Completed').length;
    const cancelledCount = queueItems.filter((q) => q.queue_status === 'Cancelled').length;

    return res.json({
      success: true,
      date: queueDate,
      doctorId: Number(doctorId),
      summary: {
        total: totalCount,
        waiting: waitingCount,
        inConsultation: currentServing ? 1 : 0,
        completed: completedCount,
        cancelled: cancelledCount,
      },
      currentServing,
      nextWaiting,
      queueList: queueItems,
    });
  } catch (error) {
    next(error);
  }
}

// doctor calls the next waiting patient into their room
async function callNextPatient(req, res, next) {
  const connection = await pool.getConnection();
  try {
    let doctorId = req.user.role === 'doctor' ? req.user.doctor_id : req.body.doctor_id;
    const queueDate = req.body.date || getTodayStr();

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required.',
      });
    }

    await connection.beginTransaction();

    // if someone is already inside, mark their consultation completed
    const [currentConsultation] = await connection.query(
      `SELECT id, appointment_id FROM queues 
       WHERE doctor_id = ? AND queue_date = ? AND queue_status = 'In Consultation'
       FOR UPDATE`,
      [doctorId, queueDate]
    );

    if (currentConsultation.length > 0) {
      const activeQueue = currentConsultation[0];
      await connection.query(
        `UPDATE queues SET queue_status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [activeQueue.id]
      );
      await connection.query(
        `UPDATE appointments SET appointment_status = 'Completed' WHERE id = ?`,
        [activeQueue.appointment_id]
      );
    }

    // grab the next waiting patient in line
    const [nextCandidates] = await connection.query(
      `SELECT q.id, q.appointment_id, q.queue_number, u.name AS patient_name
       FROM queues q
       JOIN appointments a ON q.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE q.doctor_id = ? AND q.queue_date = ? AND q.queue_status = 'Waiting'
       ORDER BY q.queue_number ASC
       LIMIT 1
       FOR UPDATE`,
      [doctorId, queueDate]
    );

    if (nextCandidates.length === 0) {
      await connection.commit();
      return res.json({
        success: true,
        message: 'No more waiting patients in queue for today.',
        calledPatient: null,
      });
    }

    const nextPatient = nextCandidates[0];

    // mark the patient as In Consultation
    await connection.query(
      `UPDATE queues SET queue_status = 'In Consultation', called_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [nextPatient.id]
    );
    await connection.query(
      `UPDATE appointments SET appointment_status = 'In Consultation' WHERE id = ?`,
      [nextPatient.appointment_id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: `Now calling Queue #${nextPatient.queue_number}: ${nextPatient.patient_name}`,
      calledPatient: nextPatient,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// manual queue status update if receptionist or doctor changes it
async function updateQueueStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const queueId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['Waiting', 'In Consultation', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid queue status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    await connection.beginTransaction();

    const [queues] = await connection.query('SELECT appointment_id, doctor_id FROM queues WHERE id = ? FOR UPDATE', [queueId]);
    if (queues.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Queue token not found.',
      });
    }

    const queue = queues[0];

    if (req.user.role === 'doctor' && req.user.doctor_id !== queue.doctor_id) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only update queues belonging to your schedule.',
      });
    }

    let timestampClause = '';
    if (status === 'In Consultation') timestampClause = ', called_at = CURRENT_TIMESTAMP';
    if (status === 'Completed') timestampClause = ', completed_at = CURRENT_TIMESTAMP';

    await connection.query(`UPDATE queues SET queue_status = ? ${timestampClause} WHERE id = ?`, [status, queueId]);

    // sync the matching appointment row
    await connection.query(`UPDATE appointments SET appointment_status = ? WHERE id = ?`, [status, queue.appointment_id]);

    await connection.commit();

    return res.json({
      success: true,
      message: `Queue status updated to "${status}".`,
      queueId,
      status,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getPatientQueueStatus,
  getDoctorLiveQueue,
  callNextPatient,
  updateQueueStatus,
};
