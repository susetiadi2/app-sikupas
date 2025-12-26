
/**
 * SIAP-MENDAMPING BACKEND ENGINE v4.4
 * Fitur: Dynamic Header Mapping & Robust Coordinate Parsing
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const USER_SHEET_NAME = 'USER_PENGAWAS';
const SCHOOL_SHEET_NAME = 'SEKOLAH';
const VISIT_SHEET_NAME = 'KUNJUNGAN';
const INSTRUMEN_SHEET_NAME = 'INSTRUMEN';
const PHOTO_FOLDER_ID = '1OWvFXStY2Nc6QxTwP02hPf7lCMD2fxKG';

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'login') return handleLogin(e.parameter.nip, e.parameter.password);
    if (action === 'getUser') return handleGetUser(e.parameter.id_pengawas);
    if (action === 'getSchools') return handleGetSchools(e.parameter.inspectorId);
    if (action === 'getVisits') return handleGetVisits(e.parameter.inspectorId);
    return createResponse({ status: 'error', message: 'Aksi GET tidak valid' });
  } catch (err) {
    return createResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    if (action === 'saveVisit') return handleSaveVisit(postData.data);
    if (action === 'updateUserPhoto') return handleUpdateUserPhoto(postData.id_pengawas, postData.photoData);
    return createResponse({ status: 'error', message: 'Aksi POST tidak valid' });
  } catch (err) {
    return createResponse({ status: 'error', message: err.toString() });
  }
}

function handleSaveVisit(data) {
   Logger.log('Data received: ' + JSON.stringify(data));
   const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
   let visitSheet = ss.getSheetByName(VISIT_SHEET_NAME);

   if (!visitSheet) {
     visitSheet = ss.insertSheet(VISIT_SHEET_NAME);
     visitSheet.appendRow([
       'ID_KUNJUNGAN', 'TANGGAL', 'JAM', 'ID_PENGAWAS', 'ID_SEKOLAH',
       'SEKOLAH', 'KEGIATAN', 'TEMUAN', 'CATATAN', 'TINDAK_LANJUT',
       'LATITUDE', 'LONGITUDE', 'JARAK_METER', 'INTERPRETASI_JARAK', 'STATUS',
       'LINK_PDF', 'LINK_FOTO', 'TTD_PENGAWAS', 'TTD_KEPSEK'
     ]);
   }

   const now = new Date();
   const timeStr = Utilities.formatDate(now, "GMT+7", "HH:mm");

   let photoUrl = '';
   if (data.photoUrl && data.photoUrl.includes('base64')) {
     photoUrl = savePhotoToDrive(data.id, data.photoUrl) || data.photoUrl;  // Jika gagal save ke Drive, simpan base64 langsung
   } else {
     photoUrl = data.photoUrl || '';
   }

   // Memastikan koordinat disimpan sebagai angka
   const lat = (data.location && data.location.latitude != null) ? data.location.latitude : '';
   const lon = (data.location && data.location.longitude != null) ? data.location.longitude : '';
   Logger.log('Lat: ' + lat + ', Lon: ' + lon);

  const visitRow = [
    data.id,
    data.date,
    timeStr,
    data.inspectorId,
    data.schoolId || '',
    data.schoolName,
    data.type,
    (data.keyFindings || []).join(', '),
    data.notes || '',
    (data.agreedActions || []).join(', '),
    lat,
    lon,
    data.distanceMeter || 0,
    data.locationStatus || 'Tanpa Verifikasi',
    data.status,
    '', 
    photoUrl,
    data.signatureSupervisor || '',
    data.signaturePrincipal || ''
  ];

  visitSheet.appendRow(visitRow);
  
  return createResponse({
    status: 'success',
    message: 'Laporan Berhasil Disimpan.',
    photoUrl: photoUrl
  });
}

function handleGetVisits(inspectorId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(VISIT_SHEET_NAME);
  if (!sheet) return createResponse({ status: 'success', data: [] });
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return createResponse({ status: 'success', data: [] });

  const headers = data[0];
  const col = {
    id: headers.indexOf('ID_KUNJUNGAN'),
    tgl: headers.indexOf('TANGGAL'),
    jam: headers.indexOf('JAM'),
    inspId: headers.indexOf('ID_PENGAWAS'),
    schName: headers.indexOf('SEKOLAH'),
    type: headers.indexOf('KEGIATAN'),
    findings: headers.indexOf('TEMUAN'),
    notes: headers.indexOf('CATATAN'),
    actions: headers.indexOf('TINDAK_LANJUT'),
    lat: headers.indexOf('LATITUDE'),
    lon: headers.indexOf('LONGITUDE'),
    dist: headers.indexOf('JARAK_METER'),
    locStat: headers.indexOf('INTERPRETASI_JARAK'),
    status: headers.indexOf('STATUS'),
    pdf: headers.indexOf('LINK_PDF'),
    photo: headers.indexOf('LINK_FOTO'),
    ttd1: headers.indexOf('TTD_PENGAWAS'),
    ttd2: headers.indexOf('TTD_KEPSEK')
  };

  const visits = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    if (row[col.inspId] && row[col.inspId].toString() === inspectorId) {

      // Robust Parsing untuk Lat/Lon dari cell
      const parseNum = (val) => {
        if (val === "" || val === null || val === undefined) return null;
        if (typeof val === 'number') return val;
        let s = val.toString().replace(',', '.').replace(/[^-0.9.]/g, '');
        let n = parseFloat(s);
        return isNaN(n) ? null : n;
      };

      const lat = parseNum(row[col.lat]);
      const lon = parseNum(row[col.lon]);
      Logger.log('Row ' + i + ': Lat raw: ' + row[col.lat] + ', parsed: ' + lat + ', Lon raw: ' + row[col.lon] + ', parsed: ' + lon);

      visits.push({
        id: row[col.id],
        date: row[col.tgl] instanceof Date ? Utilities.formatDate(row[col.tgl], "GMT+7", "yyyy-MM-dd") : row[col.tgl],
        jam: row[col.jam],
        schoolName: row[col.schName],
        principalName: row[col.schName].split(' - ')[1] || 'Kepala Sekolah',
        type: row[col.type],
        keyFindings: row[col.findings] ? row[col.findings].split(', ') : [],
        notes: row[col.notes] || '',
        agreedActions: row[col.actions] ? row[col.actions].split(', ') : [],
        location: {
          latitude: lat,
          longitude: lon
        },
        locationVerified: row[col.locStat] === "DI LOKASI",
        distanceMeter: row[col.dist],
        locationStatus: row[col.locStat],
        status: row[col.status],
        link_pdf: row[col.pdf],
        photoUrl: row[col.photo] || '',
        signatureSupervisor: row[col.ttd1] || '',
        signaturePrincipal: row[col.ttd2] || ''
      });
    }
  }
  return createResponse({ status: 'success', data: visits });
}

function savePhotoToDrive(visitId, base64Data) {
  try {
    const contentType = base64Data.substring(5, base64Data.indexOf(';'));
    const bytes = Utilities.base64Decode(base64Data.split(',')[1]);
    const blob = Utilities.newBlob(bytes, contentType, visitId + '.jpg');
    let folder = PHOTO_FOLDER_ID ? DriveApp.getFolderById(PHOTO_FOLDER_ID) : DriveApp.getRootFolder();
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/file/d/" + file.getId() + "/view";
  } catch (e) {
    Logger.log('Error saving photo: ' + e.toString());
    return null;
  }
}

function handleLogin(nip, password) {
  Logger.log('Login attempt: nip=' + nip + ', password=' + password);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(USER_SHEET_NAME);
  if (!sheet) return createResponse({ status: 'error', message: 'Tabel User tidak ditemukan' });
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    Logger.log('Checking row ' + i + ': nip=' + data[i][2] + ', password=' + data[i][3]);
    if (data[i][2].toString() === nip && data[i][3].toString() === password) {
      return createResponse({
        status: 'success',
        data: {
          id_pengawas: data[i][0],
          nama_pengawas: data[i][1],
          nip: data[i][2],
          email: data[i][4],
          wilayah: data[i][5],
          jabatan: data[i][6],
          aktif: data[i][7],
          photo_url: data[i][8] || ''
        }
      });
    }
  }
  return createResponse({ status: 'error', message: 'NIP atau password salah' });
}

function handleGetUser(id_pengawas) {
  Logger.log('Get user: id_pengawas=' + id_pengawas);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(USER_SHEET_NAME);
  if (!sheet) return createResponse({ status: 'error', message: 'Tabel User tidak ditemukan' });
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id_pengawas) {
      return createResponse({
        status: 'success',
        data: {
          id_pengawas: data[i][0],
          nama_pengawas: data[i][1],
          nip: data[i][2],
          email: data[i][4],
          wilayah: data[i][5],
          jabatan: data[i][6],
          aktif: data[i][7],
          photo_url: data[i][8] || ''
        }
      });
    }
  }
  return createResponse({ status: 'error', message: 'User tidak ditemukan' });
}

function handleUpdateUserPhoto(id_pengawas, photoData) {
  Logger.log('Update user photo: id_pengawas=' + id_pengawas);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(USER_SHEET_NAME);
  if (!sheet) return createResponse({ status: 'error', message: 'Tabel User tidak ditemukan' });
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id_pengawas) {
      const photoUrl = savePhotoToDrive('profile_' + id_pengawas, photoData);
      if (!photoUrl) {
        return createResponse({ status: 'error', message: 'Gagal menyimpan foto ke Drive. Periksa folder PHOTO_FOLDER_ID.' });
      }
      sheet.getRange(i + 1, 9).setValue(photoUrl); // Kolom I (9)
      return createResponse({
        status: 'success',
        message: 'Foto profil berhasil diperbarui',
        photoUrl: photoUrl
      });
    }
  }
  return createResponse({ status: 'error', message: 'User tidak ditemukan' });
}

function handleGetSchools(inspectorId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SCHOOL_SHEET_NAME);
  if (!sheet) return createResponse({ status: 'success', data: [] });
  const data = sheet.getDataRange().getValues();
  const schools = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] && data[i][4].toString() === inspectorId) {
      schools.push({
        id: data[i][0],
        npsn: data[i][1],
        name: data[i][2],
        principal: data[i][3],
        latitude: parseFloat(data[i][6]),
        longitude: parseFloat(data[i][7])
      });
    }
  }
  return createResponse({ status: 'success', data: schools });
}

function handleGetInstruments() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(INSTRUMEN_SHEET_NAME);
  if (!sheet) return createResponse({ status: 'success', data: [] });
  const data = sheet.getDataRange().getValues();
  const instruments = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][5] === 'TRUE' || data[i][5] === true) {
      instruments.push({
        id: data[i][0],
        label: data[i][1],
        icon: data[i][2],
        color: data[i][3],
        bg: data[i][4],
        order: parseInt(data[i][6]) || 0
      });
    }
  }
  instruments.sort((a, b) => a.order - b.order);
  return createResponse({ status: 'success', data: instruments });
}

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
