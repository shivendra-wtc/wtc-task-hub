const SHEET_ID = "1M1ig40xwPgB0rDMcH17Q63dQ7a4yaepIHkuVZwViVGM";

// ============================================================
// PUSH NOTIFICATIONS — real fix for unreliable calling/alerts. The old system relied on
// every browser tab polling the backend every second; phones/browsers freeze that polling
// the moment a tab is backgrounded or the screen locks, which is why calls "sometimes"
// rang and sometimes didn't. This sends a real push straight to the device instead, which
// wakes it even in the background. Apps Script can't sign/encrypt Web Push messages
// itself, so it hands the actual sending off to a tiny relay endpoint on Vercel
// (api/send-push.js) that does the signing with the `web-push` library.
// ============================================================
const PUSH_RELAY_URL = "https://wtc-task-hub.vercel.app/api/send-push";

// TEAM_EMAILS stays as a fallback map for the daily reminder emailer.
// The dashboard's team roster now lives in the "TeamConfig" sheet (see getTeam/addTeamMember/etc below).
const TEAM_EMAILS = {
  "Praveen Chilhate": "praveen@writetrackcreations.com",
  "Shivendra Singh": "socialmedia@writetrackcreations.com",
  "Deeksha": "teamakshatgupta@gmail.com",
  "Nidhi": "Connect@poorvajworld.com",
  "Muskan": "connect@devastram.in",
  "Sanjeevani": "connect@writetrackcreations.com",
  "Pari": "hrwtcpl@gmail.com",
  "Charu": "thefacttreeofficial@gmail.com",
  "Naman": "officialcontenteditor1@gmail.com",
  "Jagdish": "teamakshatgupta@gmail.com"
};

function getIndiaDate() {
  return Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
}

function getIndiaTimeISO() {
  return new Date().toISOString();
}

// ---- small date helpers used by routine-reminder + monthly attendance logic ----
function daysInMonth_(year, month) { return new Date(year, month + 1, 0).getDate(); }
function clampDay_(year, month, day) { return Math.min(day, daysInMonth_(year, month)); }
function addDays_(date, n) { const d = new Date(date.getTime()); d.setDate(d.getDate() + n); return d; }
function isSameDate_(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function getMonday_(date) {
  const d = new Date(date.getTime());
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function dateKey_(date) { return Utilities.formatDate(date, "Asia/Kolkata", "yyyy-MM-dd"); }

// FIX — any error inside a GET handler used to come back as an Apps Script HTML error
// page, which the app could not read as data (so e.g. the calendar silently showed
// empty). Now every failure comes back as proper JSON the app can detect and retry.
function doGet(e) {
  try {
    return doGetRouter_(e);
  } catch (error) {
    return jsonResponse({status: "error", message: error.toString()});
  }
}

function doGetRouter_(e) {
  const action = e.parameter.action;
  if (action === "getTasks") return getTasks();
  if (action === "getAttendance") return getAttendance();
  if (action === "getMonthlyAttendance") return getMonthlyAttendance(e.parameter.userId, e.parameter.year, e.parameter.month);
  if (action === "getInbox") return getInbox(e.parameter.userName);
  if (action === "getArchive") return getArchive();
  if (action === "getChats") return getChats(e.parameter.userName);
  if (action === "getTeam") return getTeam();
  if (action === "getIncomingCalls") return getIncomingCalls(e.parameter.userName);
  if (action === "getCallStatus") return getCallStatus(e.parameter.callId);
  if (action === "startCall") return startCall(e.parameter.from, String(e.parameter.to || '').split(','), e.parameter.callType, e.parameter.callId);
  if (action === "getNotices") return getNotices();
  if (action === "getHolidays") return getHolidays();
  if (action === "getContentCalendar") return getContentCalendar();
  if (action === "getMeetings") return getMeetings();
  if (action === "getContentChannels") return getContentChannels();
  if (action === "getRoutines") return getRoutines(e.parameter.userName, e.parameter.scope);
  if (action === "remindTask") return remindTask(e.parameter.taskId, e.parameter.from);
  if (action === "getDiscipline") return getDiscipline(e.parameter.userId, e.parameter.year, e.parameter.month, e.parameter.scope);
  if (action === "getSettings") return getSettings();
  if (action === "updateAttendanceSync") return updateAttendance(e.parameter.userId, e.parameter.userName, e.parameter.status);
  return jsonResponse({status: "ok", message: "WTC API v13 running"});
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    if (action === "addTask") return addTask(data.task);
    if (action === "updateTask") return updateTask(data.taskId, data.task, data.userName);
    if (action === "updateStatus") return updateStatus(data.taskId, data.status, data.userName);
    if (action === "deleteTask") return deleteTask(data.taskId);
    if (action === "updateAttendance") return updateAttendance(data.userId, data.userName, data.status);
    if (action === "markInboxRead") return markInboxRead(data.inboxId);
    if (action === "stopRoutine") return stopRoutine(data.taskId);
    if (action === "updateRoutine") return updateRoutine(data.taskId, data.updates, data.userName);
    if (action === "deleteRoutine") return deleteRoutine(data.taskId, data.userName, data.removeOpenCopies);
    if (action === "sendChat") return sendChat(data.from, data.to, data.message);
    if (action === "markChatRead") return markChatRead(data.from, data.to);
    if (action === "addTeamMember") return addTeamMember(data.member);
    if (action === "updateTeamMember") return updateTeamMember(data.id, data.updates);
    if (action === "setTeamActive") return setTeamActive(data.id, data.active);
    if (action === "deleteTeamMember") return deleteTeamMember(data.id);
    if (action === "startCall") return startCall(data.from, data.to, data.callType, data.callId);
    if (action === "respondToCall") return respondToCall(data.callId, data.userName, data.response);
    if (action === "addNotice") return addNotice(data.title, data.message, data.postedBy, data.pinned);
    if (action === "deleteNotice") return deleteNotice(data.noticeId);
    if (action === "addContentEntry") return addContentEntry(data.entry);
    if (action === "updateContentEntry") return updateContentEntry(data.id, data.updates, data.userName);
    if (action === "deleteContentEntry") return deleteContentEntry(data.id);
    if (action === "addMeeting") return addMeeting(data.meeting);
    if (action === "deleteMeeting") return deleteMeeting(data.meetingId);
    if (action === "addContentChannel") return addContentChannel(data.groupName, data.channelName);
    if (action === "deleteContentChannel") return deleteContentChannel(data.groupName, data.channelName);
    if (action === "addHoliday") return addHoliday(data.date, data.name);
    if (action === "deleteHoliday") return deleteHoliday(data.id);
    if (action === "savePushSubscription") return savePushSubscription(data.userName, data.subscription, data.device);
    if (action === "markAllInboxRead") return markAllInboxRead(data.userName);
    if (action === "requestCorrection") return requestCorrection(data.flagId, data.userId, data.note, data.correctedTime);
    if (action === "resolveFlag") return resolveFlag(data.flagId, data.decision, data.resolverId, data.resolverName);
    if (action === "saveSetting") return saveSetting(data.key, data.value, data.userId);
    if (action === "saveShift") return saveShift(data.targetId, data.shiftStart, data.shiftEnd, data.userId);
    return jsonResponse({status: "error", message: "Unknown action"});
  } catch (error) {
    return jsonResponse({status: "error", message: error.toString()});
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getTasks() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // FIX — this used to also WRITE delay-days and archive-status back to the sheet on
  // every single call. getTasks() is the highest-frequency endpoint in the app — every
  // team member's dashboard hits it every 15 seconds — and each write is one of the
  // slowest operations Apps Script does. With a dozen-plus people polling concurrently,
  // those writes were queuing up and are almost certainly why dashboards were sometimes
  // taking minutes to load. getTasks() is now PURE READ ONLY — delayDays is still computed
  // fresh and returned correctly every time, it's just no longer persisted to the sheet
  // here. Persisting now happens in archiveCompletedTasks() below, on its own 30-min
  // clock, independent of anyone loading a page.
  const tasks = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      if (data[i][13] === "Yes") continue;

      let delayDays = 0;
      if (data[i][6] !== "Completed" && data[i][5]) {
        const targetDate = new Date(data[i][5]);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = today - targetDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) delayDays = diffDays;
      }

      // Read-only fallback so a task can still vanish from THIS response immediately if
      // someone happens to load right as it crosses 24h — no write happens here anymore;
      // archiveCompletedTasks() does the actual persisted archiving independently.
      if (data[i][6] === "Completed" && data[i][7]) {
        const completedTime = new Date(data[i][7]);
        if (!isNaN(completedTime.getTime())) {
          const hoursSince = (new Date() - completedTime) / (1000 * 60 * 60);
          if (hoursSince > 24) continue;
        }
      }

      tasks.push({
        id: data[i][0],
        assignedTo: data[i][1],
        taskDetails: data[i][2],
        remarks: data[i][3],
        priority: data[i][4],
        targetDate: data[i][5],
        status: data[i][6],
        completionDate: data[i][7],
        delayDays: delayDays,
        lastReminder: data[i][9],
        assignedBy: data[i][10],
        assignedDate: data[i][11],
        channel: data[i][12] || "Other",
        archived: data[i][13] || "No",
        taskType: data[i][14] || "General",
        frequency: data[i][15] || "",
        // FIX — formatted as plain "yyyy-MM-dd" in IST (Sheets stores these as Date
        // objects, which otherwise serialize as UTC timestamps that read a day early).
        startDate: data[i][16] ? formatDateSafe_(data[i][16]) : "",
        endDate: data[i][17] ? formatDateSafe_(data[i][17]) : "",
        category: data[i][18] || "",
        reminderMode: data[i][19] || "",
        reminderDaysBefore: data[i][20] || "",
        bandStart: data[i][21] || "",
        bandEnd: data[i][22] || "",
        // FIX — Daily routine tasks that pile up unfinished for 14+ days get flagged so the
        // frontend can collapse them into a separate "Older Routine Tasks" section instead of
        // burying the rest of the board — still fully visible/counted, just out of the way.
        isStale: (data[i][14] === "Routine Instance" && data[i][15] === "Daily" && delayDays > 14)
      });
    }
  }

  return jsonResponse({status: "ok", tasks: tasks});
}

// FIX — completed tasks weren't reliably archiving after 24h, because the only code that
// did it lived inside getTasks() (i.e. only ran if someone happened to load a dashboard at
// the right moment). This runs independently every 30 min — see setupArchiveTrigger().
// It now ALSO persists delay-days (moved here from getTasks(), see note above), using the
// same single-batch-write pattern, so the sheet's "Delay Days" column stays accurate
// without ever slowing down anyone's page load.
function archiveCompletedTasks() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delayColumn = data.slice(1).map(row => row[8]);
  const archivedColumn = data.slice(1).map(row => row[13]);
  let delayChanged = false;
  let archiveChanged = false;

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] || data[i][13] === "Yes") continue;

    if (data[i][6] === "Completed" && data[i][7]) {
      const completedTime = new Date(data[i][7]);
      if (!isNaN(completedTime.getTime())) {
        const hoursSince = (now - completedTime) / (1000 * 60 * 60);
        if (hoursSince > 24) {
          archivedColumn[i - 1] = "Yes";
          archiveChanged = true;
          continue;
        }
      }
    }

    if (data[i][6] !== "Completed" && data[i][5]) {
      const targetDate = new Date(data[i][5]);
      targetDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && Number(delayColumn[i - 1]) !== diffDays) {
        delayColumn[i - 1] = diffDays;
        delayChanged = true;
      }
    }
  }

  if (delayChanged) {
    sheet.getRange(2, 9, delayColumn.length, 1).setValues(delayColumn.map(v => [v]));
  }
  if (archiveChanged) {
    sheet.getRange(2, 14, archivedColumn.length, 1).setValues(archivedColumn.map(v => [v]));
  }
}

// RUN THIS ONCE from the Apps Script editor (Run menu) to install the archive sweep
// (runs every 30 minutes). Safe to re-run — it clears any old duplicate triggers first.
function setupArchiveTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "archiveCompletedTasks") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("archiveCompletedTasks").timeBased().everyMinutes(30).create();
}

function getArchive() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const tasks = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][13] === "Yes") {
      tasks.push({
        id: data[i][0],
        assignedTo: data[i][1],
        taskDetails: data[i][2],
        remarks: data[i][3],
        priority: data[i][4],
        targetDate: data[i][5],
        status: data[i][6],
        completionDate: data[i][7],
        assignedBy: data[i][10],
        assignedDate: data[i][11],
        channel: data[i][12] || "Other",
        taskType: data[i][14] || "General",
        category: data[i][18] || ""
      });
    }
  }
  return jsonResponse({status: "ok", tasks: tasks});
}

function addTask(task) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();

  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && parseInt(data[i][0]) > maxId) maxId = parseInt(data[i][0]);
  }

  const newId = maxId + 1;
  const indiaDate = getIndiaDate();

  sheet.appendRow([
    newId, task.assignedTo, task.taskDetails, task.remarks || "",
    task.priority, task.targetDate, task.status || "Not Started",
    "", 0, "", task.assignedBy, indiaDate, task.channel || "Other",
    "No", task.taskType || "General", task.frequency || "",
    task.startDate || "", task.endDate || "", task.category || "",
    // FIX — routine reminder window fields (Weekly/Monthly Routine templates only)
    task.reminderMode || "", task.reminderDaysBefore || "", task.bandStart || "", task.bandEnd || ""
  ]);

  // For Weekly/Monthly Routine TEMPLATES with a reminder window configured, the task should
  // NOT notify anyone yet — it only becomes visible (and notifies) when createDailyRoutineTasks
  // generates the first real instance inside that window. Only General tasks and Daily/instant
  // Routine assignments notify immediately on creation.
  const isWindowedTemplate = task.taskType === "Routine" && (task.frequency === "Weekly" || task.frequency === "Monthly");
  if (!isWindowedTemplate) {
    const assignees = task.assignedTo.split(',').map(a => a.trim());
    assignees.forEach(assignee => {
      addToInbox(assignee, {
        type: task.taskType === "Routine" ? "new_routine" : "new_task",
        taskId: newId,
        from: task.assignedBy,
        title: task.taskDetails,
        priority: task.priority,
        timestamp: getIndiaTimeISO()
      });
    });
  }

  return jsonResponse({status: "ok", id: newId});
}

function updateTask(taskId, updates, userName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const isAdmin = ["Shivendra Singh", "PC", "Praveen Chilhate"].includes(userName);

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      const currentStatus = data[i][6];
      if (currentStatus === "Completed" && !isAdmin) {
        return jsonResponse({status: "error", message: "🔒 This task is completed. Only Shivendra Singh or PC can edit it further."});
      }
      if (updates.assignedTo !== undefined) sheet.getRange(i + 1, 2).setValue(updates.assignedTo);
      if (updates.taskDetails !== undefined) sheet.getRange(i + 1, 3).setValue(updates.taskDetails);
      if (updates.remarks !== undefined) sheet.getRange(i + 1, 4).setValue(updates.remarks);
      if (updates.priority !== undefined) sheet.getRange(i + 1, 5).setValue(updates.priority);
      // FIX — only Shivendra/PC may change the Target Date on an existing task. Enforced
      // here (not just disabled in the UI) since a client-side disable alone can be bypassed.
      if (updates.targetDate !== undefined && isAdmin) sheet.getRange(i + 1, 6).setValue(updates.targetDate);
      if (updates.channel !== undefined) sheet.getRange(i + 1, 13).setValue(updates.channel);
      if (updates.category !== undefined) sheet.getRange(i + 1, 19).setValue(updates.category);
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Task not found"});
}

