@echo 自動安裝台南市公文系統
@echo off
SET "doc_source=http://edit.tn.edu.tw/kw/docnet/service/formbinder/install/down/docNinstall.msi"
SET "doc_target=%userprofile%\Downloads\docNinstall.msi"
SET "ieset_source=http://raw.githubusercontent.com/lyshie/autoeic/master/IE_SET.EXE"
SET "ieset_target=%userprofile%\Downloads\IE_SET.exe"

SET "origin=C:\eic"
SET "backup=eic_%date%_%time%"

REM 完整移除公文系統
wmic product where name="文書編輯-公文製作系統" call uninstall >nul 2>&1
"%ProgramFiles(x86)%\公文管理系統：IE環境設定\uninstall.exe" /U:"%ProgramFiles(x86)%\公文管理系統：IE環境設定\Uninstall\uninstall.xml"
"%ProgramFiles%\公文管理系統：IE環境設定\uninstall.exe" /U:"%ProgramFiles(x86)%\公文管理系統：IE環境設定\Uninstall\uninstall.xml"

REM 刪除未自動移除的檔案
del "%windir%\System32\eicdocn.dll" >nul 2>&1
del "%windir%\System32\eicsecure.dll" >nul 2>&1
del "%windir%\System32\eicsign.dll" >nul 2>&1
del "%windir%\SysWOW64\eicdocn.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsecure.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsign.dll" >nul 2>&1

REM 備份原本的資料夾
IF EXIST "%origin%" (
    ren "%origin%" "%backup%" >nul 2>&1
) ELSE (
    REM nothing
)

REM 下載與安裝公文系統
IF EXIST "%doc_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "docinstall" /download /priority normal "%doc_source%" "%doc_target%"
)
msiexec /i "%doc_target%" /qn /norestart >nul 2>&1

REM 強制關閉IE
taskkill /im "iexplore.exe" /f >nul 2>&1

REM 下載與安裝IE自動設定程式
IF EXIST "%ieset_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "ieset" /download /priority normal "%ieset_source%" "%ieset_target%"
)
%ieset_target%