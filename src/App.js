import { useState, useCallback, useEffect } from 'react';
import './App.css';
import AdminScreen from './AdminScreen';

function getGasUrl() {
  return localStorage.getItem('gasUrl') || '';
}

// ===== 가나 데이터 =====
const KANA = {
  hiragana: {
    seion: [
      {char:'あ',r:'a'},{char:'い',r:'i'},{char:'う',r:'u'},{char:'え',r:'e'},{char:'お',r:'o'},
      {char:'か',r:'ka'},{char:'き',r:'ki'},{char:'く',r:'ku'},{char:'け',r:'ke'},{char:'こ',r:'ko'},
      {char:'さ',r:'sa'},{char:'し',r:'shi'},{char:'す',r:'su'},{char:'せ',r:'se'},{char:'そ',r:'so'},
      {char:'た',r:'ta'},{char:'ち',r:'chi'},{char:'つ',r:'tsu'},{char:'て',r:'te'},{char:'と',r:'to'},
      {char:'な',r:'na'},{char:'に',r:'ni'},{char:'ぬ',r:'nu'},{char:'ね',r:'ne'},{char:'の',r:'no'},
      {char:'は',r:'ha'},{char:'ひ',r:'hi'},{char:'ふ',r:'fu'},{char:'へ',r:'he'},{char:'ほ',r:'ho'},
      {char:'ま',r:'ma'},{char:'み',r:'mi'},{char:'む',r:'mu'},{char:'め',r:'me'},{char:'も',r:'mo'},
      {char:'や',r:'ya'},{char:'ゆ',r:'yu'},{char:'よ',r:'yo'},
      {char:'ら',r:'ra'},{char:'り',r:'ri'},{char:'る',r:'ru'},{char:'れ',r:'re'},{char:'ろ',r:'ro'},
      {char:'わ',r:'wa'},{char:'を',r:'wo'},{char:'ん',r:'n'},
    ],
    dakuon: [
      {char:'が',r:'ga'},{char:'ぎ',r:'gi'},{char:'ぐ',r:'gu'},{char:'げ',r:'ge'},{char:'ご',r:'go'},
      {char:'ざ',r:'za'},{char:'じ',r:'ji'},{char:'ず',r:'zu'},{char:'ぜ',r:'ze'},{char:'ぞ',r:'zo'},
      {char:'だ',r:'da'},{char:'で',r:'de'},{char:'ど',r:'do'},
      {char:'ば',r:'ba'},{char:'び',r:'bi'},{char:'ぶ',r:'bu'},{char:'べ',r:'be'},{char:'ぼ',r:'bo'},
      {char:'ぱ',r:'pa'},{char:'ぴ',r:'pi'},{char:'ぷ',r:'pu'},{char:'ぺ',r:'pe'},{char:'ぽ',r:'po'},
    ],
    yoon: [
      {char:'きゃ',r:'kya'},{char:'きゅ',r:'kyu'},{char:'きょ',r:'kyo'},
      {char:'しゃ',r:'sha'},{char:'しゅ',r:'shu'},{char:'しょ',r:'sho'},
      {char:'ちゃ',r:'cha'},{char:'ちゅ',r:'chu'},{char:'ちょ',r:'cho'},
      {char:'にゃ',r:'nya'},{char:'にゅ',r:'nyu'},{char:'にょ',r:'nyo'},
      {char:'ひゃ',r:'hya'},{char:'ひゅ',r:'hyu'},{char:'ひょ',r:'hyo'},
      {char:'みゃ',r:'mya'},{char:'みゅ',r:'myu'},{char:'みょ',r:'myo'},
      {char:'りゃ',r:'rya'},{char:'りゅ',r:'ryu'},{char:'りょ',r:'ryo'},
      {char:'ぎゃ',r:'gya'},{char:'ぎゅ',r:'gyu'},{char:'ぎょ',r:'gyo'},
      {char:'じゃ',r:'ja'},{char:'じゅ',r:'ju'},{char:'じょ',r:'jo'},
      {char:'びゃ',r:'bya'},{char:'びゅ',r:'byu'},{char:'びょ',r:'byo'},
      {char:'ぴゃ',r:'pya'},{char:'ぴゅ',r:'pyu'},{char:'ぴょ',r:'pyo'},
    ],
  },
  katakana: {
    seion: [
      {char:'ア',r:'a'},{char:'イ',r:'i'},{char:'ウ',r:'u'},{char:'エ',r:'e'},{char:'オ',r:'o'},
      {char:'カ',r:'ka'},{char:'キ',r:'ki'},{char:'ク',r:'ku'},{char:'ケ',r:'ke'},{char:'コ',r:'ko'},
      {char:'サ',r:'sa'},{char:'シ',r:'shi'},{char:'ス',r:'su'},{char:'セ',r:'se'},{char:'ソ',r:'so'},
      {char:'タ',r:'ta'},{char:'チ',r:'chi'},{char:'ツ',r:'tsu'},{char:'テ',r:'te'},{char:'ト',r:'to'},
      {char:'ナ',r:'na'},{char:'ニ',r:'ni'},{char:'ヌ',r:'nu'},{char:'ネ',r:'ne'},{char:'ノ',r:'no'},
      {char:'ハ',r:'ha'},{char:'ヒ',r:'hi'},{char:'フ',r:'fu'},{char:'ヘ',r:'he'},{char:'ホ',r:'ho'},
      {char:'マ',r:'ma'},{char:'ミ',r:'mi'},{char:'ム',r:'mu'},{char:'メ',r:'me'},{char:'モ',r:'mo'},
      {char:'ヤ',r:'ya'},{char:'ユ',r:'yu'},{char:'ヨ',r:'yo'},
      {char:'ラ',r:'ra'},{char:'リ',r:'ri'},{char:'ル',r:'ru'},{char:'レ',r:'re'},{char:'ロ',r:'ro'},
      {char:'ワ',r:'wa'},{char:'ヲ',r:'wo'},{char:'ン',r:'n'},
    ],
    dakuon: [
      {char:'ガ',r:'ga'},{char:'ギ',r:'gi'},{char:'グ',r:'gu'},{char:'ゲ',r:'ge'},{char:'ゴ',r:'go'},
      {char:'ザ',r:'za'},{char:'ジ',r:'ji'},{char:'ズ',r:'zu'},{char:'ゼ',r:'ze'},{char:'ゾ',r:'zo'},
      {char:'ダ',r:'da'},{char:'デ',r:'de'},{char:'ド',r:'do'},
      {char:'バ',r:'ba'},{char:'ビ',r:'bi'},{char:'ブ',r:'bu'},{char:'ベ',r:'be'},{char:'ボ',r:'bo'},
      {char:'パ',r:'pa'},{char:'ピ',r:'pi'},{char:'プ',r:'pu'},{char:'ペ',r:'pe'},{char:'ポ',r:'po'},
    ],
    yoon: [
      {char:'キャ',r:'kya'},{char:'キュ',r:'kyu'},{char:'キョ',r:'kyo'},
      {char:'シャ',r:'sha'},{char:'シュ',r:'shu'},{char:'ショ',r:'sho'},
      {char:'チャ',r:'cha'},{char:'チュ',r:'chu'},{char:'チョ',r:'cho'},
      {char:'ニャ',r:'nya'},{char:'ニュ',r:'nyu'},{char:'ニョ',r:'nyo'},
      {char:'ヒャ',r:'hya'},{char:'ヒュ',r:'hyu'},{char:'ヒョ',r:'hyo'},
      {char:'ミャ',r:'mya'},{char:'ミュ',r:'myu'},{char:'ミョ',r:'myo'},
      {char:'リャ',r:'rya'},{char:'リュ',r:'ryu'},{char:'リョ',r:'ryo'},
      {char:'ギャ',r:'gya'},{char:'ギュ',r:'gyu'},{char:'ギョ',r:'gyo'},
      {char:'ジャ',r:'ja'},{char:'ジュ',r:'ju'},{char:'ジョ',r:'jo'},
      {char:'ビャ',r:'bya'},{char:'ビュ',r:'byu'},{char:'ビョ',r:'byo'},
      {char:'ピャ',r:'pya'},{char:'ピュ',r:'pyu'},{char:'ピョ',r:'pyo'},
    ],
  },
};

