const SHEET_NAME = 'Postcard';

const ICON_BASE = 'https://www.greenpeace.org/static/planet4-indonesia-stateless/2026/10/';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }

    const rows = sheet.getDataRange().getValues();
    const postcards = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name      = String(row[0] || '').trim();
      const country   = String(row[1] || '').trim();
      const recipient = String(row[2] || '').trim();
      const message   = String(row[3] || '').trim();
      const image     = String(row[4] || '').trim();

      if (message !== '' || name !== '') {
        postcards.push({
          name:      name || 'Anonymous',
          country:   country || 'Southeast Asia',
          recipient: recipient,
          message:   message,
          image:     image
        });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', postcards: postcards }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const body = JSON.parse(e.postData.contents);

    sheet.appendRow([
      body.name || 'Anonymous',
      body.country || '',
      body.recipient || '',
      body.message || '',
      body.image || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
