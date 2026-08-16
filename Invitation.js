/* ==============================================================
   Invitation.js（修正版）
   目次
   ① 封筒を開くアニメーション
   ② カウントダウン
   ③ 新郎新婦のコイン反転
   ④ ギャラリー：自動スライド＋ドラッグ／スワイプ操作
   ⑤ RSVP：出席・欠席・保留ボタンの丸印切り替え
   ⑥ RSVPフォームの送信処理
============================================================== */


/* ================================================================
   ① 封筒を開くアニメーション
================================================================ */
const envelopeScreen = document.getElementById("envelope-screen");
const envelope = document.getElementById("envelope");
const envelopeHint = document.getElementById("envelope-hint");

document.body.style.overflow = "hidden";

envelopeScreen.addEventListener("click", () => {
  if (envelope.classList.contains("is-open")) return;

  envelopeHint.style.opacity = "0";
  envelope.classList.add("is-open");

  setTimeout(() => {
    envelopeScreen.classList.add("is-hidden");
    document.body.style.overflow = "";
  }, 1200);
});


/* ================================================================
   ② カウントダウン
================================================================ */
const eventDate = new Date("2026-11-03T15:00:00+09:00");

const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");

function updateCountdown() {
  const now = new Date();
  const diff = eventDate - now;

  if (diff <= 0) {
    cdDays.textContent = "0";
    cdHours.textContent = "0";
    cdMinutes.textContent = "0";
    cdSeconds.textContent = "0";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  cdDays.textContent = days;
  cdHours.textContent = hours;
  cdMinutes.textContent = minutes;
  cdSeconds.textContent = seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* ================================================================
   ③ 新郎新婦のコイン反転
================================================================ */
const coins = document.querySelectorAll("[data-coin]");

coins.forEach((coin) => {
  coin.addEventListener("click", () => {
    coin.classList.toggle("is-flipped");
  });
});


/* ================================================================
   ④ ギャラリー：自動スライド＋ドラッグ／スワイプ操作
   仕組み：
   ・.gallery-marquee は overflow-x:auto の横スクロール領域
   ・何もしていない間は setInterval で少しずつ scrollLeft を増やし、
     自動でゆっくり流れているように見せる
   ・ユーザーが指（マウス）で触れている間は自動スクロールを止め、
     ブラウザ標準のスワイプ操作に任せる
   ・指を離してから少し待ってから自動スクロールを再開する
   ・画像を2セット並べているので、半分の位置まで来たら
     気づかれないように瞬時に先頭へ戻し、無限ループに見せる
================================================================ */
const galleryMarquee = document.getElementById("gallery-marquee");
const galleryTrack = document.getElementById("gallery-track");

let galleryAutoTimer = null;   // 自動スクロールのsetIntervalを覚えておく変数
let isUserInteracting = false; // 今ユーザーが触っているかどうか
let resumeTimeoutId = null;    // 「触るのをやめてから再開するまで」のタイマー

// 自動スクロールを開始する関数
function startGalleryAutoScroll() {
  // すでに動いていたら一旦止めてから、二重に動かないようにする
  stopGalleryAutoScroll();

  galleryAutoTimer = setInterval(() => {
    if (isUserInteracting) return; // 触られている間は何もしない

    galleryMarquee.scrollLeft += 1; // 1フレームごとに1pxずつ進める

    // 画像を2セット分並べているので、track全体の半分まで来たら
    // 違和感なく先頭に戻す（＝無限ループしているように見せる）
    const halfWidth = galleryTrack.scrollWidth / 2;
    if (galleryMarquee.scrollLeft >= halfWidth) {
      galleryMarquee.scrollLeft = 0;
    }
  }, 20); // 20ミリ秒ごとに1px進める＝なめらかな自動スクロール
}

// 自動スクロールを止める関数
function stopGalleryAutoScroll() {
  if (galleryAutoTimer) {
    clearInterval(galleryAutoTimer);
    galleryAutoTimer = null;
  }
}

// ユーザーが触り始めた時の共通処理（マウス・タッチ共通）
function handleGalleryInteractStart() {
  isUserInteracting = true;
  // もし「再開待ちタイマー」が動いていたら、一旦キャンセルする
  if (resumeTimeoutId) {
    clearTimeout(resumeTimeoutId);
    resumeTimeoutId = null;
  }
}

// ユーザーが触るのをやめた時の共通処理
function handleGalleryInteractEnd() {
  isUserInteracting = false;
  // 触るのをやめてから1.2秒待ってから自動スクロールを再開する
  // （すぐ再開すると、ユーザーが動かした直後にカクッと動いて不自然なため）
  resumeTimeoutId = setTimeout(() => {
    resumeTimeoutId = null;
  }, 1200);
}

// マウス操作（PCでのドラッグ）
galleryMarquee.addEventListener("mousedown", handleGalleryInteractStart);
window.addEventListener("mouseup", handleGalleryInteractEnd);

// タッチ操作（スマホでのスワイプ）
galleryMarquee.addEventListener("touchstart", handleGalleryInteractStart, { passive: true });
galleryMarquee.addEventListener("touchend", handleGalleryInteractEnd);

// マウスホイールで横に触った場合も同様に「触っている」扱いにする
galleryMarquee.addEventListener("wheel", () => {
  handleGalleryInteractStart();
  handleGalleryInteractEnd();
}, { passive: true });

startGalleryAutoScroll();


/* ================================================================
   ⑤ RSVP：出席・欠席・保留ボタンの丸印切り替え
================================================================ */
const attendButtons = document.querySelectorAll(".attend-btn");
const attendanceInput = document.getElementById("attendance");
const attendanceError = document.getElementById("attendance-error");
const allergyField = document.getElementById("allergy-field");
const allergyInput = document.getElementById("allergy");

attendButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    attendButtons.forEach((b) => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");

    const value = btn.dataset.value;
    attendanceInput.value = value;
    attendanceError.classList.remove("is-visible");

    if (value === "出席" || value === "保留") {
      allergyField.classList.add("is-visible");
      allergyInput.required = true;
    } else {
      allergyField.classList.remove("is-visible");
      allergyInput.required = false;
      allergyInput.value = "";
    }
  });
});


/* ================================================================
   ⑥ RSVPフォームの送信処理（GAS経由でスプレッドシートへ）
================================================================ */
const GAS_URL = "https://script.google.com/macros/s/AKfycbyvrx2QL6NXvoM7p1e9wb55D_42SZeJmn8afpVD5GqApp6llGkEgRw911bhpZqqZYnW/exec";

const rsvpForm = document.getElementById("rsvp-form");
const submitBtn = document.getElementById("submit-btn");
const resultMessage = document.getElementById("result-message");

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!attendanceInput.value) {
    attendanceError.classList.add("is-visible");
    attendanceError.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (!rsvpForm.checkValidity()) {
    rsvpForm.reportValidity();
    return;
  }

  const data = {
    name: document.getElementById("name").value,
    attendance: attendanceInput.value,
    address: document.getElementById("address").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    allergy: document.getElementById("allergy").value,
    question: document.getElementById("question").value
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";
  resultMessage.textContent = "";
  resultMessage.className = "";

  try {
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(data)
    });

    resultMessage.textContent = "ご回答ありがとうございました！";
    resultMessage.classList.add("is-success");

    rsvpForm.reset();
    attendButtons.forEach((b) => b.classList.remove("is-selected"));
    attendanceInput.value = "";
    allergyField.classList.remove("is-visible");

  } catch (error) {
    resultMessage.textContent = "送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。";
    resultMessage.classList.add("is-error");
    console.error("RSVP送信エラー:", error);

  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "送信する";
  }
});