function updateStatus(taskId, newStatus, userName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const isAdmin = ["Shivendra Singh", "PC", "Praveen Chilhate"].includes(userName);

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      const currentStatus = data[i][6];
      if (currentStatus === "Completed" && !isAdmin) {
        return jsonResponse({status: "error", message: "🔒 Only Shivendra Singh or PC can change completed tasks"});
      }
      sheet.getRange(i + 1, 7).setValue(newStatus);
      if (newStatus === "Completed") {
        // FIX — stores the exact moment (not just the date) so the 24h archive
        // math is precise instead of rounding to a whole day.
        sheet.getRange(i + 1, 8).setValue(getIndiaTimeISO());
        sheet.getRange(i + 1, 9).setValue(0);

        // NEW — notify the person who originally assigned this task (and only them)
        // that it's been completed, but only when someone OTHER than the assigner
        // completed it (no point notifying yourself about your own task).
        const assignedBy = data[i][10];
        const taskDetails = data[i][2];
        if (assignedBy && assignedBy !== userName) {
          addToInbox(assignedBy, {
            type: "task_completed",
            taskId: taskId,
            from: userName,
            title: taskDetails,
            priority: data[i][4],
            timestamp: getIndiaTimeISO()
          });
        }
      } else if (currentStatus === "Completed") {
        sheet.getRange(i + 1, 8).setValue("");
      }
      sheet.getRange(i + 1, 10).setValue(getIndiaTimeISO());
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Task not found"});
}

function deleteTask(taskId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      sheet.deleteRow(i + 1);
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Not found"});
}

// ============================================================
// MY RECURRING TASKS — lets each person manage their OWN recurring (Routine) tasks:
// pause, resume, change how long it runs (end date), or remove it entirely.
// A recurring task is the "Routine" template row; column 18 (End Date) is what controls
// whether createDailyRoutineTasks() keeps generating new copies:
//   - empty            → runs indefinitely
//   - today or later   → runs until that date (inclusive)
//   - before today     → paused/ended, no new copies are created
// Permission: the person it's assigned to, the person who assigned it, or an admin.
// ============================================================
const ROUTINE_ADMINS_ = ["Shivendra Singh", "PC", "Praveen Chilhate"];

function canManageRoutine_(row, userName) {
  if (!userName) return false;
  if (ROUTINE_ADMINS_.indexOf(userName) !== -1) return true;
  if (row[10] === userName) return true;
  const assignees = String(row[1]).split(',').map(a => a.trim());
  return assignees.indexOf(userName) !== -1;
}

function updateRoutine(taskId, updates, userName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      if (data[i][14] !== "Routine") return jsonResponse({status: "error", message: "Not a recurring task"});
      if (!canManageRoutine_(data[i], userName)) return jsonResponse({status: "error", message: "Not allowed"});
      if (updates && updates.endDate !== undefined) sheet.getRange(i + 1, 18).setValue(updates.endDate || "");
      if (updates && updates.startDate) sheet.getRange(i + 1, 17).setValue(updates.startDate);
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Task not found"});
}

// FIX — "I can't see my recurring tasks". getTasks() leaves out archived rows, and a
// recurring task's main row gets archived 24h after anyone marks it "Completed" on the
// board — even though it keeps creating new copies every day. So many live recurring tasks
// were invisible to the 🔁 panel. This reads EVERY row (archived included) and returns:
//   • every recurring task (current, paused/ended, archived) with its copy counts
//   • old series whose main row was deleted (only copies remain) — shown as past
// scope "all" (whole team) is honoured for admins only; everyone else gets their own
// (assigned to them or by them).
function getRoutines(userName, scope) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const isAdmin = ROUTINE_ADMINS_.indexOf(userName) !== -1;
  const wholeTeam = isAdmin && scope === "all";
  const isMine = (assignedTo, assignedBy) =>
    assignedBy === userName || String(assignedTo).split(',').map(a => a.trim()).indexOf(userName) !== -1;
  const keyOf = (details, to) => String(details) + "||" + String(to);
  const asDate = (v) => (v ? formatDateSafe_(v) : "");

  const stats = {};
  const templates = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    if (row[14] === "Routine Instance") {
      const k = keyOf(row[2], row[1]);
      const st = stats[k] || (stats[k] = {
        open: 0, done: 0, lastDue: "", firstDue: "", assignedTo: row[1], taskDetails: row[2],
        assignedBy: row[10], frequency: row[15], priority: row[4], channel: row[12], category: row[18], anyId: row[0]
      });
      if (row[6] === "Completed") st.done++; else st.open++;
      const due = asDate(row[5]);
      if (due && due > st.lastDue) st.lastDue = due;
      if (due && (!st.firstDue || due < st.firstDue)) st.firstDue = due;
    } else if (row[14] === "Routine") {
      templates.push(row);
    }
  }

  const routines = [];
  const matched = {};
  templates.forEach(row => {
    if (!wholeTeam && !isMine(row[1], row[10])) return;
    const k = keyOf(row[2], row[1]);
    matched[k] = true;
    const st = stats[k] || { open: 0, done: 0, lastDue: "" };
    routines.push({
      id: row[0], hasSchedule: true, taskDetails: row[2], assignedTo: row[1], assignedBy: row[10],
      frequency: row[15] || "Daily", startDate: asDate(row[16]), endDate: asDate(row[17]),
      priority: row[4], channel: row[12], category: row[18],
      archived: row[13] === "Yes", openCopies: st.open, doneCopies: st.done, lastDue: st.lastDue
    });
  });
  Object.keys(stats).forEach(k => {
    if (matched[k]) return;
    const st = stats[k];
    if (!wholeTeam && !isMine(st.assignedTo, st.assignedBy)) return;
    routines.push({
      id: "series_" + st.anyId, hasSchedule: false, taskDetails: st.taskDetails, assignedTo: st.assignedTo,
      assignedBy: st.assignedBy, frequency: st.frequency || "Daily", startDate: st.firstDue, endDate: st.lastDue,
      priority: st.priority, channel: st.channel, category: st.category,
      archived: false, openCopies: st.open, doneCopies: st.done, lastDue: st.lastDue
    });
  });
  return jsonResponse({status: "ok", routines: routines});
}

// Removes the recurring task itself. If removeOpenCopies is true, also removes any of its
// copies that are still unfinished (completed copies are always kept for the record).
function deleteRoutine(taskId, userName, removeOpenCopies) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  let templateRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) { templateRow = i; break; }
  }
  if (templateRow === -1) return jsonResponse({status: "error", message: "Task not found"});
  const tpl = data[templateRow];
  if (tpl[14] !== "Routine") return jsonResponse({status: "error", message: "Not a recurring task"});
  if (!canManageRoutine_(tpl, userName)) return jsonResponse({status: "error", message: "Not allowed"});

  const rowsToDelete = [templateRow + 1];
  if (removeOpenCopies) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][14] === "Routine Instance" && data[i][2] === tpl[2] && data[i][1] === tpl[1] && data[i][6] !== "Completed") {
        rowsToDelete.push(i + 1);
      }
    }
  }
  rowsToDelete.sort((a, b) => b - a).forEach(r => sheet.deleteRow(r));
  return jsonResponse({status: "ok", removed: rowsToDelete.length});
}

function stopRoutine(taskId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      sheet.getRange(i + 1, 18).setValue(getIndiaDate());
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error"});
}

// Creates the actual row for one routine cycle and notifies the assignees. This is the
// ONLY place a routine instance ever gets created, and it's only called the moment a
// reminder window should open — so creation IS the reminder (both the on-dashboard
// appearance and the inbox message fire at exactly the same moment, automatically).
function createRoutineInstance_(sheet, template, dueDate) {
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let j = 1; j < data.length; j++) {
    if (data[j][0] && parseInt(data[j][0]) > maxId) maxId = parseInt(data[j][0]);
  }
  const newId = maxId + 1;
  const dueDateStr = Utilities.formatDate(dueDate, "Asia/Kolkata", "yyyy-MM-dd");
  const todayStr = getIndiaDate();

  sheet.appendRow([
    newId, template.assignedTo, template.taskDetails, template.remarks,
    template.priority, dueDateStr, "Not Started", "", 0, "",
    template.assignedBy, todayStr, template.channel, "No",
    "Routine Instance", template.frequency, "", "", template.category,
    template.reminderMode || "", template.reminderDaysBefore || "", template.bandStart || "", template.bandEnd || ""
  ]);

  const assignees = String(template.assignedTo).split(',').map(a => a.trim());
  assignees.forEach(assignee => {
    addToInbox(assignee, {
      type: "new_routine",
      taskId: newId,
      from: template.assignedBy,
      title: template.taskDetails + " (due " + dueDateStr + ")",
      priority: template.priority,
      timestamp: getIndiaTimeISO()
    });
  });
}

function createDailyInstanceIfNeeded_(sheet, template, todayDate, todayKey, data) {
  for (let i = 1; i < data.length; i++) {
    if (data[i][14] === "Routine Instance" && data[i][2] === template.taskDetails && data[i][1] === template.assignedTo) {
      const created = data[i][11] ? Utilities.formatDate(new Date(data[i][11]), "Asia/Kolkata", "yyyy-MM-dd") : null;
      if (created === todayKey) return; // already created today
    }
  }
  createRoutineInstance_(sheet, template, todayDate);
}

// FIX — redesigned routine reminder system.
// Daily: unchanged, creates a fresh instance every day.
// Weekly/Monthly: instead of appearing the instant the template is created (and instead of
// silently disappearing/reappearing), each cycle now generates exactly ONE instance, timed to
// appear only when its reminder window opens:
//   - "date" mode: appears (reminderDaysBefore) days before the anchor day, stays visible
//     (and goes overdue) until completed.
//   - "band" mode: appears on the band's start day, due date = band's end day.
function createDailyRoutineTasks() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayKey = dateKey_(todayDate);

  const existingWeekKeys = new Set();
  const existingMonthKeys = new Set();
  const routineTemplates = [];

  for (let i = 1; i < data.length; i++) {
    const taskType = data[i][14];
    if (taskType === "Routine" && data[i][15]) {
      const endDate = data[i][17] ? new Date(data[i][17]) : null;
      if (!endDate || endDate >= todayDate) {
        routineTemplates.push({
          assignedTo: data[i][1], taskDetails: data[i][2], remarks: data[i][3],
          priority: data[i][4], assignedBy: data[i][10], channel: data[i][12],
          frequency: data[i][15], startDate: data[i][16], category: data[i][18],
          reminderMode: data[i][19] || "date",
          reminderDaysBefore: data[i][20] !== "" && data[i][20] !== undefined ? Number(data[i][20]) : 0,
          bandStart: (data[i][21] !== "" && data[i][21] !== undefined) ? Number(data[i][21]) : null,
          bandEnd: (data[i][22] !== "" && data[i][22] !== undefined) ? Number(data[i][22]) : null
        });
      }
    }
    if (taskType === "Routine Instance" && data[i][5]) {
      const dueDate = new Date(data[i][5]);
      if (!isNaN(dueDate.getTime())) {
        existingWeekKeys.add(getMonday_(dueDate).getTime() + "|" + data[i][2] + "|" + data[i][1]);
        existingMonthKeys.add(dueDate.getFullYear() + "-" + dueDate.getMonth() + "|" + data[i][2] + "|" + data[i][1]);
      }
    }
  }

  routineTemplates.forEach(template => {
    if (template.frequency === "Daily") {
      createDailyInstanceIfNeeded_(sheet, template, todayDate, todayKey, data);
      return;
    }

    if (template.frequency === "Weekly") {
      const anchorWeekday = new Date(template.startDate).getDay();
      const thisMonday = getMonday_(todayDate);
      const weekKey = thisMonday.getTime() + "|" + template.taskDetails + "|" + template.assignedTo;
      if (existingWeekKeys.has(weekKey)) return;

      if (template.reminderMode === "band" && template.bandStart !== null && template.bandEnd !== null) {
        if (todayDate.getDay() === template.bandStart) {
          const endOffset = template.bandEnd >= template.bandStart ? template.bandEnd - 1 : 6;
          const dueDate = addDays_(thisMonday, endOffset);
          createRoutineInstance_(sheet, template, dueDate);
        }
      } else {
        const dueDate = addDays_(thisMonday, (anchorWeekday === 0 ? 7 : anchorWeekday) - 1);
        const visibleFrom = addDays_(dueDate, -template.reminderDaysBefore);
        // >= visibleFrom (not strictly ==) so a missed trigger run still catches up
        // instead of silently skipping the reminder for the whole cycle.
        if (todayDate >= visibleFrom && todayDate <= dueDate) {
          createRoutineInstance_(sheet, template, dueDate);
        }
      }
      return;
    }

    if (template.frequency === "Monthly") {
      const anchorDay = new Date(template.startDate).getDate();
      const y = todayDate.getFullYear(), m = todayDate.getMonth();
      const monthKey = y + "-" + m + "|" + template.taskDetails + "|" + template.assignedTo;
      if (existingMonthKeys.has(monthKey)) return;

      if (template.reminderMode === "band" && template.bandStart !== null && template.bandEnd !== null) {
        const bandStartDay = clampDay_(y, m, template.bandStart);
        const bandEndDay = clampDay_(y, m, template.bandEnd);
        if (todayDate.getDate() === bandStartDay) {
          const dueDate = new Date(y, m, bandEndDay);
          createRoutineInstance_(sheet, template, dueDate);
        }
      } else {
        const dueDay = clampDay_(y, m, anchorDay);
        const dueDate = new Date(y, m, dueDay);
        const visibleFrom = addDays_(dueDate, -template.reminderDaysBefore);
        if (todayDate >= visibleFrom && todayDate <= dueDate) {
          createRoutineInstance_(sheet, template, dueDate);
        }
      }
      return;
    }
  });
}

function getAttendanceSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Attendance");
  if (!sheet) {
    sheet = ss.insertSheet("Attendance");
    sheet.appendRow(["Date", "User ID", "Name", "Status", "Timestamp", "Activity Log"]);
  }
  return sheet;
}

// v13 — the rules are now enforced on the server too (the buttons already enforce them):
//   • Lunch can only START between 1:00 and 2:00 PM, and only once a day.
// The answer says why when something is refused, so the app can show it.
function updateAttendance(userId, userName, status) {
  const allowed = ["Working", "Lunch Break", "Meeting", "Signed Out"];
  if (allowed.indexOf(status) === -1) return jsonResponse({status: "error", message: "Unknown status"});
  const sheet = getAttendanceSheet_();
  const now = new Date();
  const today = getIndiaDate();
  if (status === "Lunch Break") {
    const m = istMinutes_(now);
    if (m < LUNCH_START_MIN_ || m >= LUNCH_END_MIN_) {
      return jsonResponse({status: "error", code: "LUNCH_WINDOW", message: "Lunch can only be marked between 1:00 and 2:00 PM."});
    }
    const recent = readRecentAttendance_(sheet, 1500);
    const mine = (eventsByUserForDate_(recent.values, today)[userId] || { events: [] }).events;
    if (mine.some(e => e.status === "Lunch Break")) {
      return jsonResponse({status: "error", code: "LUNCH_TAKEN", message: "Lunch was already marked today."});
    }
  }
  sheet.appendRow([today, userId, userName, status, now.toISOString(), ""]);
  return jsonResponse({status: "ok"});
}

// Reads today's attendance from the LAST rows only (rows are append-only, so today's are
// always at the bottom) — this endpoint is polled by everyone every 15s, and reading the
// whole ever-growing sheet each time was one of the heaviest things the backend did.
function getAttendance() {
  const sheet = getAttendanceSheet_();
  const today = getIndiaDate();
  const recent = readRecentAttendance_(sheet, 1500);
  const byUser = eventsByUserForDate_(recent.values, today);
  const attendance = Object.keys(byUser).map(uid => {
    const info = byUser[uid];
    const last = info.events[info.events.length - 1];
    return {
      userId: uid, name: info.name, status: last.status, timestamp: last.time.toISOString(),
      log: info.events.map(ev => ev.status + '|SEP|' + ev.time.toISOString()).join('||EVT||'),
      autoNotes: info.events.filter(ev => ev.note).map(ev => ev.note)
    };
  });
  return jsonResponse({status: "ok", attendance: attendance, shifts: getShiftMap_(), workingDay: isWorkingDay_(today), rules: attendanceRules_()});
}

