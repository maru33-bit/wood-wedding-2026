/**
 * コード.gs
 * ---------------------------------------------------------------
 * Web招待状のRSVP（出欠確認）フォームから送信されたデータを受け取り、
 * Googleスプレッドシートに1行ずつ追記するGoogle Apps Scriptです。
 *
 * 【使い方（再デプロイの手順）】
 * 1. 紐づけたいスプレッドシートを開き、[拡張機能] → [Apps Script] を開く
 * 2. 既存の doPost 関数の中身を、このファイルの内容にまるごと置き換える
 * 3. スプレッドシートのシート名が「シート1」以外の場合は、
 *    下の SHEET_NAME の値を実際のシート名に書き換える
 * 4. 画面右上の「デプロイ」→「デプロイを管理」→ 既存のデプロイの鉛筆アイコン
 *    → バージョンを「新バージョン」にして「デプロイ」をクリック
 *    （これをしないと、コードを直しても公開中のURLには反映されません）
 * ---------------------------------------------------------------
 */

// データを書き込むシートの名前（違う名前にしている場合はここを変更）
const SHEET_NAME = "シート1";

/**
 * Webページ（Invitation.js）から fetch で POST されてきた時に呼ばれる関数
 */
function doPost(e) {

  // 対象のスプレッドシート・シートを取得
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);

  // Invitation.js から送られてきたJSON文字列を、扱いやすいオブジェクトに変換する
  const data = JSON.parse(e.postData.contents);

  // ---- スプレッドシートに1行追加する ----
  // 列の並び順は、事前に決めた以下の通りにしています。
  // タイムスタンプ／お名前／出欠／ご住所／メールアドレス／電話番号／アレルギー有無／メッセージ・質問
  sheet.appendRow([
    new Date(),        // A列：送信された日時（自動記録）
    data.name,         // B列：お名前
    data.attendance,   // C列：出欠（"出席" / "欠席" / "保留"）
    data.address,      // D列：ご住所
    data.email,        // E列：メールアドレス
    data.phone,        // F列：電話番号
    data.allergy,       // G列：アレルギーの有無
    data.question       // H列：私たちに聞いてみたい事やメッセージなど
  ]);

  // 処理が成功したことを返す（Webページ側では no-cors 送信のため中身は読めませんが、
  // ログや将来的な拡張のために正しくレスポンスを返しておきます）
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