const LEVEL_LABEL = { seion: '청음', dakuon: '탁음·반탁음', yoon: '요음', all: '종합' };

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(type, level) {
  const pool = KANA[type];
  const chars = level === 'all'
    ? [...pool.seion, ...pool.dakuon, ...pool.yoon]
    : pool[level];
  return shuffle(chars).slice(0, 20).map(q => {
    const distractors = shuffle(chars).filter(c => c.r !== q.r).slice(0, 3);
    return { ...q, options: shuffle([...distractors, q]) };
  });
}

function saveToSheet(data) {
  const url = getGasUrl();
  if (!url) return;
  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {});
}

// ===== 화면 컴포넌트 =====

function LoginScreen({ onStart }) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');

  function handleSubmit() {
    if (!studentId.trim() || !name.trim()) {
      alert('학번과 이름을 모두 입력해주세요.');
      return;
    }
    onStart(studentId.trim(), name.trim());
  }

  return (
    <div className="screen">
      <h1>일본어 퀴즈 🎌</h1>
      <p className="subtitle">히라가나 · 카타카나 학습</p>
      <div className="form-group">
        <label>학번</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="학번을 입력하세요"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>이름</label>
        <input
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <button className="btn" onClick={handleSubmit}>시작하기</button>
    </div>
  );
}

