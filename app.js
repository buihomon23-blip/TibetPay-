// ---- อ่านไพ่ฟรีจาก cards.json แล้วสุ่ม 1 ใบ ----
async function fetchCards() {
  const res = await fetch('cards.json');
  if (!res.ok) throw new Error('โหลดคำทำนายไม่สำเร็จ');
  return res.json();
}

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const btnDrawFree = document.getElementById('btnDrawFree');
const resultWrap  = document.getElementById('result');
const titleEl     = document.getElementById('cardTitle');
const textEl      = document.getElementById('cardText');
const btnUpgrade  = document.getElementById('btnUpgrade');

// กดสุ่มไพ่ฟรี
btnDrawFree?.addEventListener('click', async () => {
  btnDrawFree.disabled = true;
  btnDrawFree.textContent = 'กำลังสุ่ม...';
  try {
    const cards = await fetchCards();
    const card  = pickOne(cards);
    titleEl.textContent = card.title;
    textEl.textContent  = card.text;
    resultWrap.hidden   = false;

    // โชว์ปุ่มปลดล็อกหลังสุ่มไพ่แล้ว
    btnUpgrade.hidden = false;
    btnUpgrade.focus();
  } catch (e) {
    alert('มีบางอย่างผิดพลาด: ' + e.message);
  } finally {
    btnDrawFree.disabled = false;
    btnDrawFree.textContent = 'สุ่มไพ่ฟรี';
  }
});

// ---- Paywall Modal (เปิดเฉพาะเมื่อผู้ใช้กด) ----
const paywall = document.getElementById('paywall');

function openPaywall() {
  paywall.classList.add('show');
  paywall.setAttribute('aria-hidden','false');
}
function closePaywall() {
  paywall.classList.remove('show');
  paywall.setAttribute('aria-hidden','true');
}
btnUpgrade?.addEventListener('click', openPaywall);
paywall?.addEventListener('click', (e) => {
  if (e.target.matches('[data-close], .modal-backdrop')) closePaywall();
});

// ---- ปุ่มคัดลอกเลขบัญชี/พร้อมเพย์ ----
function copyText(selector){
  const el = document.querySelector(selector);
  if (!el) return;
  const text = el.textContent.replaceAll('-', '').trim();
  navigator.clipboard.writeText(text).then(()=>{
    toast('คัดลอกแล้ว: ' + text);
  }).catch(()=> alert('คัดลอกไม่สำเร็จ'));
}
document.querySelectorAll('.btn-copy').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-copy');
    copyText(sel);
  });
});

// ---- ช่วยแสดงแจ้งเตือนเล็ก ๆ ----
function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position='fixed'; t.style.left='50%'; t.style.bottom='26px';
  t.style.transform='translateX(-50%)';
  t.style.background='#2b214a'; t.style.color='#fff'; t.style.padding='10px 14px';
  t.style.border='1px solid rgba(255,255,255,.12)'; t.style.borderRadius='10px';
  t.style.zIndex='99'; t.style.boxShadow='0 8px 24px rgba(0,0,0,.35)';
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1600);
}

// ---- แพ็กเกจ: กดแล้วเติม amount ในข้อความ LINE (อำนวยความสะดวก) ----
document.querySelectorAll('.tier').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const amt = btn.getAttribute('data-amt');
    const note = encodeURIComponent(`[ทิเบตพยากรณ์] แจ้งโอน ${amt} บาท`);
    // เปิด LINE พร้อมโน้ต (ผู้ใช้ยังต้องแนบสลิปเอง)
    window.open(`https://lin.ee/k6CEOkR?note=${note}`, '_blank');
  });
});