// FIX — monthly attendance view. Returns one entry per calendar day for the requested
// month, with working/break ms and productivity already computed server-side. Meeting now
// counts toward Working time (only Lunch Break counts as a break) — matches the live view.
function getMonthlyAttendance(userId, year, month) {
  const y = parseInt(year), m = parseInt(month) - 1; // client sends 1-12
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Attendance");
  if (!sheet) return jsonResponse({status: "ok", days: []});

  const data = sheet.getDataRange().getValues();
  const byDate = {};

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] !== userId) continue;
    const time = new Date(data[i][4]);
    if (isNaN(time.getTime())) continue;
    if (time.getFullYear() !== y || time.getMonth() !== m) continue;
    const dKey = Utilities.formatDate(time, "Asia/Kolkata", "yyyy-MM-dd");
    if (!byDate[dKey]) byDate[dKey] = [];
    byDate[dKey].push({ status: data[i][3], time: time });
  }

  const totalDays = daysInMonth_(y, m);
  const todayKey = getIndiaDate();
  const days = [];

  for (let d = 1; d <= totalDays; d++) {
    const dKey = Utilities.formatDate(new Date(y, m, d), "Asia/Kolkata", "yyyy-MM-dd");
    const events = (byDate[dKey] || []).sort((a, b) => a.time - b.time);
    let workingMs = 0, breakMs = 0;
    const isToday = dKey === todayKey;
    for (let i = 0; i < events.length - 1; i++) {
      const dur = events[i + 1].time - events[i].time;
      if (dur < 0) continue;
      if (events[i].status === "Working" || events[i].status === "Meeting") workingMs += dur;
      else if (events[i].status === "Lunch Break") breakMs += dur;
    }
    if (isToday && events.length > 0) {
      const last = events[events.length - 1];
      if (last.status !== "Signed Out") {
        const dur = new Date() - last.time;
        if (dur > 0) {
          if (last.status === "Working" || last.status === "Meeting") workingMs += dur;
          else if (last.status === "Lunch Break") breakMs += dur;
        }
      }
    }
    const totalMs = workingMs + breakMs;
    const productivity = totalMs > 0 ? Math.round((workingMs / totalMs) * 100) : 0;
    days.push({ date: dKey, day: d, hasData: events.length > 0, workingMs: workingMs, breakMs: breakMs, productivity: productivity });
  }

  return jsonResponse({status: "ok", days: days});
}

function getInboxSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Inbox");
  if (!sheet) {
    sheet = ss.insertSheet("Inbox");
    sheet.appendRow(["ID", "Date", "User", "Type", "From", "Task ID", "Title", "Priority", "Read", "Timestamp"]);
  }
  return sheet;
}

// Next numeric ID for an append-only sheet. IDs only ever grow, so the newest rows hold
// the largest one — reading the last 200 IDs is enough and far faster than the whole sheet.
function nextIdFromTail_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  const start = Math.max(2, lastRow - 199);
  const ids = sheet.getRange(start, 1, lastRow - start + 1, 1).getValues();
  let maxId = 0;
  ids.forEach(r => { const n = parseInt(r[0], 10); if (!isNaN(n) && n > maxId) maxId = n; });
  return maxId + 1;
}

const INBOX_PUSH_TITLES_ = {
  new_task: "📋 New Task", new_routine: "🔄 Routine Task", task_completed: "✅ Task Completed",
  new_meeting: "🤝 New Meeting", task_reminder: "⏰ Reminder", missed_call: "📞 Missed call",
  attendance: "🕘 Attendance", correction: "📝 Attendance correction"
};

// options.noPush = true → write the inbox row only (used when the person was already
// alerted another way, e.g. they were looking at the call screen).
function addToInbox(userName, notification, options) {
  const sheet = getInboxSheet_();
  const id = nextIdFromTail_(sheet);
  sheet.appendRow([
    id, getIndiaDate(), userName, notification.type,
    notification.from, notification.taskId, notification.title,
    notification.priority || "Medium", "No", notification.timestamp || getIndiaTimeISO()
  ]);
  if (options && options.noPush) return id;
  try {
    const title = INBOX_PUSH_TITLES_[notification.type] || "🔔 WTC Hub";
    const prefix = notification.type === "task_reminder" ? (notification.from + ": ") : "";
    const isTask = notification.taskId && !String(notification.taskId).startsWith("meeting_") && !String(notification.taskId).startsWith("call_");
    const url = isTask ? "/?task=" + encodeURIComponent(notification.taskId) : "/";
    sendPushToUser_(userName, title, prefix + (notification.title || ""), url, notification.type + "_" + id,
      { kind: "inbox", type: notification.type, taskId: notification.taskId || "" });
  } catch (e) { Logger.log("push (inbox) failed: " + e); }
  return id;
}

// ============================================================
// PUSH SUBSCRIPTIONS — one row per device per user (someone can be logged in on their
// phone AND their laptop, both should ring). Keyed by endpoint so re-subscribing the
// same device (e.g. after clearing site data) just updates its row instead of duplicating.
// ============================================================
function getPushSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("PushSubscriptions");
  if (!sheet) {
    sheet = ss.insertSheet("PushSubscriptions");
    sheet.appendRow(["ID", "UserName", "Endpoint", "SubscriptionJSON", "CreatedDate", "Device", "LastSeen"]);
  } else if (sheet.getLastColumn() < 7) {
    sheet.getRange(1, 6, 1, 2).setValues([["Device", "LastSeen"]]);
  }
  return sheet;
}

// Saves (or refreshes) this device's push registration. The app calls this every time it
// opens with notifications allowed, so "LastSeen" shows which devices are still in use.
function savePushSubscription(userName, subscription, device) {
  if (!userName || !subscription || !subscription.endpoint) {
    return jsonResponse({status: "error", message: "Missing userName or subscription"});
  }
  const sheet = getPushSheet_();
  const data = sheet.getDataRange().getValues();
  const subJson = JSON.stringify(subscription);
  const now = getIndiaTimeISO();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === subscription.endpoint) {
      sheet.getRange(i + 1, 2).setValue(userName);
      sheet.getRange(i + 1, 4).setValue(subJson);
      sheet.getRange(i + 1, 6, 1, 2).setValues([[device || data[i][5] || "", now]]);
      return jsonResponse({status: "ok"});
    }
  }
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && parseInt(data[i][0]) > maxId) maxId = parseInt(data[i][0]);
  }
  sheet.appendRow([maxId + 1, userName, subscription.endpoint, subJson, now, device || "", now]);
  return jsonResponse({status: "ok"});
}

function sendPushToUser_(userName, title, body, url, tag, data) {
  if (!userName) return null;
  return sendPushToUsers_([userName], title, body, url, tag, data);
}

// Sends to ALL of the given people's devices in ONE parallel round (fetchAll).
// FIX — now RETURNS a delivery report instead of failing silently, so the caller's screen
// (and the Call Alerts check panel) can show exactly what happened for each person:
//   report.byUser[name] = { devices, delivered, errors: [...] }
//   report.fatal        = an error that stopped everything (e.g. Apps Script not
//                         authorised to reach the internet), or null
// Subscriptions the push service reports as permanently gone (404/410) are removed.
function sendPushToUsers_(userNames, title, body, url, tag, data) {
  const report = { byUser: {}, fatal: null };
  const wanted = {};
  (userNames || []).forEach(n => {
    const name = String(n || "").trim();
    if (name) { wanted[name] = true; report.byUser[name] = { devices: 0, delivered: 0, errors: [] }; }
  });
  if (Object.keys(wanted).length === 0) return report;

  let sheet, rows;
  try {
    sheet = getPushSheet_();
    rows = sheet.getDataRange().getValues();
  } catch (e) { report.fatal = "Could not read PushSubscriptions: " + e; return report; }

  const requests = [];
  const meta = [];
  const payload = { title: title, body: body, url: url || "/", tag: tag || "wtc", data: data || {} };
  for (let i = 1; i < rows.length; i++) {
    const name = String(rows[i][1] || "").trim();
    if (!wanted[name]) continue;
    let subscription;
    try { subscription = JSON.parse(rows[i][3]); } catch (e) { continue; }
    report.byUser[name].devices++;
    requests.push({
      url: PUSH_RELAY_URL,
      method: "post",
      contentType: "application/json",
      // Each device's copy carries who it is for, so "✓ Coming" on a call notification
      // can answer for the right person without opening the app.
      payload: JSON.stringify({ subscription: subscription, payload: Object.assign({}, payload, { data: Object.assign({}, payload.data, { to: name }) }) }),
      muteHttpExceptions: true
    });
    meta.push({ row: i + 1, name: name, device: rows[i][5] || "device" });
  }
  if (requests.length === 0) return report;

  let responses = [];
  try {
    responses = UrlFetchApp.fetchAll(requests);
  } catch (e) {
    report.fatal = String(e);
    Logger.log("push fetchAll failed: " + e);
    return report;
  }

  const deadRows = [];
  responses.forEach((res, idx) => {
    const m = meta[idx];
    const entry = report.byUser[m.name];
    let out = null;
    try { out = JSON.parse(res.getContentText()); } catch (e) {}
    if (out && out.ok) {
      entry.delivered++;
    } else if (out && (out.statusCode === 404 || out.statusCode === 410)) {
      deadRows.push(m.row);
      entry.errors.push(m.device + ": registration expired (removed — reopen the app on that device)");
    } else if (out) {
      entry.errors.push(m.device + ": " + (out.statusCode ? "push service said " + out.statusCode + " — " : "") + (out.error || "failed"));
    } else {
      entry.errors.push(m.device + ": relay answered HTTP " + res.getResponseCode());
    }
  });
  deadRows.sort((a, b) => b - a).forEach(r => { try { sheet.deleteRow(r); } catch (e) {} });
  return report;
}

// Only UNREAD notifications are returned — a notification disappears the moment it is
// clicked (or cleared), so the inbox never piles up again.
function getInbox(userName) {
  const sheet = getInboxSheet_();
  const data = sheet.getDataRange().getValues();
  const inbox = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === userName && data[i][8] !== "Yes") {
      inbox.push({
        id: data[i][0], date: data[i][1], user: data[i][2],
        type: data[i][3], from: data[i][4], taskId: data[i][5],
        title: data[i][6], priority: data[i][7] || "Medium",
        read: "No", timestamp: data[i][9] instanceof Date ? data[i][9].toISOString() : data[i][9]
      });
    }
  }
  inbox.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return jsonResponse({status: "ok", inbox: inbox.slice(0, 300)});
}

function markInboxRead(inboxId) {
  const sheet = getInboxSheet_();
  const data = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] == inboxId) {
      sheet.getRange(i + 1, 9).setValue("Yes");
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error"});
}

// "Clear all" — one batched write of the Read column instead of hundreds of single writes.
function markAllInboxRead(userName) {
  if (!userName) return jsonResponse({status: "error", message: "Missing userName"});
  const sheet = getInboxSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return jsonResponse({status: "ok", cleared: 0});
  const users = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
  const readCol = sheet.getRange(2, 9, lastRow - 1, 1).getValues();
  let cleared = 0;
  for (let i = 0; i < users.length; i++) {
    if (users[i][0] === userName && readCol[i][0] !== "Yes") { readCol[i][0] = "Yes"; cleared++; }
  }
  if (cleared > 0) sheet.getRange(2, 9, lastRow - 1, 1).setValues(readCol);
  return jsonResponse({status: "ok", cleared: cleared});
}

// Marks this person's unread inbox rows of a given type + taskId as read (e.g. the
// "missed call" note once they finally answer, or a reminder once the task is done).
function markInboxReadWhere_(userName, type, taskId) {
  const sheet = getInboxSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const start = Math.max(2, lastRow - 999);
  const rows = sheet.getRange(start, 1, lastRow - start + 1, 9).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][2] === userName && rows[i][3] === type && String(rows[i][5]) === String(taskId) && rows[i][8] !== "Yes") {
      sheet.getRange(start + i, 9).setValue("Yes");
    }
  }
}

function sendChat(from, to, message) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Chat");
  if (!sheet) {
    sheet = ss.insertSheet("Chat");
    sheet.appendRow(["Message ID", "From", "To", "Message", "Timestamp", "Read", "Type"]);
  }
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && parseInt(data[i][0]) > maxId) maxId = parseInt(data[i][0]);
  }
  sheet.appendRow([maxId + 1, from, to, message, getIndiaTimeISO(), "No", "message"]);
  return jsonResponse({status: "ok"});
}

function getChats(userName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Chat");
  if (!sheet) return jsonResponse({status: "ok", chats: []});

  const data = sheet.getDataRange().getValues();
  const chats = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userName || data[i][2] === userName) {
      chats.push({
        id: data[i][0], from: data[i][1], to: data[i][2],
        message: data[i][3], timestamp: data[i][4],
        read: data[i][5], type: data[i][6]
      });
    }
  }
  chats.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return jsonResponse({status: "ok", chats: chats});
}

function markChatRead(from, to) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Chat");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === from && data[i][2] === to && data[i][5] === "No") {
      sheet.getRange(i + 1, 6).setValue("Yes");
    }
  }
  return jsonResponse({status: "ok"});
}

// ============================================================
// CALLS — "Come to My Cabin" / "Immediate Meeting" summon alerts
// PC and Shivendra only (enforced on the frontend); either of them can call the
// other too. One row per recipient per call, so group calls can show live status.
// ============================================================
function getCallsSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Calls");
  if (!sheet) {
    sheet = ss.insertSheet("Calls");
    sheet.appendRow(["Call ID", "From", "To", "Type", "Timestamp", "Response", "Response Time"]);
  }
  return sheet;
}

// ============================================================
// FIX — CALL SPEED (target: ring on the other side in under 2 seconds).
// Root cause of slow/missed calls: every open dashboard asked "any call for me?" once a
// SECOND, and each of those opened the spreadsheet and read the entire (ever-growing)
// Calls sheet. With a dozen people that is 12+ heavy requests per second against Apps
// Script's ~30-at-a-time limit — requests queued behind each other or failed outright,
// which ALSO slowed down the Content Calendar, tasks and everything else.
// New design:
//   1. Live call state lives in CacheService (in-memory, ~10-30ms, no spreadsheet).
//   2. startCall writes the ring into that cache FIRST, then pushes every recipient's
//      devices in ONE parallel round (fetchAll), and only then writes the sheet log.
//   3. getIncomingCalls / getCallStatus read only the cache — near-instant and cheap,
//      so polling no longer clogs the backend for everyone else.
//   4. The caller's app now creates the call ID itself, so its "calling..." screen
//      appears instantly instead of waiting for the server round-trip.
// The Calls sheet is still written for history; it is just no longer on the hot path.
// ============================================================
const CALL_WINDOW_SECS_ = 120;
const CALL_CACHE_SECS_ = 300;

