/* ===== คีย์ LocalStorage ===== */
const LS = {
  FREE_DATE: 'tibet_free_used_on',    // YYYY-MM-DD ของวันที่ใช้สิทธิ์ฟรี
  SPREAD_CREDIT: 'tibet_spread_credits', // จำนวนเครดิตสเปรด
  DAY_PASS_UNTIL: 'tibet_day_until',  // ISO string หมดอายุสิทธิ์วัน
  SUB_MONTH_UNTIL: 'tibet_month_until',// ISO string หมดอายุสิทธิ์รายเดือน
  SUB_YEAR_UNTIL: 'tibet_year_until'   // ISO string หมดอายุสิทธิ์รายปี
};

/* ===== Utils เวลา/วันที่ ===== */
const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
};
const fmtDateTime = (isoStr) => {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('th-TH', { dateStyle:'medium', timeStyle:'short' });
};

/* ===== สถานะจาก LocalStorage ===== */
const getCredits = () => parseInt(localStorage.getItem(LS.SPREAD_CREDIT) || '0', 10);
const setCredits = (n) => localStorage.setItem(LS.SPREAD_CREDIT, String(n));

const isFreeUsedToday = () => localStorage.getItem(LS.FREE_DATE) === todayKey();
const markFreeUsedToday = () => localStorage.setItem(LS.FREE_DATE, todayKey());

const getUntil = (key) => localStorage.getItem(key);
const setUntil = (key, date) => localStorage.setItem(key, date.toISOString());

const isActiveUntil = (key) => {
  const iso = localStorage.getItem(key);
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
};

/* ===== การให้สิทธิ์ (จำลองจ่ายเงิน) =====
   ตอนเชื่อม OPN/Omise จริง ให้แทนที่ confirmPurchase() ด้วย flow ชำระเงินจริง
*/
function confirmPurchase(planCode, priceTHB) {
  return new Promise((resolve) => {
    const ok = confirm(`ยืนยันชำระ ${priceTHB} บาท เพื่อซื้อแพ็ก ${planCode}? (โหมดทดสอบ)`);
    resolve(ok);
  });
}

async function handlePayButton(e) {
  const btn = e.currentTarget;
  const plan = btn.dataset.plan;
  const price = parseInt(btn.dataset.price, 10);

  const ok = await confirmPurchase(plan, price);
  if (!ok) return;

  const now = new Date();

  switch (plan) {
    case 'SPREAD_29': {
      setCredits(getCredits() + 1);
      alert('เพิ่มเครดิตสเปรด 1 ครั้งแล้ว!');
      break;
    }
    case 'DAY_49': {
      const until = new Date(now.getTime() + 24*60*60*1000);
      setUntil(LS.DAY_PASS_UNTIL, until);
      alert('ปลดล็อกไม่จำกัด 24 ชั่วโมงแล้ว!');
      break;
    }
    case 'MONTH_199': {
      const until = new Date(now.getTime() + 30*24*60*60*1000);
      setUntil(LS.SUB_MONTH_UNTIL, until);
      alert('ปลดล็อกรายเดือน (30 วัน) แล้ว!');
      break;
    }
    case 'YEAR_1999': {
      const until = new Date(now.getTime() + 365*24*60*60*1000);
      setUntil(LS.SUB_YEAR_UNTIL, until);
      alert('ปลดล็อกรายปีแล้ว! รับสิทธิพิเศษในแอป');
      break;
    }
    default: break;
  }

  renderStatus();
}

/* ===== โหมดเปิดไพ่ ===== */
let mode = 'one'; // 'one' หรือ 'spread'
const btnModeOne = document.getElementById('btn-mode-one');
const btnModeSpread = document.getElementById('btn-mode-spread');
btnModeOne.addEventListener('click', () => {
  mode = 'one';
  btnModeOne.classList.add('active');
  btnModeSpread.classList.remove('active');
});
btnModeSpread.addEventListener('click', () => {
  mode = 'spread';
  btnModeSpread.classList.add('active');
  btnModeOne.classList.remove('active');
});

