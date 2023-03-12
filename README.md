# VLSM 自動勉強ツール

IPv4 及び IPv6 のアドレッシングを行います。

## IPv4 アドレッシング

このツールでは、主に IPv4 の可変長サブネットマスクによるサブネット化の訓練を行います。

ツールは、下の方法で問題を自動的に生成し、常に毎回違う問題を提供します。

1. 分割前のプレフィックス長を決定 (範囲:22~30)
2. 分割前のネットワークアドレスを決定 (範囲:IPv4プライベートアドレス空間)
3. サブネットの個数を決定 (範囲:2~9個)
4. サブネットの設置される予定のホスト数を決定(範囲:プレフィックス長及び分割数に依存)
5. アドレス決定
6. サブネット化した後の情報を作成
7. 問題をhtmlとして作成 ダウンロードできる状態にする
8. 採点機能を準備
9. イベント処理により採点を実施

## 自動採点の制限

自動採点の制限は以下の通り

1. IPv4に限定
2. デバイスのアドレッシング未実装
3. 誤答理由の提示なし

## 依存している技術

<!-- abbr list -->
*[HTML5]: Hyper Text Markup Language version5
*[CSS3]: Cascading Style Sheets, level 3
*[ECMA]: 欧州電子計算機工業会;European Computer Manufacturers Association
*[CDN]: Contents Delivery Network
<!-- end abbr list -->
1. HTML5
2. CSS3
3. JavaScript(ECMAScript)
   1. ECMA(ECMA-262 規格) Version3
   2. ECMA(ECMA-262 規格) Version2015
   3. ECMA(ECMA-262 規格) Version2016
4. 外部ライブラリ(CDNによる読み込み)
   1. stylesheet
      1. bulma (0.9.4)
      2. bulma-prefers-dark
      3. bulma-checkradio (2.1.3)
      4. bulma-tooltip (1.0.2)
      5. tabby (12)
      6. Material Symbols and Icons - Google Fonts
   2. script
      1. Tabby (12)
      2. clipboard.js (2.0.10)
      3. ipaddr.js (2)
      4. showdown (2.1.0)
      5. dompurify (3.0.1)

## 動作確認済みプラットフォーム

* 