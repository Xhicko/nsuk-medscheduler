// Creates a notification record in the database
async function createNotification(supabase, notification) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        student_id: notification.studentId,
        appointment_id: notification.appointmentId || null,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        category: notification.category || 'appointment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

//Formats date for display in notifications
function formatNotificationDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return `${date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })} at ${date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
}

// Extracts time range from PostgreSQL tsrange format
function extractTimeRange(timeRange) {
  let startISO = null;
  let endISO = null;
  
  if (typeof timeRange === 'string') {
    const parts = timeRange.replace(/^[\[(]/, '').replace(/[\])]/, '').split(',');
    if (parts.length === 2) {
      startISO = parts[0]?.replace(/\"/g, '').trim();
      endISO = parts[1]?.replace(/\"/g, '').trim();
    }
  } else if (timeRange && typeof timeRange === 'object' && timeRange.lower && timeRange.upper) {
    startISO = timeRange.lower;
    endISO = timeRange.upper;
  }
  
  return { startISO, endISO };
}

// Generates notification content based on appointment status change
function generateNotificationContent(status, previousStatus, timeRange, previousTimeRange) {
  const { startISO, endISO } = extractTimeRange(timeRange);
  const startDate = startISO ? formatNotificationDate(startISO) : '';
  const endDate = endISO ? formatNotificationDate(endISO) : '';
  
  switch (status) {
    case 'scheduled':
      // Check if this is a reschedule (had a previous time_range and status was scheduled)
      if (previousStatus === 'scheduled' && previousTimeRange) {
        const { startISO: prevStartISO } = extractTimeRange(previousTimeRange);
        const prevStartDate = prevStartISO ? formatNotificationDate(prevStartISO) : '';
        
        return {
          title: 'Appointment Rescheduled',
          message: `Your medical appointment originally scheduled for ${prevStartDate} has been rescheduled. Your new appointment is scheduled for ${startDate}. We apologize for any inconvenience this may cause. If this new time does not work for your schedule, please contact the medical administrator.`,
          type: 'warning',
          category: 'appointment'
        };
      } else {
        // New appointment scheduled
        return {
          title: 'Appointment Scheduled',
          message: `Your medical appointment has been successfully scheduled for ${startDate} in the school medical clinic. Please arrive 15 minutes early for check-in and bring your student ID. The appointment is scheduled for 15 minutes.`,
          type: 'success',
          category: 'appointment'
        };
      }
    
    case 'pending':
      // Appointment reverted to pending
      const { startISO: pendingStartISO } = extractTimeRange(previousTimeRange);
      const pendingStartDate = pendingStartISO ? formatNotificationDate(pendingStartISO) : 'your scheduled time';
      
      return {
        title: 'Appointment Pending',
        message: `Your medical appointment originally scheduled for ${pendingStartDate} has been updated to pending. We will notify you once a new appointment time has been confirmed.`,
        type: 'info',
        category: 'appointment'
      };
    
    case 'missed':
      return {
        title: 'Missed Appointment',
        message: `You missed your scheduled medical appointment on ${startDate}. To avoid future issues, please reschedule as soon as possible or cancel appointments you cannot attend.`,
        type: 'error',
        category: 'appointment'
      };
    
    case 'completed':
      return {
        title: 'Results Ready',
        message: `Your medical test results from your appointment on ${startDate} are now available for review. The results include blood work, urinalysis, and chest X-ray.`,
        type: 'success',
        category: 'results'
      };
    
    default:
      return {
        title: 'Appointment Updated',
        message: `Your appointment status has been updated to ${status}.`,
        type: 'info',
        category: 'appointment'
      };
  }
}

//Creates smart notification based on appointment status change
export async function createSmartNotification(supabase, {
  studentId,
  appointmentId,
  newStatus,
  previousStatus,
  newTimeRange,
  previousTimeRange
}) {
  try {
    const notificationContent = generateNotificationContent(
      newStatus,
      previousStatus,
      newTimeRange,
      previousTimeRange
    );

    const notification = await createNotification(supabase, {
      studentId,
      appointmentId,
      title: notificationContent.title,
      message: notificationContent.message,
      type: notificationContent.type,
      category: notificationContent.category
    });

    return notification;
  } catch (error) {
    console.error('Error creating smart notification:', error);
    return null;
  }
}