function readJsonCache_(cache, key, fallback) {
  try {
    const raw = cache.get(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

function withScriptLock_(fn) {
  const lock = LockService.getScriptLock();
  let locked = false;
  try { locked = lock.tryLock(5000); } catch (e) {}
  try { return fn(); } finally { if (locked) { try { lock.releaseLock(); } catch (e) {} } }
}

function startCall(from, toList, callType, providedCallId) {
  const callId = providedCallId ? String(providedCallId) : ("call_" + Date.now());
  const cache = CacheService.getScriptCache();
  const recipients = (toList || []).map(r => String(r).trim()).filter(r => r);
  if (recipients.length === 0) return jsonResponse({status: "error", message: "No recipients"});

  // v13 — IDEMPOTENT. The app retries a slow request, which used to log the same call
  // twice (and push twice). A call ID that is already live is simply acknowledged.
  const existing = readJsonCache_(cache, "callst_" + callId, null);
  if (existing && existing.recipients) {
    return jsonResponse({status: "ok", callId: callId, duplicate: true});
  }
  const ts = getIndiaTimeISO();

  // 1. INSTANT — make the call visible to every recipient's next check right now.
  withScriptLock_(() => {
    const statusMap = {};
    const nowMs = Date.now();
    recipients.forEach(r => {
      statusMap[r] = "Ringing";
      const key = "ring_" + r;
      let list = readJsonCache_(cache, key, []);
      list = list.filter(c => c.callId !== callId && (nowMs - new Date(c.timestamp).getTime()) / 1000 <= CALL_WINDOW_SECS_);
      list.push({ callId: callId, from: from, type: callType, timestamp: ts });
      cache.put(key, JSON.stringify(list), CALL_CACHE_SECS_);
    });
    cache.put("callst_" + callId, JSON.stringify({ from: from, callType: callType, timestamp: ts, recipients: statusMap }), 900);
  });

  // 2. PUSH — wakes every recipient's phone/laptop even when the app is closed.
  try {
    sendPushToUsers_(recipients, "📞 " + from + " is calling you", (callType || "Incoming call") + " — tap to answer", "/", "wtc-call-" + callId,
      { kind: "call", callId: callId, from: from, type: callType, timestamp: ts });
  } catch (e) { Logger.log("push (call) failed: " + e); }

  // 3. HISTORY — permanent record, one batched write.
  try {
    const sheet = getCallsSheet_();
    const rows = recipients.map(r => [callId, from, r, callType, ts, "Ringing", ""]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
  } catch (e) { Logger.log("call log write failed: " + e); }

  return jsonResponse({status: "ok", callId: callId});
}

// Cache-only: no spreadsheet access at all, so this is cheap enough to poll often.
function getIncomingCalls(userName) {
  const cache = CacheService.getScriptCache();
  const nowMs = Date.now();
  const list = readJsonCache_(cache, "ring_" + userName, []);
  const calls = list.filter(c => (nowMs - new Date(c.timestamp).getTime()) / 1000 <= CALL_WINDOW_SECS_);
  return jsonResponse({status: "ok", calls: calls});
}

function respondToCall(callId, userName, response) {
  const cache = CacheService.getScriptCache();
  let st = null;
  withScriptLock_(() => {
    const key = "ring_" + userName;
    const list = readJsonCache_(cache, key, []).filter(c => c.callId !== callId);
    cache.put(key, JSON.stringify(list), CALL_CACHE_SECS_);
    st = readJsonCache_(cache, "callst_" + callId, null);
    if (st && st.recipients) {
      // An answer always wins over an automatic "Missed" from another device.
      if (!(response === "Missed" && (st.recipients[userName] === "Accepted" || st.recipients[userName] === "Declined"))) {
        st.recipients[userName] = response;
      }
      cache.put("callst_" + callId, JSON.stringify(st), 900);
    }
  });

  const sheet = getCallsSheet_();
  const lastRow = sheet.getLastRow();
  let from = st ? st.from : "", callType = st ? st.callType : "";
  if (lastRow >= 2) {
    const startRow = Math.max(2, lastRow - 499);
    const data = sheet.getRange(startRow, 1, lastRow - startRow + 1, 6).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][0] === callId && data[i][2] === userName) {
        from = from || data[i][1]; callType = callType || data[i][3];
        const prev = data[i][5];
        if (!(response === "Missed" && (prev === "Accepted" || prev === "Declined"))) {
          sheet.getRange(startRow + i, 6, 1, 2).setValues([[response, getIndiaTimeISO()]]);
        }
        break;
      }
    }
  }
  if (response === "Missed") {
    try {
      addToInbox(userName, { type: "missed_call", taskId: callId, from: from || "Someone",
        title: (callType || "Call") + " — you missed this call", priority: "High" }, { noPush: true });
    } catch (e) {}
  } else {
    try { markInboxReadWhere_(userName, "missed_call", callId); } catch (e) {}
  }
  return jsonResponse({status: "ok"});
}

function getCallStatus(callId) {
  // Fast path — live state from the cache.
  const cache = CacheService.getScriptCache();
  const st = readJsonCache_(cache, "callst_" + callId, null);
  if (st && st.recipients) {
    const nowMs = Date.now();
    const recipientsFast = Object.keys(st.recipients).map(to => {
      let response = st.recipients[to];
      if (response === "Ringing" && (nowMs - new Date(st.timestamp).getTime()) / 1000 > 165) response = "Missed";
      return { to: to, response: response };
    });
    return jsonResponse({status: "ok", from: st.from, callType: st.callType, timestamp: st.timestamp, recipients: recipientsFast});
  }

  // Fallback (cache evicted) — read the history sheet.
  const sheet = getCallsSheet_();
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const recipients = [];
  let from = "", callType = "", timestamp = "";
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === callId) {
      from = data[i][1]; callType = data[i][3]; timestamp = data[i][4];
      let response = data[i][5];
      if (response === "Ringing") {
        const ts = new Date(data[i][4]);
        // FIX — widened to 165s (120s detection window + 45s response time once seen) so
        // the sender's live status view doesn't prematurely show "Missed" for a call the
        // recipient's throttled tab genuinely hasn't had a chance to discover yet.
        if ((now - ts) / 1000 > 165) response = "Missed"; // display-only inference; robust even if the recipient's tab is closed
      }
      recipients.push({ to: data[i][2], response: response });
    }
  }
  return jsonResponse({status: "ok", from: from, callType: callType, timestamp: timestamp, recipients: recipients});
}

// ============================================================
// TEAM MANAGEMENT (PC & Shivendra only)
// ============================================================
const TEAMCONFIG_HEADERS = ["ID", "Name", "Display Name", "Role", "Avatar", "Quote Type", "URL Slug", "Is Admin", "Is HR", "Active"];

function getTeamConfigSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("TeamConfig");
  if (!sheet) {
    sheet = ss.insertSheet("TeamConfig");
    sheet.appendRow(TEAMCONFIG_HEADERS);
  }
  return sheet;
}

function slugify_(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function seedTeamConfig() {
  const sheet = getTeamConfigSheet_();
  if (sheet.getLastRow() > 1) return;

  const seed = [
    ["pcwtc45", "PC", "PC", "CEO", "PC", "ceo", "pcwtc45", "Yes", "No", "Yes"],
    ["shivendrawtc77", "Shivendra Singh", "Shivendra Singh", "Sr. Social Media Manager", "SS", "manager", "shivendrawtc77", "Yes", "No", "Yes"],
    ["deeksha", "Deeksha", "Deeksha", "Content Writer", "DJ", "social_media", "deeksha", "No", "No", "Yes"],
    ["nidhi", "Nidhi", "Nidhi", "Poorvaj", "NV", "social_media", "nidhi", "No", "No", "Yes"],
    ["muskan", "Muskan", "Muskan", "Devastram", "MC", "social_media", "muskan", "No", "No", "Yes"],
    ["sanjeevani", "Sanjeevani", "Sanjeevani", "PR Manager", "SJ", "pr", "sanjeevani", "No", "No", "Yes"],
    ["pari", "Pari", "Pari", "HR", "PA", "hr", "pari", "No", "Yes", "Yes"],
    ["charu", "Charu", "Charu", "Social Media Exec & Design", "CN", "social_media", "charu", "No", "No", "Yes"],
    ["naman", "Naman", "Naman", "Video Editor", "NJ", "video_editor", "naman", "No", "No", "Yes"],
    ["jagdish", "Jagdish", "Jagdish", "Team Member", "JS", "social_media", "jagdish", "No", "No", "Yes"]
  ];
  seed.forEach(row => sheet.appendRow(row));
}

// RUN THIS NOW to fix a "no one can access their dashboard" issue if it ever recurs.
// Only ADDS BACK any of the original 14 team members whose row is missing/corrupted.
// Never touches or deletes rows that are already present and valid.
function repairTeamConfig() {
  const sheet = getTeamConfigSheet_();
  const data = sheet.getDataRange().getValues();

  const validIds = new Set();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) validIds.add(data[i][0]);
  }

  const seed = [
    ["pcwtc45", "PC", "PC", "CEO", "PC", "ceo", "pcwtc45", "Yes", "No", "Yes"],
    ["shivendrawtc77", "Shivendra Singh", "Shivendra Singh", "Sr. Social Media Manager", "SS", "manager", "shivendrawtc77", "Yes", "No", "Yes"],
    ["deeksha", "Deeksha", "Deeksha", "Content Writer", "DJ", "social_media", "deeksha", "No", "No", "Yes"],
    ["nidhi", "Nidhi", "Nidhi", "Poorvaj", "NV", "social_media", "nidhi", "No", "No", "Yes"],
    ["muskan", "Muskan", "Muskan", "Devastram", "MC", "social_media", "muskan", "No", "No", "Yes"],
    ["sanjeevani", "Sanjeevani", "Sanjeevani", "PR Manager", "SJ", "pr", "sanjeevani", "No", "No", "Yes"],
    ["pari", "Pari", "Pari", "HR", "PA", "hr", "pari", "No", "Yes", "Yes"],
    ["charu", "Charu", "Charu", "Social Media Exec & Design", "CN", "social_media", "charu", "No", "No", "Yes"],
    ["naman", "Naman", "Naman", "Video Editor", "NJ", "video_editor", "naman", "No", "No", "Yes"],
    ["jagdish", "Jagdish", "Jagdish", "Team Member", "JS", "social_media", "jagdish", "No", "No", "Yes"]
  ];

  let restored = 0;
  seed.forEach(row => {
    if (!validIds.has(row[0])) { sheet.appendRow(row); restored++; }
  });
  Logger.log("Repair complete. Rows restored: " + restored);
}

// People who have left the organization. getTeam() skips these automatically, so they
// disappear from every dashboard, assignee picker and call list the moment this code is
// deployed — no manual step needed. removeDepartedMembers() can still be run once to
// physically delete their TeamConfig rows too (optional cleanup, not required).
const DEPARTED_MEMBER_IDS_ = ["saraswati", "khushi", "karan", "samanta"];

// The core team lives only in the app's built-in list (DEFAULT_TEAM in App.jsx), not in
// the TeamConfig sheet — the app merges them in on screen. The server-side attendance
// checker needs the same full list, so it uses this instead of the sheet alone.
const DEFAULT_TEAM_ = [
  { id: "pcwtc45", name: "PC", isAdmin: true },
  { id: "shivendrawtc77", name: "Shivendra Singh", isAdmin: true },
  { id: "deeksha", name: "Deeksha" }, { id: "nidhi", name: "Nidhi" }, { id: "muskan", name: "Muskan" },
  { id: "sanjeevani", name: "Sanjeevani" }, { id: "pari", name: "Pari", isHR: true }, { id: "charu", name: "Charu" },
  { id: "naman", name: "Naman" }, { id: "jagdish", name: "Jagdish" }
];
function allTeam_() {
  const live = JSON.parse(getTeam().getContent()).team || [];
  const have = {};
  live.forEach(m => { have[String(m.id)] = true; });
  DEFAULT_TEAM_.forEach(d => {
    if (!have[d.id] && DEPARTED_MEMBER_IDS_.indexOf(d.id) === -1) live.push({ id: d.id, name: d.name, isAdmin: !!d.isAdmin, isHR: !!d.isHR, active: true });
  });
  return live;
}

function getTeam() {
  const sheet = getTeamConfigSheet_();
  const data = sheet.getDataRange().getValues();
  const teamMap = {};
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] || !data[i][1]) continue;
    if (DEPARTED_MEMBER_IDS_.indexOf(String(data[i][0]).toLowerCase()) !== -1) continue;
    teamMap[data[i][0]] = {
      id: data[i][0],
      name: data[i][1],
      displayName: data[i][2] || data[i][1],
      role: data[i][3],
      avatar: data[i][4],
      quoteType: data[i][5] || "social_media",
      urlSlug: data[i][6] || data[i][0],
      isAdmin: data[i][7] === "Yes",
      isHR: data[i][8] === "Yes",
      active: data[i][9] !== "No"
    };
  }
  return jsonResponse({status: "ok", team: Object.values(teamMap)});
}

function addTeamMember(member) {
  const sheet = getTeamConfigSheet_();
  const data = sheet.getDataRange().getValues();

  let baseSlug = slugify_(member.name);
  let slug = baseSlug;
  let n = 1;
  const existingSlugs = new Set(data.slice(1).map(r => r[6]));
  while (existingSlugs.has(slug)) { slug = baseSlug + n; n++; }

  sheet.appendRow([
    slug, member.name, member.displayName || member.name, member.role || "",
    member.avatar || member.name.substring(0, 2).toUpperCase(),
    member.quoteType || "social_media", slug,
    member.isAdmin ? "Yes" : "No", member.isHR ? "Yes" : "No", "Yes"
  ]);
  return jsonResponse({status: "ok", id: slug, urlSlug: slug});
}

function updateTeamMember(id, updates) {
  const sheet = getTeamConfigSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      if (updates.displayName !== undefined) sheet.getRange(i + 1, 3).setValue(updates.displayName);
      if (updates.role !== undefined) sheet.getRange(i + 1, 4).setValue(updates.role);
      if (updates.avatar !== undefined) sheet.getRange(i + 1, 5).setValue(updates.avatar);
      if (updates.quoteType !== undefined) sheet.getRange(i + 1, 6).setValue(updates.quoteType);
      if (updates.isAdmin !== undefined) sheet.getRange(i + 1, 8).setValue(updates.isAdmin ? "Yes" : "No");
      if (updates.isHR !== undefined) sheet.getRange(i + 1, 9).setValue(updates.isHR ? "Yes" : "No");
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Team member not found"});
}

function setTeamActive(id, active) {
  const sheet = getTeamConfigSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 10).setValue(active ? "Yes" : "No");
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Team member not found"});
}

// PERMANENT delete — removes the row entirely from TeamConfig (unlike setTeamActive,
// which just flips Active to No). Use only when someone has actually left the company.
// PC/Shivendra only (enforced on the frontend + can be double-checked here via userName).
function deleteTeamMember(id) {
  const sheet = getTeamConfigSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Team member not found"});
}

// OPTIONAL CLEANUP — getTeam() already hides everyone in DEPARTED_MEMBER_IDS_, so this
// is not required. Running it once from the Apps Script editor just physically deletes
// their TeamConfig rows too. Safe to run more than once. Their historical Tasks/
// Attendance/Content rows are left untouched, so past records still show their name.
function removeDepartedMembers() {
  const sheet = getTeamConfigSheet_();
  const data = sheet.getDataRange().getValues();
  const toRemove = new Set(DEPARTED_MEMBER_IDS_);
  let removed = [];
  for (let i = data.length - 1; i >= 1; i--) {
    if (toRemove.has(String(data[i][0]).toLowerCase())) {
      removed.push(data[i][1]);
      sheet.deleteRow(i + 1);
    }
  }
  Logger.log("Removed: " + removed.join(", "));
}

// ============================================================
// HOLIDAY CALENDAR — feeds directly into the points engine below: Sundays AND these
// dates are fully excluded from scoring (no score row at all, so a company-wide off day
// never drags anyone's average down).
// FIX — moved from a hardcoded array to a real "Holidays" sheet so PC/Shivendra/Pari can
// add or remove holidays from the app itself, no code changes needed. The old hardcoded
// list seeds the sheet automatically the first time it's created, so nothing is lost.
// ============================================================
const DEFAULT_HOLIDAYS_ = [
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-04", name: "Holi" },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-08-28", name: "Raksha Bandhan" },
  { date: "2026-09-14", name: "Ganesh Chaturthi" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-11-07", name: "Diwali (Choti Diwali)" },
  { date: "2026-11-09", name: "Diwali (Govardhan Puja)" },
  { date: "2026-11-10", name: "Diwali (Bhai Dooj)" }
];

function getHolidaysSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Holidays");
  if (!sheet) {
    sheet = ss.insertSheet("Holidays");
    sheet.appendRow(["ID", "Date", "Name"]);
    sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
    DEFAULT_HOLIDAYS_.forEach((h, idx) => sheet.appendRow([idx + 1, h.date, h.name]));
  }
  return sheet;
}

// Memoized once per script execution — isScorableDay_ can be called in a loop over many
// days, and this avoids re-reading the sheet on every single call.
let _holidayDateSetCache = null;

function getHolidays() {
  const sheet = getHolidaysSheet_();
  const data = sheet.getDataRange().getValues();
  const holidays = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    holidays.push({ id: data[i][0], date: formatDateSafe_(data[i][1]), name: data[i][2] });
  }
  holidays.sort((a, b) => a.date.localeCompare(b.date));
  return jsonResponse({status: "ok", holidays: holidays});
}

function addHoliday(date, name) {
  const sheet = getHolidaysSheet_();
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && parseInt(data[i][0]) > maxId) maxId = parseInt(data[i][0]);
  }
  sheet.appendRow([maxId + 1, date, name || ""]);
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, 2).setNumberFormat('@');
  sheet.getRange(newRow, 2).setValue(date);
  _holidayDateSetCache = null;
  return jsonResponse({status: "ok"});
}

function deleteHoliday(id) {
  const sheet = getHolidaysSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      _holidayDateSetCache = null;
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Holiday not found"});
}

function getHolidayDateSet_() {
  if (_holidayDateSetCache) return _holidayDateSetCache;
  const sheet = getHolidaysSheet_();
  const data = sheet.getDataRange().getValues();
  const set = new Set();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) set.add(formatDateSafe_(data[i][1]));
  }
  _holidayDateSetCache = set;
  return set;
}

function isScorableDay_(dateKey) {
  // dateKey is "yyyy-MM-dd". Excludes Sundays and declared holidays.
  const d = new Date(dateKey + "T12:00:00"); // noon avoids timezone edge cases
  if (d.getDay() === 0) return false; // Sunday
  if (getHolidayDateSet_().has(dateKey)) return false;
  return true;
}

// ============================================================
// NOTICE BOARD — PC & Shivendra post, everyone reads (enforced on frontend)
// ============================================================
function getNoticesSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Notices");
  if (!sheet) {
    sheet = ss.insertSheet("Notices");
    sheet.appendRow(["ID", "Title", "Message", "Posted By", "Timestamp", "Pinned"]);
  }
  return sheet;
}

function getNotices() {
  const sheet = getNoticesSheet_();
  const data = sheet.getDataRange().getValues();
  const notices = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    notices.push({
      id: data[i][0], title: data[i][1], message: data[i][2],
      postedBy: data[i][3], timestamp: data[i][4], pinned: data[i][5] === "Yes"
    });
  }
  // pinned first, then newest first
  notices.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  return jsonResponse({status: "ok", notices: notices});
}

function addNotice(title, message, postedBy, pinned) {
  const sheet = getNoticesSheet_();
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && parseInt(data[i][0]) > maxId) maxId = parseInt(data[i][0]);
  }
  sheet.appendRow([maxId + 1, title, message, postedBy, getIndiaTimeISO(), pinned ? "Yes" : "No"]);
  return jsonResponse({status: "ok"});
}

function deleteNotice(noticeId) {
  const sheet = getNoticesSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == noticeId) {
      sheet.deleteRow(i + 1);
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Notice not found"});
}

// ============================================================
// POINTS / LEADERBOARD — removed completely (v13). The old "Points" sheet is left in the
// spreadsheet untouched as history. Run setupWtcTriggers() once: it also deletes the old
// nightly calculateDailyPoints trigger if it is still installed.
// ============================================================

// ============================================================
// CONTENT CALENDAR — everyone reads/writes. Each entry, when created, automatically
// creates a matching Task on the normal task board (same assignee, due date, priority),
// so content work shows up in the regular task list too — not a separate silo.
// FIX — status is now split into two independent tracks (matches the Notion reference):
// "Editing Status" (Not Started/To Edit/In Review/Approved) tracks internal progress,
// "Video Status" (Not Started/Scheduled in YT Studio/Published) tracks the public state.
// The linked task auto-completes when Video Status reaches "Published".
// ============================================================
const EDITING_STATUSES_ = ["Not Started", "To Edit", "In Review", "Approved"];
const VIDEO_STATUSES_ = ["Not Started", "Scheduled in YT Studio", "Published"];

function getContentSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("ContentCalendar");
  if (!sheet) {
    sheet = ss.insertSheet("ContentCalendar");
    sheet.appendRow([
      "ID", "Channel Group", "Channels", "Content Type", "Title", "Date",
      "Assigned To", "Video Status", "Priority", "Final Editing Link", "Thumbnail Link",
      "Description", "Notes/Script", "Linked Task ID", "Created By", "Created Date",
      "Editing Status", "Raw Link", "Draft/Editing Link", "Time", "Design Link"
    ]);
    sheet.getRange(2, 6, sheet.getMaxRows() - 1, 1).setNumberFormat('@'); // Date col
    sheet.getRange(2, 20, sheet.getMaxRows() - 1, 1).setNumberFormat('@'); // Time col
  } else if (sheet.getLastColumn() < 19) {
    // FIX — appends the 3 new columns to an already-existing sheet without disturbing
    // any data already in the first 16 columns.
    sheet.getRange(1, 17, 1, 3).setValues([["Editing Status", "Raw Link", "Draft/Editing Link"]]);
  }
  // FIX — Content Calendar redesign: added a Time field (alongside Date) and a Design
  // Link field, and "Final Link" is now understood as the Final EDITING link (the fully
  // cut file to hand off), not a public "published" URL — Video Status already tracks
  // whether it's live, so a separate published-link field was redundant.
  if (sheet.getLastColumn() < 21) {
    sheet.getRange(1, 20, 1, 2).setValues([["Time", "Design Link"]]);
    sheet.getRange(2, 20, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
  }
  // FIX — "can't find the Drive links in the sheet": the link columns are spread across
  // J, K, R, S and U and some still had old/blank headers. Give every link column a clear
  // 🔗 header so they're easy to spot. Only writes when a header is actually different.
  const LINK_HEADERS = { 10: "🔗 Final Editing Link", 11: "🔗 Thumbnail Link", 18: "🔗 Raw Footage Link", 19: "🔗 Draft/Editing Link", 21: "🔗 Design Link" };
  const header = sheet.getRange(1, 1, 1, 21).getValues()[0];
  Object.keys(LINK_HEADERS).forEach(col => {
    if (header[col - 1] !== LINK_HEADERS[col]) sheet.getRange(1, Number(col)).setValue(LINK_HEADERS[col]);
  });
  return sheet;
}

// FIX — the "26 shows on 25" bug. Google Sheets auto-converts a date-only string into a
// real Date cell, stored internally at midnight IST. When that Date object gets sent back
// to the browser as JSON, Apps Script serializes it via toISOString(), which is always UTC
// — and midnight IST is 6:30pm the PREVIOUS day in UTC. The frontend was reading that raw
// UTC string directly, so every date silently shifted back a day. This formats it back to
// a clean "yyyy-MM-dd" string in the SAME timezone it was created in, so it always matches
// what was actually typed in, no matter how Sheets stored it internally.
function formatDateSafe_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, "Asia/Kolkata", "yyyy-MM-dd");
  }
  return String(value).slice(0, 10);
}

// Same Date-object-vs-plain-string bug as formatDateSafe_, but for the Time column —
// Sheets can auto-convert a bare "HH:mm" string into its own time-only Date.
function formatTimeSafe_(value) {
  if (!value) return "";
  if (value instanceof Date) return Utilities.formatDate(value, "Asia/Kolkata", "HH:mm");
  return String(value);
}

// ============================================================
// FIX — CONTENT CALENDAR SPEED. Every read used to open the spreadsheet and rebuild the
// whole list; on a busy backend that took several seconds or failed (some people saw an
// empty calendar). Reads now come from CacheService (in-memory, fast), and every add/
// edit/delete refreshes that cache immediately, so the next read anyone does is both fast
// AND already up to date. A short 5-minute expiry also picks up edits made directly in
// the Google Sheet. The list is stored in versioned chunks (each cache slot holds at most
// 100KB), and readers only ever see one complete version, never a half-written mix.
// ============================================================
const CC_CACHE_PREFIX_ = "cc3_";
const CC_CACHE_SECS_ = 300;
const CC_CHUNK_CHARS_ = 30000; // ≤ 90KB even if every character is 3-byte (Hindi/emoji)

function buildContentEntries_() {
  const sheet = getContentSheet_();
  const data = sheet.getDataRange().getValues();
  const entries = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    entries.push({
      id: data[i][0],
      channelGroup: data[i][1],
      channels: data[i][2],
      contentType: data[i][3],
      title: data[i][4],
      date: formatDateSafe_(data[i][5]),
      assignedTo: data[i][6],
      videoStatus: data[i][7] || "Not Started",
      priority: data[i][8],
      finalLink: data[i][9],
      thumbnailLink: data[i][10],
      description: data[i][11],
      notes: data[i][12],
      linkedTaskId: data[i][13],
      createdBy: data[i][14],
      createdDate: data[i][15] instanceof Date ? formatDateSafe_(data[i][15]) : data[i][15],
      editingStatus: data[i][16] || "Not Started",
      rawLink: data[i][17] || "",
      draftLink: data[i][18] || "",
      time: formatTimeSafe_(data[i][19]),
      designLink: data[i][20] || ""
    });
  }
  return entries;
}

function ccCachePut_(json) {
  try {
    const cache = CacheService.getScriptCache();
    const version = String(Date.now()) + Math.floor(Math.random() * 1000);
    const n = Math.max(1, Math.ceil(json.length / CC_CHUNK_CHARS_));
    const parts = {};
    for (let k = 0; k < n; k++) {
      parts[CC_CACHE_PREFIX_ + version + "_" + k] = json.substring(k * CC_CHUNK_CHARS_, (k + 1) * CC_CHUNK_CHARS_);
    }
    cache.putAll(parts, CC_CACHE_SECS_ + 60);
    // Pointer written LAST, so a reader can never pick up a half-written version.
    cache.put(CC_CACHE_PREFIX_ + "ptr", version + "|" + n, CC_CACHE_SECS_);
  } catch (e) { Logger.log("content cache put failed: " + e); }
}

function ccCacheGet_() {
  try {
    const cache = CacheService.getScriptCache();
    const ptr = cache.get(CC_CACHE_PREFIX_ + "ptr");
    if (!ptr) return null;
    const bits = ptr.split("|");
    const version = bits[0], n = parseInt(bits[1], 10);
    if (!version || !n) return null;
    const keys = [];
    for (let k = 0; k < n; k++) keys.push(CC_CACHE_PREFIX_ + version + "_" + k);
    const got = cache.getAll(keys);
    let json = "";
    for (let k = 0; k < n; k++) {
      const part = got[keys[k]];
      if (part === undefined || part === null) return null;
      json += part;
    }
    return json;
  } catch (e) { return null; }
}

function refreshContentCache_() {
  try { ccCachePut_(JSON.stringify(buildContentEntries_())); } catch (e) { Logger.log("content cache refresh failed: " + e); }
}

function contentJsonResponse_(entriesJson) {
  return ContentService.createTextOutput('{"status":"ok","entries":' + entriesJson + '}')
    .setMimeType(ContentService.MimeType.JSON);
}

function getContentCalendar() {
  const cached = ccCacheGet_();
  if (cached) return contentJsonResponse_(cached);
  const json = JSON.stringify(buildContentEntries_());
  ccCachePut_(json);
  return contentJsonResponse_(json);
}

function addContentEntry(entry) {
  const sheet = getContentSheet_();
  const lastRow = sheet.getLastRow();
  let maxId = 0;
  if (lastRow >= 2) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      const num = parseInt(String(ids[i][0]).replace('c', ''), 10);
      if (!isNaN(num) && num > maxId) maxId = num;
    }
  }
  const newId = "c" + (maxId + 1);
  const todayStr = getIndiaDate();

  // FIX — write the calendar row FIRST and refresh the cache right away, so the new entry
  // is visible to everyone within one poll. The linked task (the slowest part — it also
  // notifies/pushes the assignees) is created afterwards and its ID filled in last.
  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 6).setNumberFormat('@');
  sheet.getRange(newRow, 20).setNumberFormat('@');
  sheet.getRange(newRow, 1, 1, 21).setValues([[
    newId, entry.channelGroup, entry.channels, entry.contentType, entry.title, entry.date,
    entry.assignedTo, entry.videoStatus || "Not Started", entry.priority || "Medium",
    entry.finalLink || "", entry.thumbnailLink || "", entry.description || "", entry.notes || "",
    "", entry.createdBy, todayStr,
    entry.editingStatus || "Not Started", entry.rawLink || "", entry.draftLink || "",
    entry.time || "", entry.designLink || ""
  ]]);
  refreshContentCache_();

  // FIX — task integration: this entry automatically creates a real Task, so it shows up
  // on the normal task board for whoever it's assigned to, exactly like any other task.
  let linkedTaskId = "";
  if (entry.assignedTo && entry.date) {
    try {
      const taskResult = JSON.parse(addTask({
        assignedTo: entry.assignedTo,
        taskDetails: `[${entry.contentType}] ${entry.title}`,
        remarks: entry.description || "",
        priority: entry.priority || "Medium",
        targetDate: entry.date,
        channel: entry.channels || "Other",
        assignedBy: entry.createdBy,
        status: "Not Started",
        taskType: "General",
        category: "Social Media"
      }).getContent());
      if (taskResult.status === "ok") linkedTaskId = taskResult.id;
    } catch (e) { Logger.log("linked task creation failed: " + e); }
  }
  if (linkedTaskId) {
    sheet.getRange(newRow, 14).setValue(linkedTaskId);
    refreshContentCache_();
    // Already published when it was added → the linked task is done too.
    if (entry.videoStatus === "Published") {
      try { updateStatus(linkedTaskId, "Completed", entry.createdBy || "Shivendra Singh"); } catch (e) {}
    }
  }

  return jsonResponse({status: "ok", id: newId, linkedTaskId: linkedTaskId});
}

// FIX — was up to ~16 separate single-cell writes per save (each one a slow round-trip),
// which is why an edit could take seconds to "land". Now: read the row once, apply every
// change in memory, write the whole row back in ONE call, then refresh the cache.
const CONTENT_FIELD_COLS_ = {
  channels: 3, contentType: 4, title: 5, date: 6, assignedTo: 7, videoStatus: 8,
  priority: 9, finalLink: 10, thumbnailLink: 11, description: 12, notes: 13,
  editingStatus: 17, rawLink: 18, draftLink: 19, time: 20, designLink: 21
};

