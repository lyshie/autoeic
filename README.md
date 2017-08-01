# 自動安裝台南市公文系統 (autoeic)

## 1. 自動化項目的步驟
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
  - 開啟[台南市筆硯網站](http://edit.tn.edu.tw/)，請使用者自行下載使用者資料

## 2. 初次安裝或是公文系統異常，請執行以下程式重新設定
請下載 `[autoeic.cmd](http://raw.githubusercontent.com/lyshie/autoeic/master/autoeic.cmd)` 或 `[autoeic.bat](http://raw.githubusercontent.com/lyshie/autoeic/master/autoeic.bat)` 檔案並儲存，按右鍵以「系統管理員身分」執行。
  - ![Run as administrator](/run_as_admin.png)

## 3. 請登入筆硯系統，「下載使用者資料」
此步驟除下載使用者資料，也重新下載通訊錄，解決通訊錄更新異常造成程式沒有回應的問題。
  - ![Login](/by.png)
  - ![Download user data](/download.png)
