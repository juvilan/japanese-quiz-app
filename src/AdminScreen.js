import { useState, useEffect } from 'react';

const PW_KEY = 'adminPwHash';
const GAS_URL_KEY = 'gasUrl';
const SHEET_URL_KEY = 'sheetUrl';

async function hashPw(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function downloadCSV(rows) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ];
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `퀴즈결과_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 처음 접속 시 비밀번호 설정
function SetupScreen({ onSetup }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  async function handleSubmit() {
    if (pw.length < 4) { alert('비밀번호는 4자 이상으로 설정해주세요.'); return; }
    if (pw !== pw2) { alert('비밀번호가 일치하지 않습니다.'); return; }
    localStorage.setItem(PW_KEY, await hashPw(pw));
    onSetup();
  }

  return (
    <div className="screen">
      <h1>관리자 설정</h1>
      <p className="subtitle">처음 접속 시 비밀번호를 설정하세요</p>
      <div className="form-group">
        <label>새 비밀번호 (4자 이상)</label>
        <input type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} />
      </div>
      <div className="form-group">
        <label>비밀번호 확인</label>
        <input
          type="password"
          placeholder="비밀번호 다시 입력"
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <button className="btn" onClick={handleSubmit}>비밀번호 설정</button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: '#aaa' }}>
        <button
          onClick={() => { window.location.hash = ''; }}
          style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
        >
          ← 퀴즈로 돌아가기
        </button>
      </p>
    </div>
  );
}

// 로그인 화면
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('');

  async function handleSubmit() {
    const saved = localStorage.getItem(PW_KEY);
    const entered = await hashPw(pw);
    if (entered === saved) {
      onLogin();
    } else {
      alert('비밀번호가 틀렸습니다.');
      setPw('');
    }
  }

  return (
    <div className="screen">
      <h1>관리자</h1>
      <p className="subtitle">선생님 전용 결과 조회</p>
      <div className="form-group">
        <label>비밀번호</label>
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <button className="btn" onClick={handleSubmit}>로그인</button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: '#aaa' }}>
        <button
          onClick={() => { window.location.hash = ''; }}
          style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
        >
          ← 퀴즈로 돌아가기
        </button>
      </p>
    </div>
  );
}

// 관리자 대시보드
function Dashboard() {
  const defaultGasUrl = localStorage.getItem(GAS_URL_KEY) || process.env.REACT_APP_GAS_URL || '';
  const [gasUrl, setGasUrl] = useState(defaultGasUrl);
  const [gasInput, setGasInput] = useState(defaultGasUrl);
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem(SHEET_URL_KEY) || '');
  const [sheetInput, setSheetInput] = useState(() => localStorage.getItem(SHEET_URL_KEY) || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  function saveGasUrl() {
    const trimmed = gasInput.trim();
    localStorage.setItem(GAS_URL_KEY, trimmed);
    setGasUrl(trimmed);
  }

  function saveSheetUrl() {
    const trimmed = sheetInput.trim();
    localStorage.setItem(SHEET_URL_KEY, trimmed);
    setSheetUrl(trimmed);
  }

  async function fetchResults(url) {
    if (!url) { setError('GAS URL을 먼저 설정해주세요.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (e) {
      setError('데이터 불러오기 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (gasUrl) fetchResults(gasUrl);
  }, [gasUrl]);

  const filtered = filter.trim()
    ? results.filter(r =>
        Object.values(r).some(v =>
          String(v).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : results;

  return (
    <div className="screen admin-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 style={{ marginBottom: 0 }}>결과 관리</h1>
        {sheetUrl && (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-small"
            style={{ textDecoration: 'none', fontSize: '0.85rem' }}
          >
            구글 시트 열기
          </a>
        )}
      </div>

      <div className="admin-section">
        <label>GAS 웹앱 URL</label>
        <div className="gas-url-row">
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={gasInput}
            onChange={e => setGasInput(e.target.value)}
          />
          <button className="btn btn-small" onClick={saveGasUrl}>저장</button>
        </div>
        <label style={{ marginTop: 12 }}>구글 시트 URL</label>
        <div className="gas-url-row">
          <input
            type="text"
            placeholder="https://docs.google.com/spreadsheets/d/.../edit"
            value={sheetInput}
            onChange={e => setSheetInput(e.target.value)}
          />
          <button className="btn btn-small" onClick={saveSheetUrl}>저장</button>
        </div>
        {gasUrl && (
          <button
            className="btn"
            style={{ marginTop: 8 }}
            onClick={() => fetchResults(gasUrl)}
            disabled={loading}
          >
            {loading ? '불러오는 중...' : '새로고침'}
          </button>
        )}
      </div>

      {error && <p className="error-msg">{error}</p>}

      {results.length > 0 && (
        <div className="admin-section">
          <div className="admin-toolbar">
            <input
              type="text"
              className="filter-input"
              placeholder="학번/이름/유형 검색..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
            <button
              className="btn btn-small btn-green"
              onClick={() => downloadCSV(filtered)}
            >
              CSV 다운로드
            </button>
          </div>
          <p className="result-count">{filtered.length}건</p>
          <div className="table-wrap">
            <table className="result-table">
              <thead>
                <tr>
                  <th>일시</th><th>학번</th><th>이름</th>
                  <th>유형</th><th>레벨</th><th>점수</th><th>정답률</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td>{r['타임스탬프']}</td>
                    <td>{r['학번']}</td>
                    <td>{r['이름']}</td>
                    <td>{r['유형']}</td>
                    <td>{r['레벨']}</td>
                    <td>{r['점수']}/{r['전체']}</td>
                    <td>{r['정답률']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && gasUrl && !error && (
        <p style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>저장된 결과가 없습니다.</p>
      )}

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
        <button
          onClick={() => {
            if (window.confirm('비밀번호를 초기화하면 다시 설정해야 합니다. 계속할까요?')) {
              localStorage.removeItem(PW_KEY);
              window.location.reload();
            }
          }}
          style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          비밀번호 초기화
        </button>
        {'  '}
        <button
          onClick={() => { window.location.hash = ''; }}
          style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
        >
          ← 퀴즈로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default function AdminScreen() {
  const [stage, setStage] = useState(() =>
    localStorage.getItem(PW_KEY) ? 'login' : 'setup'
  );

  if (stage === 'setup') return <SetupScreen onSetup={() => setStage('login')} />;
  if (stage === 'login') return <LoginScreen onLogin={() => setStage('dashboard')} />;
  return <Dashboard />;
}
