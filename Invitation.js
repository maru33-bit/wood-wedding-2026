// JavaScriptを書く場所！
// 例えば：
// ・スクロールアニメーション
// ・画像スライド
// ・ボタン演出
// ・カウントダウン
// 木婚式の日付
// 木婚式の日付
const eventDate = new Date("2026-11-03T14:00:00");

// 表示する場所
const countdownText = document.getElementById("countdown-text");

// カウントダウン更新処理
function updateCountdown() {

  // 現在時刻を取得
  const now = new Date();

  // 残り時間（ミリ秒）
  const diff = eventDate - now;

  if (diff <= 0) {
    countdownText.textContent = "🎉 本日は木婚式です！ 🎉";
    return;
  }

  // 日数
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // 時間
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24))
    / (1000 * 60 * 60)
  );

  // 分
  const minutes = Math.floor(
    (diff % (1000 * 60 * 60))
    / (1000 * 60)
  );

  // 秒
  const seconds = Math.floor(
    (diff % (1000 * 60))
    / 1000
  );

  countdownText.textContent =
    `木婚式まであと ${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
}

// 最初に1回実行
updateCountdown();

// 1秒ごとに更新
setInterval(updateCountdown, 1000);
// などを追加できる！

console.log('Wood Wedding Invitation');