function updateContentEntry(id, updates, userName) {
  const sheet = getContentSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return jsonResponse({status: "error", message: "Content entry not found"});
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let rowNum = -1;
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) { rowNum = i + 2; break; }
  }
  if (rowNum === -1) return jsonResponse({status: "error", message: "Content entry not found"});

  const range = sheet.getRange(rowNum, 1, 1, 21);
  const row = range.getValues()[0];
  const linkedTaskId = row[13];
  const wasPublished = row[7] === "Published";
  const before = { title: row[4], date: formatDateSafe_(row[5]), assignedTo: row[6], priority: row[8], channels: row[2], contentType: row[3] };
  Object.keys(CONTENT_FIELD_COLS_).forEach(field => {
    if (updates[field] !== undefined) row[CONTENT_FIELD_COLS_[field] - 1] = updates[field];
  });
  if (row[5] instanceof Date) row[5] = formatDateSafe_(row[5]);
  if (row[19] instanceof Date) row[19] = formatTimeSafe_(row[19]);
  sheet.getRange(rowNum, 6).setNumberFormat('@');
  sheet.getRange(rowNum, 20).setNumberFormat('@');
  range.setValues([row]);
  refreshContentCache_();

  if (linkedTaskId) {
    // Keep the linked task card in step with the calendar (title, date, people, priority).
    try {
      const sync = {};
      if (row[4] !== before.title || row[3] !== before.contentType) sync.taskDetails = "[" + row[3] + "] " + row[4];
      if (String(row[5]) !== before.date) sync.targetDate = String(row[5]);
      if (row[6] !== before.assignedTo && row[6]) sync.assignedTo = row[6];
      if (row[8] !== before.priority && row[8]) sync.priority = row[8];
      if (row[2] !== before.channels && row[2]) sync.channel = row[2];
      if (Object.keys(sync).length) updateTask(linkedTaskId, sync, "Shivendra Singh");
    } catch (e) { Logger.log("linked task sync failed: " + e); }
    // Status sync: becoming "Published" completes the linked task (only on the change,
    // so re-saving a published entry never re-sends "completed" notifications).
    if (row[7] === "Published" && !wasPublished) {
      try { updateStatus(linkedTaskId, "Completed", userName || "Shivendra Singh"); } catch (e) {}
    }
  }
  return jsonResponse({status: "ok", linkedTaskId: linkedTaskId || ""});
}

function deleteContentEntry(id) {
  const sheet = getContentSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return jsonResponse({status: "error", message: "Content entry not found"});
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      // Deliberately does NOT delete the linked task — avoids a destructive cascade.
      // The task stays on the board even if the calendar entry is removed.
      sheet.deleteRow(i + 2);
      refreshContentCache_();
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Content entry not found"});
}

// ============================================================
// CONTENT CALENDAR — CHANNEL CONFIG. Was hardcoded in the frontend; now a real sheet so
// PC/Shivendra/Pari can add or remove a channel group, or a channel within a group,
// straight from the app — no code deploy needed. Seeded once from the previous hardcoded
// list so nothing changes for existing users until they actually edit it.
// ============================================================
const DEFAULT_CONTENT_CHANNELS_ = [
  { group: "Akshat Gupta", channel: "AG Insta" },
  { group: "Akshat Gupta", channel: "AG YT" },
  { group: "Akshat Gupta", channel: "AG.books Insta" },
  { group: "Akshat Gupta", channel: "Spotify" },
  { group: "Akshat Gupta", channel: "LinkedIn" },
  { group: "Akshat Gupta", channel: "Twitter" },
  { group: "The Fact-Tree", channel: "The Fact-Tree YT" },
  { group: "The Fact-Tree", channel: "The Fact-Tree Insta" },
  { group: "The 7C's", channel: "The 7c's YT" },
  { group: "The 7C's", channel: "The 7c's Insta" },
  { group: "MFG", channel: "MFG Insta" },
  { group: "Devastram", channel: "Devastram Insta" },
  { group: "WTC Other", channel: "Other" }
];

function getContentChannelsSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("ContentChannels");
  if (!sheet) {
    sheet = ss.insertSheet("ContentChannels");
    sheet.appendRow(["ID", "Channel Group", "Channel Name", "Sort Order"]);
    DEFAULT_CONTENT_CHANNELS_.forEach((c, idx) => sheet.appendRow([idx + 1, c.group, c.channel, idx]));
  }
  return sheet;
}

function getContentChannels() {
  const sheet = getContentChannelsSheet_();
  const data = sheet.getDataRange().getValues();
  const groups = {}; // { groupName: [channelName, ...] } — insertion order preserved
  const order = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] || !data[i][1]) continue;
    const g = data[i][1], c = data[i][2];
    if (!groups[g]) { groups[g] = []; order.push(g); }
    if (c) groups[g].push(c);
  }
  return jsonResponse({status: "ok", groups: groups, groupOrder: order});
}

function addContentChannel(groupName, channelName) {
  const sheet = getContentChannelsSheet_();
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && parseInt(data[i][0]) > maxId) maxId = parseInt(data[i][0]);
  }
  sheet.appendRow([maxId + 1, groupName, channelName || "", data.length]);
  return jsonResponse({status: "ok"});
}

function deleteContentChannel(groupName, channelName) {
  const sheet = getContentChannelsSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === groupName && data[i][2] === channelName) {
      sheet.deleteRow(i + 1);
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Channel not found"});
}

function sendDailyReminders() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  const tasksByUser = {};
  const allPending = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][6] !== "Completed" && data[i][13] !== "Yes") {
      const assignees = String(data[i][1]).split(',').map(a => a.trim());
      const taskInfo = {
        id: data[i][0], title: data[i][2],
        priority: data[i][4], targetDate: data[i][5],
        status: data[i][6], assignedBy: data[i][10]
      };
      assignees.forEach(assignee => {
        if (!tasksByUser[assignee]) tasksByUser[assignee] = [];
        tasksByUser[assignee].push(taskInfo);
        allPending.push({...taskInfo, assignedTo: assignee});
      });
    }
  }

  const teamRes = JSON.parse(getTeam().getContent());
  const urlMap = {};
  if (teamRes.status === 'ok') teamRes.team.forEach(m => { urlMap[m.name] = m.urlSlug; });

  Object.keys(tasksByUser).forEach(userName => {
    const userEmail = TEAM_EMAILS[userName];
    if (!userEmail) return;
    const tasks = tasksByUser[userName];
    const userURL = urlMap[userName] || "";
    try {
      MailApp.sendEmail({
        to: userEmail,
        subject: "Your Daily Tasks - " + tasks.length + " pending",
        htmlBody: createIndividualEmail(userName, tasks, userURL)
      });
    } catch (e) { Logger.log(e); }
  });

  const adminEmails = [TEAM_EMAILS["Shivendra Singh"], TEAM_EMAILS["Praveen Chilhate"]];
  const summaryBody = createAdminSummary(tasksByUser, allPending);
  adminEmails.forEach(email => {
    if (email) {
      try {
        MailApp.sendEmail({
          to: email,
          subject: "Team Summary - " + allPending.length + " pending tasks",
          htmlBody: summaryBody
        });
      } catch (e) { Logger.log(e); }
    }
  });
}

function createIndividualEmail(userName, tasks, userURL) {
  const today = new Date().toLocaleDateString('en-IN', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
  const dashboardURL = userURL ? "https://wtc-task-hub.vercel.app/?user=" + userURL : "https://wtc-task-hub.vercel.app";
  let html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa; padding: 20px;">';
  html += '<div style="background: linear-gradient(135deg, #1a3a5c 0%, #2c5aa0 100%); color: white; padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">';
  html += '<h1 style="margin: 0; font-size: 24px;">Good Morning, ' + userName + '!</h1>';
  html += '<p style="margin: 10px 0 0; opacity: 0.9;">' + today + '</p></div>';
  html += '<div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">';
  html += '<p style="font-size: 16px; color: #1a3a5c;">You have <strong>' + tasks.length + ' pending task(s)</strong>:</p>';
  html += '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
  html += '<tr style="background: #f5f7fa;"><th style="padding: 12px; text-align: left; border-bottom: 2px solid #c9a961;">Task</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #c9a961;">Priority</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #c9a961;">Due</th></tr>';
  tasks.forEach(task => {
    const color = task.priority === "High" ? "#dc2626" : task.priority === "Medium" ? "#d97706" : "#059669";
    const dueDate = task.targetDate ? new Date(task.targetDate).toLocaleDateString() : "-";
    html += '<tr style="border-bottom: 1px solid #e0e0e0;">';
    html += '<td style="padding: 12px;"><strong>' + task.title + '</strong><br><small style="color: #666;">By: ' + task.assignedBy + '</small></td>';
    html += '<td style="padding: 12px;"><span style="background: ' + color + '20; color: ' + color + '; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">' + task.priority + '</span></td>';
    html += '<td style="padding: 12px;">' + dueDate + '</td></tr>';
  });
  html += '</table><div style="margin-top: 30px; text-align: center;">';
  html += '<a href="' + dashboardURL + '" style="background: linear-gradient(135deg, #1a3a5c 0%, #2c5aa0 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open My Dashboard</a></div>';
  html += '<p style="margin-top: 30px; color: #666; font-size: 13px; text-align: center;">Have a productive day!<br><strong>WTC Management Hub</strong></p></div></div>';
  return html;
}

function createAdminSummary(tasksByUser, allPending) {
  const today = new Date().toLocaleDateString('en-IN', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
  const highPriority = allPending.filter(t => t.priority === "High").length;
  const totalUsers = Object.keys(tasksByUser).length;
  let html = '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f5f7fa; padding: 20px;">';
  html += '<div style="background: linear-gradient(135deg, #1a3a5c 0%, #c9a961 100%); color: white; padding: 30px 20px; border-radius: 12px 12px 0 0;">';
  html += '<h1 style="margin: 0; font-size: 26px;">Team Daily Summary</h1>';
  html += '<p style="margin: 10px 0 0; opacity: 0.9;">' + today + '</p></div>';
  html += '<div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">';
  html += '<div style="display: flex; gap: 15px; margin-bottom: 30px;">';
  html += '<div style="flex: 1; background: linear-gradient(135deg, #1a3a5c 0%, #2c5aa0 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;"><div style="font-size: 32px; font-weight: 700;">' + allPending.length + '</div><div style="font-size: 12px; opacity: 0.9;">Total Pending</div></div>';
  html += '<div style="flex: 1; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;"><div style="font-size: 32px; font-weight: 700;">' + highPriority + '</div><div style="font-size: 12px; opacity: 0.9;">High Priority</div></div>';
  html += '<div style="flex: 1; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;"><div style="font-size: 32px; font-weight: 700;">' + totalUsers + '</div><div style="font-size: 12px; opacity: 0.9;">Active Users</div></div></div>';
  html += '<h2 style="color: #1a3a5c; border-bottom: 2px solid #c9a961; padding-bottom: 8px;">Tasks by Team Member</h2>';
  html += '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
  html += '<tr style="background: #f5f7fa;"><th style="padding: 12px; text-align: left;">Team Member</th><th style="padding: 12px; text-align: center;">Pending</th><th style="padding: 12px; text-align: center;">High Priority</th></tr>';
  Object.keys(tasksByUser).forEach(userName => {
    const tasks = tasksByUser[userName];
    const high = tasks.filter(t => t.priority === "High").length;
    html += '<tr style="border-bottom: 1px solid #e0e0e0;">';
    html += '<td style="padding: 12px;"><strong>' + userName + '</strong></td>';
    html += '<td style="padding: 12px; text-align: center; font-weight: 600; color: #1a3a5c;">' + tasks.length + '</td>';
    html += '<td style="padding: 12px; text-align: center;">' + (high > 0 ? '<span style="background: #dc262620; color: #dc2626; padding: 4px 10px; border-radius: 4px; font-weight: 600;">' + high + '</span>' : '0') + '</td></tr>';
  });
  html += '</table><div style="margin-top: 30px; text-align: center;">';
  html += '<a href="https://wtc-task-hub.vercel.app/?user=shivendrawtc77" style="background: linear-gradient(135deg, #1a3a5c 0%, #c9a961 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Manager Dashboard</a></div>';
  html += '<p style="margin-top: 30px; color: #666; font-size: 13px; text-align: center;"><strong>WTC Management Hub</strong></p></div></div>';
  return html;
}

// ============================================================
// TEAM MEET — anyone can schedule a meeting (Routine/General/Team Meet/Other),
// assign any set of people, pick a date+time and state a purpose. Everyone assigned
// (and the creator) gets a 5-minute-before alarm on the frontend (see App.jsx).
// ============================================================
const MEETING_HEADERS = ["ID", "Title", "Purpose", "Type", "AssignedTo", "MeetingDate", "MeetingTime", "CreatedBy", "CreatedDate", "Frequency"];

function getMeetingsSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Meetings");
  if (!sheet) {
    sheet = ss.insertSheet("Meetings");
    sheet.appendRow(MEETING_HEADERS);
    // Force Date/Time columns to plain text so Sheets never auto-converts what we
    // write here into a real Date value (see formatMeetingDate_/formatMeetingTime_
    // above for what happens when it does).
    sheet.getRange(2, 6, sheet.getMaxRows() - 1, 2).setNumberFormat('@');
  }
  // Also add the Frequency column to a sheet created before this field existed.
  if (sheet.getLastColumn() < 10) {
    sheet.getRange(1, 10).setValue("Frequency");
  }
  return sheet;
}

// FIX — same root cause as the Content Calendar's "date shows one day earlier" bug:
// when a plain "yyyy-MM-dd" / "HH:mm" string is appended into a sheet cell, Google
// Sheets auto-detects it and silently converts it to a real Date value. Reading it back
// with getValues() then hands us a JS Date object, and the default JSON serialization
// calls .toISOString() on it in UTC — which is why the date showed as "Invalid Date"
// (a full UTC timestamp got glued onto "T12:00:00" on the frontend) and the time showed
// as the raw "1899-12-30T05:38:50.000Z" (Sheets' zero-date for a time-only value).
// These two helpers always hand back a clean, unambiguous string, whether the cell is
// still plain text (new rows, once EEEE) or already got auto-converted to a Date.
function formatMeetingDate_(value) {
  if (!value) return "";
  if (value instanceof Date) return Utilities.formatDate(value, "Asia/Kolkata", "yyyy-MM-dd");
  return String(value);
}
function formatMeetingTime_(value) {
  if (!value) return "";
  if (value instanceof Date) return Utilities.formatDate(value, "Asia/Kolkata", "HH:mm");
  return String(value);
}

function getMeetings() {
  const sheet = getMeetingsSheet_();
  const data = sheet.getDataRange().getValues();
  const meetings = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    meetings.push({
      id: data[i][0],
      title: data[i][1],
      purpose: data[i][2],
      type: data[i][3],
      frequency: data[i][9] || "",
      assignedTo: data[i][4],
      meetingDate: formatMeetingDate_(data[i][5]),
      meetingTime: formatMeetingTime_(data[i][6]),
      createdBy: data[i][7],
      createdDate: data[i][8]
    });
  }
  return jsonResponse({status: "ok", meetings: meetings});
}

function addMeeting(meeting) {
  const sheet = getMeetingsSheet_();
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && parseInt(data[i][0]) > maxId) maxId = parseInt(data[i][0]);
  }
  const newId = maxId + 1;
  sheet.appendRow([
    newId, meeting.title, meeting.purpose || "", meeting.type || "Other",
    meeting.assignedTo, meeting.meetingDate, meeting.meetingTime,
    meeting.createdBy, getIndiaTimeISO(), meeting.frequency || ""
  ]);
  // Belt-and-suspenders: force this row's Date/Time cells to plain text and rewrite the
  // exact strings, in case Sheets already auto-converted them the instant they landed.
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, 6, 1, 2).setNumberFormat('@');
  sheet.getRange(newRow, 6).setValue(meeting.meetingDate);
  sheet.getRange(newRow, 7).setValue(meeting.meetingTime);

  // Notify everyone assigned (not the creator — they already know, they just made it)
  const assignees = String(meeting.assignedTo).split(',').map(a => a.trim()).filter(a => a);
  assignees.forEach(assignee => {
    if (assignee === meeting.createdBy) return;
    addToInbox(assignee, {
      type: "new_meeting",
      taskId: "meeting_" + newId,
      from: meeting.createdBy,
      title: meeting.title + " — " + meeting.meetingDate + " " + meeting.meetingTime,
      priority: "Medium",
      timestamp: getIndiaTimeISO()
    });
  });

  return jsonResponse({status: "ok", id: newId});
}