function SelectionScreen({ onStart }) {
  const [type, setType] = useState('hiragana');

  return (
    <div className="screen">
      <h1>퀴즈 설정</h1>
      <p className="section-label">문자 종류</p>
      <div className="type-selector">
        <button
          className={`type-btn ${type === 'hiragana' ? 'active' : ''}`}
          onClick={() => setType('hiragana')}
        >
          히라가나<small>ひらがな</small>
        </button>
        <button
          className={`type-btn ${type === 'katakana' ? 'active' : ''}`}
          onClick={() => setType('katakana')}
        >
          카타카나<small>カタカナ</small>
        </button>
      </div>
      <p className="section-label">난이도</p>
      <div className="btn-group">
        <button className="btn" onClick={() => onStart(type, 'seion')}>청음 (清音) · 46자</button>
        <button className="btn" onClick={() => onStart(type, 'dakuon')}>탁음·반탁음 (濁音/半濁音) · 23자</button>
        <button className="btn" onClick={() => onStart(type, 'yoon')}>요음 (拗音) · 33자</button>
        <button className="btn" onClick={() => onStart(type, 'all')}>종합 · 전체</button>
      </div>
    </div>
  );
}

function QuizScreen({ questions, onFinish }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);

  const q = questions[index];
  const total = questions.length;

  const handleAnswer = useCallback((opt) => {
    if (answered) return;
    const isCorrect = opt.r === q.r;
    const newScore = isCorrect ? score + 1 : score;
    setAnswered({ selected: opt.r, correct: q.r });
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      setAnswered(null);
      if (index + 1 < total) {
        setIndex(index + 1);
      } else {
        onFinish(newScore, total);
      }
    }, 800);
  }, [answered, q, index, score, total, onFinish]);

  function getOptionClass(opt) {
    if (!answered) return 'option-btn';
    if (opt.r === answered.correct) return 'option-btn correct';
    if (opt.r === answered.selected) return 'option-btn incorrect';
    return 'option-btn';
  }

  return (
    <div className="screen">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <p className="progress-text">{index + 1} / {total}</p>
      <div className="question-card">
        <div className="question-char">{q.char}</div>
      </div>
      <div className="options-grid">
        {q.options.map(opt => (
          <button
            key={opt.char}
            className={getOptionClass(opt)}
            onClick={() => handleAnswer(opt)}
            disabled={!!answered}
          >
            {opt.r}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultScreen({ score, total, onRestart, onChangeLevel }) {
  const pct = Math.round(score / total * 100);
  const saved = getGasUrl() ? '✓ 결과가 저장되었습니다.' : '';

  return (
    <div className="screen">
      <h1>퀴즈 완료!</h1>
      <div className="score-display">
        <div className="score-number">{score} / {total}</div>
        <div className="score-sub">정답 / 전체 문제</div>
        <div className="score-pct">{pct}%</div>
      </div>
      {saved && <p className="save-status">{saved}</p>}
      <div className="btn-group">
        <button className="btn" onClick={onRestart}>다시하기</button>
        <button className="btn secondary" onClick={onChangeLevel}>다른 레벨 선택</button>
      </div>
    </div>
  );
}

// ===== 메인 앱 =====

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');
  const [view, setView] = useState('login');
  const [student, setStudent] = useState({ id: '', name: '' });
  const [quizConfig, setQuizConfig] = useState({ type: 'hiragana', level: 'seion' });
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState({ score: 0, total: 0 });

  useEffect(() => {
    function onHashChange() {
      setIsAdmin(window.location.hash === '#admin');
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleLogin(id, name) {
    setStudent({ id, name });
    setView('selection');
  }

  function handleStartQuiz(type, level) {
    setQuizConfig({ type, level });
    setQuestions(buildQuestions(type, level));
    setView('quiz');
  }

  function handleFinish(score, total) {
    setFinalScore({ score, total });
    setView('result');
    saveToSheet({
      studentId: student.id,
      name: student.name,
      type: quizConfig.type === 'hiragana' ? '히라가나' : '카타카나',
      level: LEVEL_LABEL[quizConfig.level],
      score,
      total,
    });
  }

  if (isAdmin) {
    return (
      <div className="App">
        <AdminScreen />
      </div>
    );
  }

  return (
    <div className="App">
      {view === 'login' && <LoginScreen onStart={handleLogin} />}
      {view === 'selection' && <SelectionScreen onStart={handleStartQuiz} />}
      {view === 'quiz' && (
        <QuizScreen
          key={questions[0]?.char}
          questions={questions}
          onFinish={handleFinish}
        />
      )}
      {view === 'result' && (
        <ResultScreen
          score={finalScore.score}
          total={finalScore.total}
          onRestart={() => handleStartQuiz(quizConfig.type, quizConfig.level)}
          onChangeLevel={() => setView('selection')}
        />
      )}
    </div>
  );
}
