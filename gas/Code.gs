// 일본어 퀴즈 결과 저장 GAS 웹앱
// 구글 시트 ID (고정)
const SHEET_ID = '1qWJGG6rtqBBJJJce9CXeQMvMdGbL0wVhwjtsA6UBV5Q';
const SHEET_NAME = '퀴즈결과';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['타임스탬프', '학번', '이름', '유형', '레벨', '점수', '전체', '정답률']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 퀴즈 결과 저장 (학생 앱 → GAS)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    sheet.appendRow([
      timestamp,
      data.studentId,
      data.name,
      data.type,
      data.level,
      data.score,
      data.total,
      Math.round((data.score / data.total) * 100) + '%',
    ]);

    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('ERROR: ' + err.message);
  }
}

// 결과 조회 (관리자 페이지 → GAS)
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
