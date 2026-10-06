/**
 * AR Studio — Google Drive Upload Bridge
 * Database website TIDAK lagi memakai Spreadsheet. Data utama ada di Supabase.
 * Script ini khusus menerima upload dari admin dan menyimpan file ke folder Google Drive.
 *
 * Script Properties wajib:
 * DRIVE_FOLDER_ID             = ID folder Google Drive tujuan
 * SUPABASE_URL                = https://PROJECT_REF.supabase.co
 * SUPABASE_PUBLISHABLE_KEY    = sb_publishable_... (atau anon legacy)
 * ALLOWED_ADMIN_EMAILS        = email1@gmail.com,email2@gmail.com
 */

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: 'AR Studio Drive Upload',
    database: 'Supabase'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var accessToken = String(p.access_token || '');
    var fileName = safeName_(p.file_name || 'upload.bin');
    var mimeType = String(p.mime_type || 'application/octet-stream');
    var base64 = String(p.file_base64 || '').replace(/^data:[^;]+;base64,/, '');

    if (!accessToken) throw new Error('Sesi admin tidak ditemukan.');
    if (!base64) throw new Error('File kosong.');
    var user = verifySupabaseUser_(accessToken);
    assertAdmin_(user);

    var props = PropertiesService.getScriptProperties();
    var folderId = props.getProperty('DRIVE_FOLDER_ID');
    if (!folderId) throw new Error('DRIVE_FOLDER_ID belum diisi di Script Properties.');

    var bytes = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var file = DriveApp.getFolderById(folderId).createFile(blob);

    // Portfolio website perlu bisa dibaca visitor. Folder/file harus memang dimaksudkan publik.
    if (String(p.make_public || 'true') === 'true') {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    return iframeOutput_({
      success: true,
      id: file.getId(),
      name: file.getName(),
      url: 'https://drive.google.com/file/d/' + file.getId() + '/view',
      previewUrl: 'https://drive.google.com/file/d/' + file.getId() + '/preview'
    });
  } catch (err) {
    return iframeOutput_({ success:false, message: err && err.message ? err.message : String(err) });
  }
}

function verifySupabaseUser_(token) {
  var props = PropertiesService.getScriptProperties();
  var url = String(props.getProperty('SUPABASE_URL') || '').replace(/\/$/, '');
  var key = props.getProperty('SUPABASE_PUBLISHABLE_KEY');
  if (!url || !key) throw new Error('Konfigurasi Supabase Apps Script belum lengkap.');
  var res = UrlFetchApp.fetch(url + '/auth/v1/user', {
    method: 'get',
    muteHttpExceptions: true,
    headers: { apikey: key, Authorization: 'Bearer ' + token }
  });
  if (res.getResponseCode() !== 200) throw new Error('Sesi Supabase tidak valid atau sudah kedaluwarsa.');
  return JSON.parse(res.getContentText() || '{}');
}

function assertAdmin_(user) {
  var allowed = String(PropertiesService.getScriptProperties().getProperty('ALLOWED_ADMIN_EMAILS') || '')
    .split(',').map(function(x){ return x.trim().toLowerCase(); }).filter(String);
  var email = String(user && user.email || '').toLowerCase();
  if (!email || allowed.indexOf(email) === -1) throw new Error('Akun ini bukan admin upload AR Studio.');
}

function safeName_(name) {
  return String(name || 'upload.bin').replace(/[\\/:*?"<>|]/g, '_').slice(0, 180);
}

function iframeOutput_(obj) {
  var payload = JSON.stringify(obj).replace(/</g, '\\u003c');
  var html = '<!doctype html><html><body><script>' +
    'window.parent.postMessage({source:"ar-studio-drive-upload",payload:' + payload + '},"*");' +
    '<\/script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
