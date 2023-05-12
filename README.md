# js-createMeeting
Zoom予約Chrome拡張機能

処理の概要：  
googleカレンダー上で会議室予約時に利用  
新規カレンダー画面にて拡張機能をクリックすると、日時・会議室などの必要情報をcode.js(gas(google apps script))のURLへ送信。
code.js内で会議パスワードを生成の上、Zoom APIを通じてその会議室のZoom予約をし、予約情報を拡張機能に返す。  
拡張機能はカレンダー詳細欄にZoom予約情報をセットする  

