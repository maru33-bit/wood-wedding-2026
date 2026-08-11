/* ==============================================================
   Invitation.js
   結婚5周年パーティー招待状の動きをまとめたJavaScriptファイル

   目次（この中身をこの順番で書いています）
   ① 封筒を開くアニメーション
   ② カウントダウン（開催日時までの残り時間）
   ③ 新郎新婦のコイン反転（表裏の写真切り替え）
   ④ RSVP（出欠確認）：出席・欠席・保留ボタンの丸印切り替え
   ⑤ RSVPフォームの送信処理（GAS経由でスプレッドシートへ）
============================================================== */


/* ================================================================
   ① 封筒を開くアニメーション
================================================================ */

// 封筒の画面全体を包んでいる要素
const envelopeScreen = document.getElementById("envelope-screen");
// 封筒本体（開閉のアニメーションクラスをつける対象）
const envelope = document.getElementById("envelope");
// 「タップして開ける」の案内文字
const envelopeHint = document.getElementById("envelope-hint");

// 封筒が開いている間は、本編（body全体）をスクロールできないようにしておく。
// こうすることで「まず封筒を開けてから本編を読む」という体験になる。
document.body.style.overflow = "hidden";

// 封筒をクリック（スマホならタップ）した時の処理
envelopeScreen.addEventListener("click", () => {

  // すでに開封済みなら何もしない（二重クリック対策）
  if (envelope.classList.contains("is-open")) {
    return;
  }

  // 「タップして開ける」の文字を消す
  envelopeHint.style.opacity = "0";

  // 封筒を開くアニメーションを開始（CSS側の .is-open が効いてフタが開く）
  envelope.classList.add("is-open");

  // アニメーションが終わるタイミング（1.2秒後）で、
  // 封筒の画面ごとフェードアウトさせて完全に消す。
  setTimeout(() => {
    envelopeScreen.classList.add("is-hidden");
    // 本編のスクロールを再び許可する
    document.body.style.overflow = "";
  }, 1200);
});


/* ================================================================
   ② カウントダウン（開催日時までの残り時間）
================================================================ */

// パーティー開始日時（Party Information セクションの「開始時刻 15:00」に合わせる）
// ※日付を変更したくなったらここだけ書き換えればOK
const eventDate = new Date("2026-11-03T15:00:00+09:00");

// カウントダウンの数字を表示する場所（HTML側のid）
const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");

// カウントダウンを1回計算して表示を更新する関数
function updateCountdown() {

  const now = new Date();
  const diff = eventDate - now; // 残り時間（ミリ秒）

  // 開催日時を過ぎていたら「当日です」的な表示にする
  if (diff <= 0) {
    cdDays.textContent = "0";
    cdHours.textContent = "0";
    cdMinutes.textContent = "0";
    cdSeconds.textContent = "0";
    return;
  }

  // ミリ秒 → 日・時・分・秒 に変換する計算
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // 画面に反映
  cdDays.textContent = days;
  cdHours.textContent = hours;
  cdMinutes.textContent = minutes;
  cdSeconds.textContent = seconds;
}

// ページを開いた瞬間に1回計算しておく（1秒待たずにすぐ数字が出るように）
updateCountdown();
// その後は1秒（1000ミリ秒）ごとに再計算し続ける
setInterval(updateCountdown, 1000);


/* ================================================================
   ③ 新郎新婦のコイン反転（表裏の写真切り替え）
================================================================ */

// data-coin という目印がついた要素（新郎用・新婦用の2つ）を全部取得する
const coins = document.querySelectorAll("[data-coin]");

coins.forEach((coin) => {
  coin.addEventListener("click", () => {
    // is-flipped クラスの有無を切り替える（あれば外す／なければつける）
    // これだけでCSS側の rotateY(180deg) が効いてコインがくるっと回る
    coin.classList.toggle("is-flipped");
  });
});


/* ================================================================
   ④ RSVP：出席・欠席・保留ボタンの丸印切り替え
================================================================ */

// 3つの出欠ボタン（出席／欠席／保留）
const attendButtons = document.querySelectorAll(".attend-btn");
// 実際に送信される値を保持する隠しinput
const attendanceInput = document.getElementById("attendance");
// 出欠が未選択の時に出すエラーメッセージ
const attendanceError = document.getElementById("attendance-error");
// アレルギー入力欄（出席・保留の時だけ表示する）
const allergyField = document.getElementById("allergy-field");
const allergyInput = document.getElementById("allergy");