/* ===== ปุ่ม/สถานะบน paywall ===== */
function renderStatus() {
  // ฟรีวันนี้
  const freeBtn = document.getElementById('btn-free-today');
  const freeStatus = document.getElementById('free-status');
  if (isFreeUsedToday()) {
    freeBtn.disabled = true;
    freeBtn.textContent = 'ใช้สิทธิ์แล้ววันนี้';
    freeStatus.textContent = 'คุณใช้สิทธิ์ฟรีประจำวันไปแล้ว';
  } else {
    freeBtn.disabled = false;
    freeBtn.textContent = 'ใช้สิทธิ์วันนี้';
    freeStatus.textContent = 'ยังไม่ใช้สิทธิ์ฟรีวันนี้';
  }

  // เครดิตสเปรด
  document.getElementById('spread-credits').textContent = String(getCredits());

  // สถานะ pass ต่าง ๆ
  document.getElementById('day-until').textContent = isActiveUntil(LS.DAY_PASS_UNTIL)
    ? `ใช้งานได้ถึง ${fmtDateTime(getUntil(LS.DAY_PASS_UNTIL))}` : '—';

  document.getElementById('month-until').textContent = isActiveUntil(LS.SUB_MONTH_UNTIL)
    ? `ใช้งานได้ถึง ${fmtDateTime(getUntil(LS.SUB_MONTH_UNTIL))}` : '—';

  document.getElementById('year-until').textContent = isActiveUntil(LS.SUB_YEAR_UNTIL)
    ? `ใช้งานได้ถึง ${fmtDateTime(getUntil(LS.SUB_YEAR_UNTIL))}` : '—';

  // year text footer
  document.getElementById('year').textContent = new Date().getFullYear();
}

// ปุ่มจ่ายเงินทุกปุ่ม
document.querySelectorAll('.btn-pay').forEach(btn => {
  btn.addEventListener('click', handlePayButton);
});

// ปุ่มใช้สิทธิ์ฟรีวันนี้ (จะเปิดไพ่ให้ทันทีในโหมด 1 ใบ)
document.getElementById('btn-free-today').addEventListener('click', () => {
  mode = 'one';
  btnModeOne.classList.add('active');
  btnModeSpread.classList.remove('active');
  drawCards(true); // true = บังคับใช้สิทธิ์ฟรีวันนี้
});

// ปุ่มใช้เครดิตสเปรดที่มี
document.getElementById('btn-use-spread').addEventListener('click', () => {
  mode = 'spread';
  btnModeSpread.classList.add('active');
  btnModeOne.classList.remove('active');
  drawCards(false, true); // useCredit = true
});

/* ===== โหลดสำรับไพ่ ===== */
let DECK = [];
(async function loadDeck(){
  try{
    const res = await fetch('cards.json');
    DECK = await res.json();
  }catch(e){
    console.warn('โหลดไพ่ไม่สำเร็จ ใช้สำรับจำลองแทน', e);
    DECK = [
      { name:'ดาบ • ความชัดเจน', meaning:'ตัดสินใจ ชัดเจน เด็ดเดี่ยว' },
      { name:'ถ้วย • ความรู้สึก', meaning:'หัวใจ ความสัมพันธ์ จิตใจอ่อนโยน' },
      { name:'คทา • แรงบันดาลใจ', meaning:'การเริ่มต้น ไฟในใจ งานสร้างสรรค์' },
      { name:'เหรียญ • ความมั่นคง', meaning:'ฐานะ การเงิน ความมั่นคง' },
      { name:'ฤๅษี', meaning:'ทบทวนตนเอง ความสงบภายใน' },
      { name:'ราชินีถ้วย', meaning:'เมตตา เข้าใจผู้อื่น ช่วยเหลือ' },
      { name:'ราชาคทา', meaning:'ผู้นำ ลงมือทำ วิสัยทัศน์' },
      { name:'ดาว', meaning:'ความหวัง ฟื้นตัว โอกาสใหม่' },
      { name:'โลก', meaning:'สำเร็จ ไร้ข้อจำกัด วงจรใหม่' },
      { name:'จันทร์', meaning:'ความสับสน สัญชาตญาณ ความฝัน' }
    ];
  }
})();

