// ========= ข้อมูลพื้นฐาน =========
const BANK_ACCOUNT = "7442391763";
const BANK_NAME = "กสิกรไทย";
const ACCOUNT_NAME = "จารุวรรณ หอมอ่อน";
const PROMPTPAY_NO = "0632656366";
const LINE_OA = "https://lin.ee/k6CEOkR";

// ========= ดูไพ่ฟรี =========
const drawBtn = document.getElementById("drawBtn");
const resultBox = document.getElementById("result");
const cardTitle = document.getElementById("cardTitle");
const cardText  = document.getElementById("cardText");

async function drawCard() {
  try {
    const res = await fetch("cards.json", { cache: "no-store" });
    const cards = await res.json();
    const pick = cards[Math.floor(Math.random() * cards.length)];
    cardTitle.textContent = pick.title;
    cardText.textContent  = pick.meaning;
    resultBox.classList.remove("hidden");
  } catch (e) {
    cardTitle.textContent = "เกิดข้อผิดพลาด";
    cardText.textContent = "ไม่สามารถโหลดคำทำนายได้ โปรดลองใหม่อีกครั้ง";
    resultBox.classList.remove("hidden");
  }
}
drawBtn.addEventListener("click", drawCard);

// ========= โมดัลระบบชำระเงิน =========
const payModal  = document.getElementById("payModal");
const openPay   = document.getElementById("openPaywall");
const closePay  = document.getElementById("closePay");
const plansEls  = document.querySelectorAll(".plan");
const payDetails= document.getElementById("payDetails");

const needAmountEl = document.getElementById("needAmount");
const acctEl  = document.getElementById("acct");
const ppNoEl  = document.getElementById("ppNo");
const ppImg   = document.getElementById("ppQR");
const iPaidBtn= document.getElementById("iPaid");
const premium = document.getElementById("premiumArea");

let selectedAmount = null;

openPay.addEventListener("click", () => {
  payModal.classList.remove("hidden");
  payModal.setAttribute("aria-hidden", "false");
});
closePay.addEventListener("click", () => {
  payModal.classList.add("hidden");
  payModal.setAttribute("aria-hidden", "true");
});

// เลือกแพ็กเกจ → แสดงรายละเอียด + สร้าง QR พร้อมเพย์
plansEls.forEach(btn => {
  btn.addEventListener("click", () => {
    plansEls.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedAmount = Number(btn.getAttribute("data-amount"));
    needAmountEl.textContent = selectedAmount.toLocaleString();

    acctEl.textContent = BANK_ACCOUNT;
    ppNoEl.textContent = PROMPTPAY_NO;

    // ใช้บริการสาธารณะสำหรับสร้าง QR พร้อมเพย์จากหมายเลข + ยอดเงิน
    // (แสดงภาพ QR อัตโนมัติ)
    const qrURL = `https://promptpay.io/${encodeURIComponent(PROMPTPAY_NO)}/${selectedAmount}.png`;
    ppImg.src = qrURL;
    ppImg.alt = `QR พร้อมเพย์ ${PROMPTPAY_NO} ยอด ${selectedAmount} บาท`;

    payDetails.classList.remove("hidden");
  });
});

// คัดลอกข้อความ
document.querySelectorAll(".copy").forEach(btn => {
  btn.addEventListener("click", () => {
    const sel = btn.getAttribute("data-copy");
    const el  = document.querySelector(sel);
    if (!el) return;
    const text = el.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "คัดลอกแล้ว";
      setTimeout(() => (btn.textContent = "คัดลอก"), 1600);
    });
  });
});

// ผู้ใช้กด “ฉันชำระเงินแล้ว”
iPaidBtn.addEventListener("click", () => {
  // เปิดพื้นที่สมาชิก (เชิงสัญลักษณ์; การยืนยันจริงทำใน LINE)
  premium.classList.remove("hidden");

  // เปิด LINE OA เพื่อส่งสลิป
  window.open(LINE_OA, "_blank");
});

// ปิดโมดัลเมื่อคลิกพื้นหลัง
payModal.addEventListener("click", (e) => {
  if (e.target === payModal) {
    closePay.click();
  }
});
