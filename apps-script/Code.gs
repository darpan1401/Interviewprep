/**
 * Ground Staff Mock - Support backend (Google Apps Script + Google Sheets)
 *
 * Setup: see SUPPORT_SETUP.md in the project root.
 * Admin ID / password are NOT written here. Set them in
 * Project Settings -> Script Properties:  ADMIN_ID  and  ADMIN_PASSWORD
 */

var SHEET_NAME = 'Queries';
var HEADERS = ['id', 'createdAt', 'type', 'name', 'email', 'message', 'reply', 'repliedAt'];
var MAX_NAME = 60;
var MAX_EMAIL = 120;
var MAX_MESSAGE = 1000;
var MAX_REPLY = 1500;
var TYPES = ['Help', 'Bug report'];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    // Plain text format so nothing typed by a visitor can run as a spreadsheet formula.
    sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).setNumberFormat('@');
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function readAll_() {
  var values = getSheet_().getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var c = 0; c < HEADERS.length; c++) row[HEADERS[c]] = String(values[i][c] === undefined ? '' : values[i][c]);
    if (row.id) rows.push(row);
  }
  rows.reverse(); // newest first
  return rows;
}

function publicView_(row) {
  // email is never sent to the public page
  return {
    id: row.id,
    createdAt: row.createdAt,
    type: row.type,
    name: row.name || 'Anonymous',
    message: row.message,
    reply: row.reply,
    repliedAt: row.repliedAt
  };
}

function clean_(value, max) {
  return String(value === undefined || value === null ? '' : value).replace(/\s+/g, ' ').trim().substring(0, max);
}

function isAdmin_(body) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ADMIN_ID');
  var password = props.getProperty('ADMIN_PASSWORD');
  var ok = !!id && !!password && String(body.id || '') === id && String(body.password || '') === password;
  if (!ok) Utilities.sleep(1200); // slows down password guessing
  return ok;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'list') {
    // Public page: only queries that already have an admin reply are shown.
    var items = readAll_().filter(function (r) { return r.reply; }).map(publicView_);
    return json_({ ok: true, items: items });
  }
  return json_({ ok: false, error: 'Unknown action' });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'Bad request' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (body.action) {
      case 'submit':
        return submit_(body);
      case 'adminList':
        if (!isAdmin_(body)) return json_({ ok: false, error: 'Wrong ID or password' });
        return json_({ ok: true, items: readAll_() });
      case 'adminReply':
        if (!isAdmin_(body)) return json_({ ok: false, error: 'Wrong ID or password' });
        return reply_(body);
      case 'adminDelete':
        if (!isAdmin_(body)) return json_({ ok: false, error: 'Wrong ID or password' });
        return delete_(body);
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }
  } finally {
    lock.releaseLock();
  }
}

function submit_(body) {
  if (body.website) return json_({ ok: true }); // honeypot filled -> bot, pretend success
  var message = clean_(body.message, MAX_MESSAGE);
  if (message.length < 5) return json_({ ok: false, error: 'Please write a little more detail.' });
  var type = TYPES.indexOf(body.type) >= 0 ? body.type : 'Help';
  getSheet_().appendRow([
    Utilities.getUuid(),
    new Date().toISOString(),
    type,
    clean_(body.name, MAX_NAME),
    clean_(body.email, MAX_EMAIL),
    message,
    '',
    ''
  ]);
  return json_({ ok: true });
}

function findRow_(queryId) {
  var values = getSheet_().getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(queryId)) return i + 1; // 1-based sheet row
  }
  return -1;
}

function reply_(body) {
  var rowIndex = findRow_(body.queryId);
  if (rowIndex < 0) return json_({ ok: false, error: 'Query not found' });
  var reply = clean_(body.reply, MAX_REPLY);
  var sheet = getSheet_();
  sheet.getRange(rowIndex, 7, 1, 2).setValues([[reply, reply ? new Date().toISOString() : '']]);
  return json_({ ok: true, items: readAll_() });
}

function delete_(body) {
  var rowIndex = findRow_(body.queryId);
  if (rowIndex < 0) return json_({ ok: false, error: 'Query not found' });
  getSheet_().deleteRow(rowIndex);
  return json_({ ok: true, items: readAll_() });
}