/* ===== เปิดไพ่ ===== */
document.getElementById('btn-draw').addEventListener('click', () => drawCards());

function drawCards(useFreeNow = false, useCredit = false) {
  const cardsEl = document.getElementById('cards');
  const msgEl = document.getElementById('message');
  cardsEl.innerHTML = '';
  msgEl.textContent = '';

  // ตรวจสิทธิ์
  const hasUnlimited =
    isActiveUntil(LS.DAY_PASS_UNTIL) ||
    isActiveUntil(LS.SUB_MONTH_UNTIL) ||
    isActiveUntil(LS.SUB_YEAR_UNTIL);

  if (mode === 'one') {
    // โหมด 1 ใบ: ใช้สิทธิ์ฟรีวันละครั้ง ถ้าไม่มี unlimited
    if (!hasUnlimited) {
      if (!isFreeUsedToday()) {
        if (!useFreeNow) {
          // ถ้ายังไม่ได้กด "ใช้สิทธิ์วันนี้" ให้กดปุ่มนั้นหรือกด draw ก็ถือว่าใช้เลย
          markFreeUsedToday();
        } else {
          markFreeUsedToday();
        }
      } else {
        msgEl.textContent = 'วันนี้ใช้สิทธิ์ฟรีแล้ว • อัปเกรดเพื่อเปิดได้มากขึ้น';
        return;
      }
    }
    // จับ 1 ใบ
    const c = pickRandom(DECK, 1);
    renderCards(c);
    msgEl.textContent = hasUnlimited
      ? 'สิทธิ์ไม่จำกัด (แพ็กตลอดวัน/เดือน/ปี)'
      : 'ใช้สิทธิ์ฟรีประจำวันเรียบร้อย';
  }
  else {
    // โหมดสเปรด 3–6 ใบ: ต้องมี unlimited หรือมีเครดิต
    if (!hasUnlimited) {
      if (!useCredit) {
        if (getCredits() <= 0) {
          msgEl.textContent = 'ต้องมีเครดิตสเปรดหรือปลดล็อกสิทธิ์ไม่จำกัดก่อน';
          return;
        } else {
          // ถ้าไม่ได้ระบุ useCredit = true แต่มีเครดิต เราจะใช้ให้อัตโนมัติ
          setCredits(getCredits() - 1);
        }
      } else {
        if (getCredits() <= 0) {
          msgEl.textContent = 'ไม่มีเครดิตสเปรดคงเหลือ';
          return;
        }
        setCredits(getCredits() - 1);
      }
    }
    const n = 3 + Math.floor(Math.random()*4); // 3–6 ใบ
    const c = pickRandom(DECK, n);
    renderCards(c);
    msgEl.textContent = hasUnlimited ? 'สิทธิ์ไม่จำกัด' : 'หักเครดิตสเปรด 1 ครั้ง';
  }

  // อัปเดต UI
  renderStatus();
}

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i=0;i<n;i++){
    if (copy.length === 0) break;
    const idx = Math.floor(Math.random()*copy.length);
    out.push(copy.splice(idx,1)[0]);
  }
  return out;
}

function renderCards(cards){
  const cardsEl = document.getElementById('cards');
  cards.forEach(c => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<div>
        <h4>${escapeHTML(c.name)}</h4>
        <div class="meaning">${escapeHTML(c.meaning || '')}</div>
      </div>`;
    cardsEl.appendChild(el);
  });
}

function escapeHTML(s=''){
  return s.replace(/[&<>"']/g, (m)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

/* หมายเหตุวันนี้ (ตัวอย่างเก็บโชว์เฉย ๆ) */
document.getElementById('note-today').textContent = new Date().toLocaleDateString('th-TH',{ dateStyle:'medium' });

// เริ่มต้น
renderStatus();
