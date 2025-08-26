/* LocalStorage Keys */
const LS = {
  FREE_DATE: "tibet_free_used_on",
  SPREAD_CREDIT: "tibet_spread_credits",
  DAY_PASS: "tibet_day_until",
  MONTH_PASS: "tibet_month_until",
  YEAR_PASS: "tibet_year_until"
};

function todayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/* ใช้สิทธิ์ฟรี */
function useFree() {
  const lastUsed = localStorage.getItem(LS.FREE_DATE);
  const today = todayKey();

  if (lastUsed === today) {
    alert("คุณใช้สิทธิ์ฟรีวันนี้ไปแล้ว ลองใหม่พรุ่งนี้นะคะ 🌙");
    return;
  }
  localStorage.setItem(LS.FREE_DATE, today);
  alert("✅ คุณเปิดไพ่ฟรี 1 ใบวันนี้แล้ว!");
  drawOneCard();
}

/* เปิด 1 ใบ */
function drawOneCard() {
  document.getElementById("cardArea").innerText = "🃏 ไพ่สุ่ม 1 ใบ";
}

/* เปิด 3-6 ใบ */
function drawSpread() {
  document.getElementById("cardArea").innerText = "🃏🃏🃏 ไพ่สุ่ม 3-6 ใบ";
}

/* ซื้อเครดิต */
function buySpread() {
  localStorage.setItem(LS.SPREAD_CREDIT, "1");
  alert("✅ ซื้อสำเร็จ! คุณมีเครดิตเปิดสเปรดแล้ว");
}

function buyDayPass() {
  const until = new Date();
  until.setDate(until.getDate() + 1);
  localStorage.setItem(LS.DAY_PASS, until.toISOString());
  alert("✅ ซื้อแพ็ก 1 วันสำเร็จ");
}

function buyMonthPass() {
  const until = new Date();
  until.setMonth(until.getMonth() + 1);
  localStorage.setItem(LS.MONTH_PASS, until.toISOString());
  alert("✅ ซื้อแพ็กเดือนสำเร็จ");
}

function buyYearPass() {
  const until = new Date();
  until.setFullYear(until.getFullYear() + 1);
  localStorage.setItem(LS.YEAR_PASS, until.toISOString());
  alert("✅ ซื้อแพ็กปีสำเร็จ 🎉");
}