attendButtons.forEach((btn) => {
  btn.addEventListener("click", () => {

    // ---- 見た目の切り替え：押されたボタンだけに丸印をつける ----
    attendButtons.forEach((b) => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");

    // ---- 実際に送信する値を更新する ----
    const value = btn.dataset.value; // data-value="出席" などの中身
    attendanceInput.value = value;

    // エラーメッセージを消す（一度選んでもらえたので）
    attendanceError.classList.remove("is-visible");

    // ---- アレルギー欄の表示・非表示を切り替える ----
    // 「出席」または「保留」を選んだ時だけ表示し、必須項目にする。
    // 「欠席」の場合は非表示にし、必須も解除する（未入力でもエラーにしない）。
    if (value === "出席" || value === "保留") {
      allergyField.classList.add("is-visible");
      allergyInput.required = true;
    } else {
      allergyField.classList.remove("is-visible");
      allergyInput.required = false;
      allergyInput.value = ""; // 欠席に変更した場合、入力済みの内容はクリアしておく
    }
  });
});


/* ================================================================
   ⑤ RSVPフォームの送信処理（GAS経由でスプレッドシートへ）
================================================================ */

// ここに、あなたのGASウェブアプリのURL（/exec で終わるもの）を入れてください。
// すでにデプロイ済みのものをそのまま使う場合は、このURLは変更不要です。
const GAS_URL = "https://script.google.com/macros/s/AKfycbyvrx2QL6NXvoM7p1e9wb55D_42SZeJmn8afpVD5GqApp6llGkEgRw911bhpZqqZYnW/exec";

const rsvpForm = document.getElementById("rsvp-form");
const submitBtn = document.getElementById("submit-btn");
const resultMessage = document.getElementById("result-message");

rsvpForm.addEventListener("submit", async (e) => {

  // フォームのデフォルト動作（ページ遷移してしまう挙動）を止める
  e.preventDefault();

  // ---- ① 出欠が選択されているかチェック ----
  if (!attendanceInput.value) {
    attendanceError.classList.add("is-visible");
    // 出欠選択ボタンの場所まで自動でスクロールして気づいてもらう
    attendanceError.scrollIntoView({ behavior: "smooth", block: "center" });
    return; // ここで処理を止める（送信しない）
  }

  // ---- ② ブラウザ標準のフォームチェック（必須項目・メール形式など）----
  // reportValidity() は、未入力の必須項目があれば自動でその場所を教えてくれる。
  if (!rsvpForm.checkValidity()) {
    rsvpForm.reportValidity();
    return;
  }

  // ---- ③ 送信するデータをまとめる ----
  // ここでのキー名（name, address など）は、コード.gs 側で受け取る名前と
  // 揃える必要があるので、変更する場合は両方同時に直してください。
  const data = {
    name: document.getElementById("name").value,
    attendance: attendanceInput.value,
    address: document.getElementById("address").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    allergy: document.getElementById("allergy").value,
    question: document.getElementById("question").value
  };

  // ---- ④ 送信中はボタンを押せなくして、二重送信を防ぐ ----
  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";
  resultMessage.textContent = "";
  resultMessage.className = "";

  try {

    // GASのウェブアプリへPOST送信する。
    // mode: "no-cors" にしているのは、GAS（Googleのサーバー）との
    // 通信でブラウザのCORS制限に引っかからないようにするための設定。
    // ※ no-cors の場合、成功したかどうかの詳しい中身は読み取れないため、
    //   「fetchが例外を投げずに完了したら成功とみなす」という簡易的な判定にしています。
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(data)
    });

    // ---- 送信成功時の表示 ----
    resultMessage.textContent = "ご回答ありがとうございました！";
    resultMessage.classList.add("is-success");

    // フォームの中身をリセットする
    rsvpForm.reset();
    attendButtons.forEach((b) => b.classList.remove("is-selected"));
    attendanceInput.value = "";
    allergyField.classList.remove("is-visible");

  } catch (error) {

    // ---- 通信自体に失敗した場合（オフライン等）の表示 ----
    resultMessage.textContent = "送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。";
    resultMessage.classList.add("is-error");
    console.error("RSVP送信エラー:", error);

  } finally {
    // 成功・失敗にかかわらず、ボタンを再び押せる状態に戻す
    submitBtn.disabled = false;
    submitBtn.textContent = "送信する";
  }
});