function deleteMeeting(meetingId) {
  const sheet = getMeetingsSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == meetingId) {
      sheet.deleteRow(i + 1);
      return jsonResponse({status: "ok"});
    }
  }
  return jsonResponse({status: "error", message: "Meeting not found"});
}

// ============================================================
// v13 — ATTENDANCE DISCIPLINE
// Office rules (change the numbers here if the policy changes):
//   • Each person has a shift (Shift Start / Shift End) in the "ShiftConfig" sheet,
//     seeded automatically from their real sign-in history; PC/Shivendra/Pari can edit it
//     from Manage Team.
//   • Sign in more than 15 min after shift start            → LATE flag
//   • Lunch: only 1:00–2:00 PM, once a day, 30 minutes.
//       – lunch longer than 35 min                          → LONG_LUNCH flag
//       – no lunch marked by 2:00 PM                        → 30 min is deducted
//         automatically (1:00–1:30 recorded as lunch)        + LUNCH_NOT_MARKED flag
//   • Forgot to sign out → the day is closed at shift end at night
//                                                           + MISSED_SIGNOUT flag
//   • Fewer than 8 working hours on a working day           → SHORT_HOURS flag
//   • Every flag = 1 strike. Every 3 strikes in a month = half-day deduction.
//   • Anyone can ask for a correction on a flag (with a reason); HR/PC/Shivendra
//     approve ("Excused" — strike removed) or reject. Nobody approves their own.
// Nothing existing is edited or deleted: automatic entries are NEW rows in Attendance,
// marked "AUTO: …" in the Activity Log column, so they are always visible as automatic.
// ============================================================
const LUNCH_START_MIN_ = 13 * 60;
const LUNCH_END_MIN_ = 14 * 60;
const LUNCH_ALLOWED_MIN_ = 30;
const LUNCH_TOLERANCE_MIN_ = 5;
const LATE_GRACE_MIN_ = 15;
const MIN_WORK_HOURS_ = 8;
const STRIKES_PER_HALF_DAY_ = 3;
const ATT_MANAGER_IDS_ = ["pcwtc45", "shivendrawtc77", "pari"];
const APP_ADMIN_IDS_ = ["pcwtc45", "shivendrawtc77"];
const WORK_STATUSES_ = ["Working", "Meeting"];
const FLAG_LABELS_ = {
  LATE: "Late sign-in", LONG_LUNCH: "Lunch over 30 min", LUNCH_NOT_MARKED: "Lunch not marked",
  MISSED_SIGNOUT: "Forgot to sign out", SHORT_HOURS: "Short working hours"
};
const FLAG_HEADERS_ = ["ID", "Date", "User ID", "Name", "Type", "Detail", "Minutes", "Status",
  "Created", "Request Note", "Corrected Time", "Resolved By", "Resolved At"];

function attendanceRules_() {
  return {
    lunchStart: "13:00", lunchEnd: "14:00", lunchMinutes: LUNCH_ALLOWED_MIN_, lunchTolerance: LUNCH_TOLERANCE_MIN_,
    lateGrace: LATE_GRACE_MIN_, minWorkHours: MIN_WORK_HOURS_, strikesPerHalfDay: STRIKES_PER_HALF_DAY_
  };
}

function istMinutes_(d) {
  const s = Utilities.formatDate(d, "Asia/Kolkata", "HH:mm");
  return parseInt(s.slice(0, 2), 10) * 60 + parseInt(s.slice(3, 5), 10);
}
function istAt_(dateKey, hhmm) { return new Date(dateKey + "T" + hhmm + ":00+05:30"); }
function hhmmToMin_(s) {
  const m = String(s || "").match(/^(\d{1,2}):(\d{2})/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
}
function minToHhmm_(m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
function fmt12_(d) { return Utilities.formatDate(d, "Asia/Kolkata", "h:mm a"); }
function isWorkingDay_(dateKey) { return isScorableDay_(dateKey); }

function readRecentAttendance_(sheet, maxRows) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { start: 2, values: [] };
  const start = Math.max(2, lastRow - maxRows + 1);
  return { start: start, values: sheet.getRange(start, 1, lastRow - start + 1, 6).getValues() };
}

// { userId: { name, events: [{status, time, note}] sorted by time } } for one IST date.
// The date comes from the TIMESTAMP (column E), which is always exact.
function eventsByUserForDate_(values, dateKey) {
  const out = {};
  values.forEach(r => {
    if (!r[1]) return;
    const t = r[4] instanceof Date ? r[4] : new Date(r[4]);
    if (isNaN(t.getTime())) return;
    if (Utilities.formatDate(t, "Asia/Kolkata", "yyyy-MM-dd") !== dateKey) return;
    const uid = String(r[1]);
    if (!out[uid]) out[uid] = { name: r[2], events: [] };
    out[uid].events.push({ status: String(r[3]), time: t, note: String(r[5] || "").indexOf("AUTO") === 0 ? String(r[5]) : "" });
  });
  Object.keys(out).forEach(uid => out[uid].events.sort((a, b) => a.time - b.time));
  return out;
}

function statusAt_(events, time) {
  let s = null;
  for (let i = 0; i < events.length; i++) { if (events[i].time <= time) s = events[i].status; else break; }
  return s;
}

function workingMsOf_(events, until) {
  let ms = 0;
  for (let i = 0; i < events.length; i++) {
    const end = i + 1 < events.length ? events[i + 1].time : (until || null);
    if (!end) continue;
    const d = end - events[i].time;
    if (d > 0 && WORK_STATUSES_.indexOf(events[i].status) !== -1) ms += d;
  }
  return ms;
}

// ---------- Shift config ----------
function getShiftSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("ShiftConfig");
  if (!sheet) {
    sheet = ss.insertSheet("ShiftConfig");
    sheet.appendRow(["User ID", "Name", "Shift Start", "Shift End", "Updated By", "Updated At"]);
    sheet.getRange(2, 3, sheet.getMaxRows() - 1, 2).setNumberFormat('@');
  }
  return sheet;
}

// Makes sure every active non-admin team member has a shift row. Missing ones are
// inferred from the last 30 days: usually signs in before 9:40 → 9:00–6:00, else 10:00–7:00.
function ensureShiftConfig_() {
  const sheet = getShiftSheet_();
  const rows = sheet.getDataRange().getValues();
  const have = {};
  for (let i = 1; i < rows.length; i++) if (rows[i][0]) have[String(rows[i][0])] = true;
  const team = allTeam_();
  const missing = team.filter(m => m.active !== false && !m.isAdmin && !have[String(m.id)]);
  if (missing.length === 0) return;
  const recent = readRecentAttendance_(getAttendanceSheet_(), 4000).values;
  const firstByUserDay = {};
  const cutoff = Date.now() - 30 * 86400000;
  recent.forEach(r => {
    if (r[3] !== "Working") return;
    const t = r[4] instanceof Date ? r[4] : new Date(r[4]);
    if (isNaN(t.getTime()) || t.getTime() < cutoff) return;
    const key = r[1] + "|" + Utilities.formatDate(t, "Asia/Kolkata", "yyyy-MM-dd");
    const m = istMinutes_(t);
    if (firstByUserDay[key] === undefined || m < firstByUserDay[key]) firstByUserDay[key] = m;
  });
  const out = missing.map(m => {
    const mins = Object.keys(firstByUserDay).filter(k => k.indexOf(m.id + "|") === 0).map(k => firstByUserDay[k]).sort((a, b) => a - b);
    const median = mins.length ? mins[Math.floor(mins.length / 2)] : 10 * 60;
    const early = median <= 9 * 60 + 40;
    return [m.id, m.name, early ? "09:00" : "10:00", early ? "18:00" : "19:00", "auto (from sign-in history)", getIndiaTimeISO()];
  });
  const start = sheet.getLastRow() + 1;
  sheet.getRange(start, 3, out.length, 2).setNumberFormat('@');
  sheet.getRange(start, 1, out.length, 6).setValues(out);
  CacheService.getScriptCache().remove("shiftmap_v1");
}

function getShiftMap_() {
  const cache = CacheService.getScriptCache();
  const cached = readJsonCache_(cache, "shiftmap_v1", null);
  if (cached) return cached;
  try { ensureShiftConfig_(); } catch (e) { Logger.log("ensureShiftConfig_ failed: " + e); }
  const rows = getShiftSheet_().getDataRange().getValues();
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    const s = rows[i][2] instanceof Date ? Utilities.formatDate(rows[i][2], "Asia/Kolkata", "HH:mm") : String(rows[i][2] || "10:00");
    const e = rows[i][3] instanceof Date ? Utilities.formatDate(rows[i][3], "Asia/Kolkata", "HH:mm") : String(rows[i][3] || "19:00");
    map[String(rows[i][0])] = { start: s.slice(0, 5), end: e.slice(0, 5) };
  }
  cache.put("shiftmap_v1", JSON.stringify(map), 600);
  return map;
}

function saveShift(targetId, shiftStart, shiftEnd, userId) {
  if (ATT_MANAGER_IDS_.indexOf(userId) === -1) return jsonResponse({status: "error", message: "Not allowed"});
  if (hhmmToMin_(shiftStart) === null || hhmmToMin_(shiftEnd) === null) return jsonResponse({status: "error", message: "Bad time"});
  const sheet = getShiftSheet_();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(targetId)) {
      sheet.getRange(i + 1, 3, 1, 2).setNumberFormat('@');
      sheet.getRange(i + 1, 3, 1, 4).setValues([[shiftStart, shiftEnd, userId, getIndiaTimeISO()]]);
      CacheService.getScriptCache().remove("shiftmap_v1");
      return jsonResponse({status: "ok"});
    }
  }
  const team = allTeam_();
  const member = team.find(m => m.id === targetId);
  const r = sheet.getLastRow() + 1;
  sheet.getRange(r, 3, 1, 2).setNumberFormat('@');
  sheet.getRange(r, 1, 1, 6).setValues([[targetId, member ? member.name : targetId, shiftStart, shiftEnd, userId, getIndiaTimeISO()]]);
  CacheService.getScriptCache().remove("shiftmap_v1");
  return jsonResponse({status: "ok"});
}

// ---------- Flags ----------
function getFlagsSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("AttendanceFlags");
  if (!sheet) {
    sheet = ss.insertSheet("AttendanceFlags");
    sheet.appendRow(FLAG_HEADERS_);
    sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
  }
  return sheet;
}

function readFlags_() {
  const rows = getFlagsSheet_().getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    out.push({
      row: i + 1, id: rows[i][0], date: formatDateSafe_(rows[i][1]), userId: String(rows[i][2]), name: rows[i][3],
      type: rows[i][4], label: FLAG_LABELS_[rows[i][4]] || rows[i][4], detail: rows[i][5], minutes: Number(rows[i][6]) || 0,
      status: rows[i][7] || "Open", created: rows[i][8] instanceof Date ? rows[i][8].toISOString() : String(rows[i][8] || ""),
      note: rows[i][9] || "", correctedTime: rows[i][10] || "", resolvedBy: rows[i][11] || "",
      resolvedAt: rows[i][12] instanceof Date ? rows[i][12].toISOString() : String(rows[i][12] || "")
    });
  }
  return out;
}

// Idempotent: one flag per person per day per type.
function addFlag_(ctx, dateKey, userId, name, type, detail, minutes) {
  const key = dateKey + "|" + userId + "|" + type;
  if (ctx.flagKeys[key]) return false;
  ctx.flagKeys[key] = true;
  ctx.newFlags.push([ctx.nextFlagId++, dateKey, userId, name, type, detail, minutes || 0, "Open", getIndiaTimeISO(), "", "", "", ""]);
  return true;
}

// ---------- The watchdog (time trigger every 10 minutes, see setupWtcTriggers) ----------
function attendanceWatchdog() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    const now = new Date();
    const today = getIndiaDate();
    const nowMin = istMinutes_(now);
    const props = PropertiesService.getScriptProperties();
    const yesterday = dateKey_(addDays_(now, -1));

    const attSheet = getAttendanceSheet_();
    const recent = readRecentAttendance_(attSheet, 2500).values;
    const shifts = getShiftMap_();
    const team = (allTeam_()).filter(m => m.active !== false && !m.isAdmin);
    const flagSheet = getFlagsSheet_();
    const existing = readFlags_();
    const ctx = { flagKeys: {}, newFlags: [], newAttRows: [], pushes: [], nextFlagId: 1 };
    existing.forEach(f => { ctx.flagKeys[f.date + "|" + f.userId + "|" + f.type] = true; if (Number(f.id) >= ctx.nextFlagId) ctx.nextFlagId = Number(f.id) + 1; });

    // Rules apply from the day after setup (no surprise flags for the day it was installed).
    const startDate = props.getProperty("att_rules_start") || "";
    const active = (d) => !startDate || d >= startDate;
    // Close YESTERDAY if it never got closed (e.g. the late-night run did not happen).
    if (props.getProperty("att_closed_" + yesterday) !== "1") {
      if (isWorkingDay_(yesterday) && active(yesterday)) processDay_(ctx, yesterday, eventsByUserForDate_(recent, yesterday), team, shifts, true, 24 * 60);
      props.setProperty("att_closed_" + yesterday, "1");
    }
    if (isWorkingDay_(today) && active(today)) {
      const closing = nowMin >= 23 * 60 + 30;
      processDay_(ctx, today, eventsByUserForDate_(recent, today), team, shifts, closing, nowMin);
      if (closing) props.setProperty("att_closed_" + today, "1");
    }

    if (ctx.newAttRows.length) attSheet.getRange(attSheet.getLastRow() + 1, 1, ctx.newAttRows.length, 6).setValues(ctx.newAttRows);
    if (ctx.newFlags.length) {
      const r = flagSheet.getLastRow() + 1;
      flagSheet.getRange(r, 2, ctx.newFlags.length, 1).setNumberFormat('@');
      flagSheet.getRange(r, 1, ctx.newFlags.length, FLAG_HEADERS_.length).setValues(ctx.newFlags);
    }
    ctx.pushes.forEach(p => { try { sendPushToUser_(p.name, p.title, p.body, "/", p.tag, { kind: "attendance" }); } catch (e) {} });
    try { sweepStaleCalls_(); } catch (e) { Logger.log("sweepStaleCalls_ failed: " + e); }
  } finally {
    lock.releaseLock();
  }
}

// Sends one reminder per person per day per kind (remembered in the cache for 20h).
function remindOnce_(ctx, kind, dateKey, member, title, body) {
  const cache = CacheService.getScriptCache();
  const key = "attrem_" + kind + "_" + dateKey + "_" + member.id;
  if (cache.get(key)) return;
  cache.put(key, "1", 72000);
  ctx.pushes.push({ name: member.name, title: title, body: body, tag: "att-" + kind });
}

