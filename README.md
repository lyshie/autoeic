# 自動安裝台南市公文系統 (autoeic)

## 1. 如何使用？
- 下載 [`autoeic.cmd`](https://gitcdn.xyz/repo/lyshie/autoeic/master/autoeic.cmd)，右鍵以「系統管理員身分」執行
  - 如 `bitsadmin` 無法正常下載，請使用 [`wget.exe`](https://eternallybored.org/misc/wget/current/wget.exe) 程式提供下載 (`wget.exe` 與 `autoeic.cmd` 同目錄)
- 請登入[筆硯系統](http://edit.tn.edu.tw/)，下載使用者資料
- 開啟[台南市公文管理系統](http://odm.tn.edu.tw/)，接受 `*.cab` 檔案下載與安裝

## 2. 自動化項目的步驟
- 關閉通訊錄程式
- 移除公文製作系統
- 移除公文管理系統 IE 環境設定程式
- 刪除未自動移除的檔案 (`eic*`)
- 移除(備份)既有通訊錄
- 下載與[安裝公文系統](http://edit.tn.edu.tw/kw/docnet/service/formbinder/install/down/docNinstall.msi)
- 強制關閉使用中的 IE 瀏覽器
- 將 `{edit, odm}.tn.edu.tw` 網址加入信任的網站
- 將 `tn.edu.tw` 網域加入相容性檢視
- 將 `tn.edu.tw` 網域加入到快顯封鎖的例外網站
- 下載與安裝 [IE 自動設定程式](http://raw.githubusercontent.com/lyshie/autoeic/master/IE_SET.EXE) (取自台南市公文系統網站)
- 下載預設通訊錄與 [`Unzip`](http://www2.cs.uidaho.edu/~jeffery/win32/unzip.exe) 程式，安裝預設的通訊錄
- 下載使用 [FART](http://fart-it.sourceforge.net/) 工具取代修正 `main.js` 程式碼 ([參考網站](http://klcg.cloudop.tw/KLGService/ServicePlatForm.aspx))
  <pre><code>adoConnect.Version < "2.5" 改為 parseFloat(adoConnect.Version) < 2.5</code></pre>
- 開啟[台南市筆硯網站](http://edit.tn.edu.tw/)，請使用者自行下載使用者資料

## 3. 初次安裝或是公文系統異常，請執行以下程式重新設定
請下載 [`autoeic.cmd`](https://gitcdn.xyz/repo/lyshie/autoeic/master/autoeic.cmd) 或 [`autoeic.bat`](https://gitcdn.xyz/repo/lyshie/autoeic/master/autoeic.bat) 檔案並儲存，按右鍵以「系統管理員身分」執行。
- ![Run as administrator](/run_as_admin.png)

## 4. 請登入筆硯系統，「下載使用者資料」
此步驟除下載使用者資料，也重新下載通訊錄，解決通訊錄更新異常造成程式沒有回應的問題。
- ![Login](/by.png)
- ![Download user data](/download.png)

## 5. 相關資訊
- 「公文系統」與「IE 自動設定程式」可至台南市公文管理系統與筆硯平台下載取得
- 筆硯已有[新版程式](http://klcg.cloudop.tw/KLGService/ServicePlatForm.aspx)可供下載，但非台南市公文管理系統所提供
- 使用第三方程式，如 `wget.exe`、`unzip.exe` 與 `fart.exe`
- GitHub 檔案改以 [GitCDN](https://gitcdn.xyz/) 提供，避免流量限制與 Content-type 問題

## 6. 作者
- HSIEH, Li-Yi
