@echo 自動安裝台南市公文系統
@echo off

SET "doc_source=http://edit.tn.edu.tw/kw/docnet/service/formbinder/install/down/docNinstall.msi"
SET "doc_target=%userprofile%\Downloads\docNinstall.msi"
SET "ieset_source=http://raw.githubusercontent.com/lyshie/autoeic/master/IE_SET.EXE"
SET "ieset_target=%userprofile%\Downloads\IE_SET.exe"
SET "fart_source=https://jaist.dl.sourceforge.net/project/fart-it/fart-it/1.99b/fart.exe"
SET "fart_exec=%userprofile%\fart.exe"

SET "adbook=C:\eic\adbook"
FOR /F %%A IN ('WMIC OS GET LocalDateTime ^| FINDSTR \.') DO @SET B=%%A
SET "datetime=%B:~0,8%-%B:~8,6%"
REM SET "backup=eic_%B:~0,8%-%B:~8,6%"

REM 關閉通訊錄
taskkill /im "Comp.exe" /f >nul 2>&1

REM 完整移除公文系統
wmic product where name="文書編輯-公文製作系統" call uninstall >nul 2>&1
"%ProgramFiles(x86)%\公文管理系統：IE環境設定\uninstall.exe" /U:"%ProgramFiles(x86)%\公文管理系統：IE環境設定\Uninstall\uninstall.xml" >nul 2>&1
"%ProgramFiles%\公文管理系統：IE環境設定\uninstall.exe" /U:"%ProgramFiles%\公文管理系統：IE環境設定\Uninstall\uninstall.xml" >nul 2>&1

REM 刪除未自動移除的檔案
del "%windir%\System32\eicdocn.dll"   >nul 2>&1
del "%windir%\System32\eicsecure.dll" >nul 2>&1
del "%windir%\System32\eicsign.dll"   >nul 2>&1
del "%windir%\System32\eicpdf.dll"    >nul 2>&1
del "%windir%\SysWOW64\eicdocn.dll"   >nul 2>&1
del "%windir%\SysWOW64\eicsecure.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsign.dll"   >nul 2>&1
del "%windir%\SysWOW64\eicpdf.dll"    >nul 2>&1

REM 處理通訊錄異常問題
ren "%adbook%\tncg"  "tncg_%datetime%"  >nul 2>&1
ren "%adbook%\tncg2" "tncg2_%datetime%" >nul 2>&1

REM 備份原本的資料夾
REM IF EXIST "%origin%" (
REM     ren "%origin%" "%backup%" >nul 2>&1
REM ) ELSE (
REM     REM nothing
REM )

REM 下載與安裝公文系統
IF EXIST "%doc_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "docinstall" /download /priority normal "%doc_source%" "%doc_target%"
)
msiexec /i "%doc_target%" /qn /norestart >nul 2>&1

REM 強制關閉IE
taskkill /im "iexplore.exe" /f >nul 2>&1


SET "policy=%userprofile%\Downloads\winopenTool1015.hta"
SET "zone_map=HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\"
SET "emulation=HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData"
SET "newwindows=HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\New Windows\Allow"

REM 加入到信任的網站
reg add "%zone_map%edit.tn.edu.tw" /v http /t REG_DWORD /d 2 /f >nul 2>nul
reg add "%zone_map%odm.tn.edu.tw" /v http /t REG_DWORD /d 2 /f >nul 2>nul

REM 加入到相容性檢視
reg add "%emulation%" /v UserFilter /t REG_BINARY /d "411f00005308adba010000003000000001000000010000000c00000025c1945b1809d30101000000090074006e002e006500640075002e0074007700" /f >nul 2>nul

REM 加入到快顯封鎖的例外網站
reg add "%newwindows%" /v "tn.edu.tw" /t REG_BINARY /d "0000" /f >nul 2>nul


REM 下載與安裝IE自動設定程式
IF EXIST "%ieset_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "ieset" /download /priority normal "%ieset_source%" "%ieset_target%"
)
%ieset_target%

REM 處理ADODB.CONNECTION版本比較的問題
IF EXIST "%fart_exec%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "fart" /download /priority normal "%fart_source%" "%fart_exec%"
)
%fart_exec% "c:\eic\docnet\formbinder\common\js\main.js" "adoConnect.Version < \"2.5\"" "parseFloat(adoConnect.Version) < 2.5"

"%ProgramFiles%\Internet Explorer\iexplore.exe" "http://edit.tn.edu.tw/"