// isFinal = the day is over (close open days, judge hours). nowMin = "how far" into the
// day we are allowed to judge (24*60 for a finished day).
function processDay_(ctx, dateKey, byUser, team, shifts, isFinal, nowMin) {
  const live = !isFinal || dateKey === getIndiaDate();
  team.forEach(member => {
    const shift = shifts[member.id] || { start: "10:00", end: "19:00" };
    const startMin = hhmmToMin_(shift.start), endMin = hhmmToMin_(shift.end);
    const info = byUser[member.id];
    const events = info ? info.events.slice() : [];

    if (events.length === 0) {
      if (live && !isFinal && nowMin >= startMin + 20 && nowMin < endMin) {
        remindOnce_(ctx, "signin", dateKey, member, "🕘 You haven't signed in", "Your shift started at " + shift.start + ". Open WTC Hub and tap Sign In.");
      }
      return;
    }

    // LATE
    const firstWork = events.find(e => e.status === "Working" || e.status === "Meeting");
    if (firstWork) {
      const late = istMinutes_(firstWork.time) - startMin;
      if (late > LATE_GRACE_MIN_) {
        addFlag_(ctx, dateKey, member.id, member.name, "LATE", "Signed in at " + fmt12_(firstWork.time) + " (shift starts " + shift.start + ")", late);
      }
    }

    // LUNCH
    const lunches = [];
    events.forEach((e, i) => { if (e.status === "Lunch Break") lunches.push({ start: e.time, end: i + 1 < events.length ? events[i + 1].time : null }); });
    lunches.forEach(l => {
      if (l.end) {
        const dur = Math.round((l.end - l.start) / 60000);
        if (dur > LUNCH_ALLOWED_MIN_ + LUNCH_TOLERANCE_MIN_) {
          addFlag_(ctx, dateKey, member.id, member.name, "LONG_LUNCH", "Lunch " + fmt12_(l.start) + "–" + fmt12_(l.end) + " (" + dur + " min)", dur - LUNCH_ALLOWED_MIN_);
        }
      } else if (live && !isFinal) {
        const dur = (new Date() - l.start) / 60000;
        if (dur >= LUNCH_ALLOWED_MIN_) remindOnce_(ctx, "lunchover", dateKey, member, "⏰ Lunch time is over", "Your 30-minute lunch is over — tap Back to Work.");
      }
    });

    if (lunches.length === 0) {
      if (live && !isFinal && nowMin >= 13 * 60 + 40 && nowMin < LUNCH_END_MIN_) {
        remindOnce_(ctx, "lunchwin", dateKey, member, "🍽️ Mark your lunch", "Lunch can be marked only until 2:00 PM. If not marked, 30 minutes are deducted automatically.");
      }
      if (nowMin >= LUNCH_END_MIN_ + 5) {
        const t1 = istAt_(dateKey, "13:00"), t2 = istAt_(dateKey, "13:30");
        const s1 = statusAt_(events, t1), s2 = statusAt_(events, t2);
        const signedOutBetween = events.some(e => e.status === "Signed Out" && e.time > t1 && e.time < t2);
        if (WORK_STATUSES_.indexOf(s1) !== -1 && WORK_STATUSES_.indexOf(s2) !== -1 && !signedOutBetween) {
          const note = "AUTO: lunch not marked — 30 min deducted";
          ctx.newAttRows.push([dateKey, member.id, member.name, "Lunch Break", t1.toISOString(), note]);
          ctx.newAttRows.push([dateKey, member.id, member.name, s2, t2.toISOString(), note]);
          events.push({ status: "Lunch Break", time: t1, note: note }, { status: s2, time: t2, note: note });
          events.sort((a, b) => a.time - b.time);
          addFlag_(ctx, dateKey, member.id, member.name, "LUNCH_NOT_MARKED", "No lunch marked between 1–2 PM — 1:00–1:30 PM counted as lunch", LUNCH_ALLOWED_MIN_);
        }
      }
    }

    // SIGN-OUT
    let last = events[events.length - 1];
    if (last.status !== "Signed Out") {
      if (live && !isFinal && nowMin >= endMin + 30) {
        remindOnce_(ctx, "signout", dateKey, member, "🚪 Don't forget to sign out", "Your shift ended at " + shift.end + ". Tap Sign Out when you leave.");
      }
      if (isFinal) {
        const shiftEndTime = istAt_(dateKey, minToHhmm_(Math.min(endMin, 23 * 60 + 59)));
        const closeAt = last.time > shiftEndTime ? new Date(last.time.getTime() + 60000) : shiftEndTime;
        const note = "AUTO: missed sign-out — day closed at " + fmt12_(closeAt);
        ctx.newAttRows.push([dateKey, member.id, member.name, "Signed Out", closeAt.toISOString(), note]);
        events.push({ status: "Signed Out", time: closeAt, note: note });
        addFlag_(ctx, dateKey, member.id, member.name, "MISSED_SIGNOUT", "Last status \"" + last.status + "\" at " + fmt12_(last.time) + "; closed automatically at " + fmt12_(closeAt), 0);
        last = events[events.length - 1];
      }
    }

    // HOURS (judged once the day is over)
    if (isFinal && firstWork) {
      const hours = workingMsOf_(events, null) / 3600000;
      if (hours < MIN_WORK_HOURS_) {
        addFlag_(ctx, dateKey, member.id, member.name, "SHORT_HOURS", "Worked " + Math.floor(hours) + "h " + Math.round((hours % 1) * 60) + "m (minimum " + MIN_WORK_HOURS_ + "h)", Math.round((MIN_WORK_HOURS_ - hours) * 60));
      }
    }
  });
}

// Calls nobody answered stay "Ringing" in history forever — mark them Missed after 3 min
// and leave the person a "missed call" note (with a push) so they know someone called.
function sweepStaleCalls_() {
  const sheet = getCallsSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const start = Math.max(2, lastRow - 299);
  const rows = sheet.getRange(start, 1, lastRow - start + 1, 7).getValues();
  const now = Date.now();
  rows.forEach((r, i) => {
    if (r[5] !== "Ringing") return;
    const t = r[4] instanceof Date ? r[4] : new Date(r[4]);
    if (isNaN(t.getTime()) || now - t.getTime() < 180000) return;
    sheet.getRange(start + i, 6, 1, 2).setValues([["Missed", getIndiaTimeISO()]]);
    if (now - t.getTime() < 6 * 3600000) {
      try { addToInbox(r[2], { type: "missed_call", taskId: r[0], from: r[1], title: (r[3] || "Call") + " at " + fmt12_(t) + " — you missed this call", priority: "High" }); } catch (e) {}
    }
  });
}

// ---------- Discipline API ----------
// scope "all" (HR/PC/Shivendra only) → whole team; otherwise only the asking person.
function getDiscipline(userId, year, month, scope) {
  const y = parseInt(year, 10), m = parseInt(month, 10);
  const prefix = y + "-" + String(m).padStart(2, "0");
  const canAll = ATT_MANAGER_IDS_.indexOf(userId) !== -1;
  const all = readFlags_().filter(f => f.date.indexOf(prefix) === 0);
  const flags = (scope === "all" && canAll) ? all : all.filter(f => f.userId === userId);
  const summary = {};
  flags.forEach(f => {
    if (!summary[f.userId]) summary[f.userId] = { userId: f.userId, name: f.name, strikes: 0, pending: 0, excused: 0, byType: {} };
    const s = summary[f.userId];
    if (f.status === "Excused") { s.excused++; return; }
    if (f.status === "Requested") s.pending++;
    s.strikes++;
    s.byType[f.type] = (s.byType[f.type] || 0) + 1;
  });
  Object.keys(summary).forEach(k => {
    summary[k].halfDays = Math.floor(summary[k].strikes / STRIKES_PER_HALF_DAY_) * 0.5;
  });
  // pending correction requests from ANY month, so HR never misses one
  const requests = canAll && scope === "all" ? readFlags_().filter(f => f.status === "Requested") : [];
  flags.forEach(f => delete f.row);
  requests.forEach(f => delete f.row);
  return jsonResponse({status: "ok", flags: flags, summary: summary, requests: requests, rules: attendanceRules_(), shifts: getShiftMap_()});
}

function requestCorrection(flagId, userId, note, correctedTime) {
  const flag = readFlags_().find(f => String(f.id) === String(flagId));
  if (!flag) return jsonResponse({status: "error", message: "Flag not found"});
  if (flag.userId !== userId) return jsonResponse({status: "error", message: "Not your flag"});
  if (flag.status === "Excused") return jsonResponse({status: "ok"});
  const sheet = getFlagsSheet_();
  sheet.getRange(flag.row, 8).setValue("Requested");
  sheet.getRange(flag.row, 10, 1, 2).setValues([[String(note || "").slice(0, 500), String(correctedTime || "")]]);
  // Tell HR + admins (in-app + push)
  try {
    const team = allTeam_();
    team.filter(m => ATT_MANAGER_IDS_.indexOf(m.id) !== -1 && m.id !== userId).forEach(m => {
      addToInbox(m.name, { type: "correction", taskId: "flag_" + flag.id, from: flag.name,
        title: (FLAG_LABELS_[flag.type] || flag.type) + " on " + flag.date + " — " + String(note || "").slice(0, 80), priority: "Medium" });
    });
  } catch (e) {}
  return jsonResponse({status: "ok"});
}

function resolveFlag(flagId, decision, resolverId, resolverName) {
  if (ATT_MANAGER_IDS_.indexOf(resolverId) === -1) return jsonResponse({status: "error", message: "Not allowed"});
  if (decision !== "Excused" && decision !== "Rejected") return jsonResponse({status: "error", message: "Bad decision"});
  const flag = readFlags_().find(f => String(f.id) === String(flagId));
  if (!flag) return jsonResponse({status: "error", message: "Flag not found"});
  if (flag.userId === resolverId) return jsonResponse({status: "error", message: "You can't approve your own request"});
  const sheet = getFlagsSheet_();
  sheet.getRange(flag.row, 8).setValue(decision);
  sheet.getRange(flag.row, 12, 1, 2).setValues([[resolverName || resolverId, getIndiaTimeISO()]]);

  // Approved missed sign-out with a real leaving time → move the AUTOMATIC sign-out row
  // (never a row the person made) to that time, so their hours become correct.
  if (decision === "Excused" && flag.type === "MISSED_SIGNOUT" && hhmmToMin_(flag.correctedTime) !== null) {
    const att = getAttendanceSheet_();
    const recent = readRecentAttendance_(att, 6000);
    for (let i = recent.values.length - 1; i >= 0; i--) {
      const r = recent.values[i];
      const t = r[4] instanceof Date ? r[4] : new Date(r[4]);
      if (String(r[1]) === flag.userId && r[3] === "Signed Out" && String(r[5]).indexOf("AUTO: missed sign-out") === 0 &&
          Utilities.formatDate(t, "Asia/Kolkata", "yyyy-MM-dd") === flag.date) {
        const fixed = istAt_(flag.date, String(flag.correctedTime).slice(0, 5));
        att.getRange(recent.start + i, 5, 1, 2).setValues([[fixed.toISOString(), "AUTO: missed sign-out — corrected to " + fmt12_(fixed) + " (approved by " + (resolverName || resolverId) + ")"]]);
        break;
      }
    }
  }
  try {
    addToInbox(flag.name, { type: "attendance", taskId: "flag_" + flag.id, from: resolverName || "HR",
      title: (FLAG_LABELS_[flag.type] || flag.type) + " on " + flag.date + (decision === "Excused" ? " — excused ✅" : " — request rejected"), priority: "Medium" });
  } catch (e) {}
  return jsonResponse({status: "ok"});
}

// ============================================================
// v13 — TASK REMINDERS. Whoever assigned a task (or an admin) can nudge the assignees.
// One reminder per task every 10 minutes, so nobody can spam.
// ============================================================
function remindTask(taskId, fromName) {
  if (!taskId || !fromName) return jsonResponse({status: "error", message: "Missing task or sender"});
  const cache = CacheService.getScriptCache();
  const key = "remind_" + taskId;
  const last = cache.get(key);
  if (last) {
    const mins = Math.max(1, Math.ceil((600000 - (Date.now() - Number(last))) / 60000));
    return jsonResponse({status: "error", code: "TOO_SOON", message: "Already reminded — you can remind again in " + mins + " min."});
  }
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Tasks");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] != taskId) continue;
    const assignedBy = data[i][10];
    const isAdmin = ROUTINE_ADMINS_.indexOf(fromName) !== -1;
    if (assignedBy !== fromName && !isAdmin) return jsonResponse({status: "error", message: "Only the person who assigned this task can send a reminder."});
    if (data[i][6] === "Completed") return jsonResponse({status: "error", message: "This task is already completed."});
    const assignees = String(data[i][1]).split(",").map(a => a.trim()).filter(a => a && a !== fromName && a !== "AG" && a !== "BG");
    if (assignees.length === 0) return jsonResponse({status: "error", message: "Nobody else to remind on this task."});
    cache.put(key, String(Date.now()), 600);
    assignees.forEach(a => addToInbox(a, { type: "task_reminder", taskId: data[i][0], from: fromName, title: data[i][2], priority: data[i][4] || "Medium" }));
    return jsonResponse({status: "ok", reminded: assignees});
  }
  return jsonResponse({status: "error", message: "Task not found"});
}

// ============================================================
// v13 — APP SETTINGS (key/value). Used for Content Calendar access.
//   contentCalendarAccess: JSON list of team IDs allowed to open the Content Calendar.
//   Not set yet → the app uses the default (everyone except video editors).
// Only PC and Shivendra can change settings.
// ============================================================
function getSettingsSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("AppSettings");
  if (!sheet) {
    sheet = ss.insertSheet("AppSettings");
    sheet.appendRow(["Key", "Value", "Updated By", "Updated At"]);
  }
  return sheet;
}

function getSettings() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("appsettings_v1");
  if (cached) return ContentService.createTextOutput('{"status":"ok","settings":' + cached + '}').setMimeType(ContentService.MimeType.JSON);
  const rows = getSettingsSheet_().getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    try { settings[rows[i][0]] = JSON.parse(rows[i][1]); } catch (e) { settings[rows[i][0]] = rows[i][1]; }
  }
  const json = JSON.stringify(settings);
  cache.put("appsettings_v1", json, 600);
  return ContentService.createTextOutput('{"status":"ok","settings":' + json + '}').setMimeType(ContentService.MimeType.JSON);
}

function saveSetting(key, value, userId) {
  if (APP_ADMIN_IDS_.indexOf(userId) === -1) return jsonResponse({status: "error", message: "Only PC or Shivendra can change this"});
  if (["contentCalendarAccess"].indexOf(key) === -1) return jsonResponse({status: "error", message: "Unknown setting"});
  const sheet = getSettingsSheet_();
  const rows = sheet.getDataRange().getValues();
  const json = JSON.stringify(value);
  let done = false;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === key) { sheet.getRange(i + 1, 2, 1, 3).setValues([[json, userId, getIndiaTimeISO()]]); done = true; break; }
  }
  if (!done) sheet.appendRow([key, json, userId, getIndiaTimeISO()]);
  CacheService.getScriptCache().remove("appsettings_v1");
  return jsonResponse({status: "ok"});
}

// ============================================================
// v13 — RUN THIS ONCE after pasting this code (Run ▶ setupWtcTriggers).
// Installs the attendance watchdog (every 10 min), keeps the archive sweep, and removes
// the old points trigger. Safe to run again — it never creates duplicates.
// ============================================================
function setupWtcTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === "calculateDailyPoints" || fn === "attendanceWatchdog") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("attendanceWatchdog").timeBased().everyMinutes(10).create();
  const hasArchive = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === "archiveCompletedTasks");
  if (!hasArchive) ScriptApp.newTrigger("archiveCompletedTasks").timeBased().everyMinutes(30).create();
  // Mark every day before today as already closed, so the first run never touches history.
  const props = PropertiesService.getScriptProperties();
  props.setProperty("att_closed_" + dateKey_(addDays_(new Date(), -1)), "1");
  // Strikes start counting tomorrow (or today, if this is run before 8 AM).
  if (!props.getProperty("att_rules_start")) {
    props.setProperty("att_rules_start", istMinutes_(new Date()) < 8 * 60 ? getIndiaDate() : dateKey_(addDays_(new Date(), 1)));
  }
  ensureShiftConfig_();
  getFlagsSheet_();
  getSettingsSheet_();
  Logger.log("WTC triggers ready: " + ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction()).join(", "));
}
