!include "FileFunc.nsh"
!include "TextReplace.nsh"

!define ADBOOK     "C:\eic\adbook"
!define ZONE_MAP   "Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains"
!define EMULATION  "Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData"
!define NEWWINDOWS "Software\Microsoft\Internet Explorer\New Windows\Allow"

!execute 'genpat /R main.js main.js.new main.js.pat'

RequestExecutionLevel admin
ShowInstDetails show

# name the installer
Name "自動安裝台南市公文系統 (autoeic)"
OutFile "autoeic.exe"

# default section start; every NSIS script has at least one section.
Section
    # 關閉通訊錄程式
    nsExec::ExecToLog 'taskkill /im "Comp.exe" /f'

    # 移除公文製作系統
    nsExec::ExecToLog 'wmic product where name="文書編輯-公文製作系統" call uninstall'

    # 移除公文管理系統 IE 環境設定程式
    IfFileExists "$PROGRAMFILES32\公文管理系統：IE環境設定\Uninstall\uninstall.xml" uninstall_ieset32
        Goto skip_uninstall_ieset
    uninstall_ieset32:
    ExecWait '"$PROGRAMFILES32\公文管理系統：IE環境設定\uninstall.exe" /U:"$PROGRAMFILES32\公文管理系統：IE環境設定\Uninstall\uninstall.xml"'
    
    IfFileExists "$PROGRAMFILES64\公文管理系統：IE環境設定\Uninstall\uninstall.xml" uninstall_ieset64
        Goto skip_uninstall_ieset
    uninstall_ieset64:
    ExecWait '"$PROGRAMFILES64\公文管理系統：IE環境設定\uninstall.exe" /U:"$PROGRAMFILES64\公文管理系統：IE環境設定\Uninstall\uninstall.xml"'

    skip_uninstall_ieset:
    
    # 刪除未自動移除的檔案 (eic*)
    Delete "$WINDIR\System32\eicdocn.dll"
    Delete "$WINDIR\System32\eicsecure.dll"
    Delete "$WINDIR\System32\eicsign.dll"
    Delete "$WINDIR\System32\eicpdf.dll"

    Delete "$WINDIR\SysWOW64\eicdocn.dll"
    Delete "$WINDIR\SysWOW64\eicsecure.dll"
    Delete "$WINDIR\SysWOW64\eicsign.dll"
    Delete "$WINDIR\SysWOW64\eicpdf.dll"

    # 移除(備份)既有通訊錄，處理通訊錄異常問題
    ${GetTime} "" "L" $0 $1 $2 $3 $4 $5 $6
    IntFmt $4 "%02d" $4
    Push "$2$1$0-$4$5$6"
    Pop $0
    Rename "${ADBOOK}\tncg"  "${ADBOOK}\tncg_$0"
    Rename "${ADBOOK}\tncg2" "${ADBOOK}\tncg2_$0"

    # 下載與安裝公文系統
    IfFileExists "$PROFILE\Downloads\docNinstall.msi" found_docinstall
        NSISdl::download "http://edit.tn.edu.tw/kw/docnet/service/formbinder/install/down/docNinstall.msi" "$PROFILE\Downloads\docNinstall.msi"
    found_docinstall:
    ExecWait 'msiexec /i "$PROFILE\Downloads\docNinstall.msi" /qn /norestart'

    # 強制關閉使用中的 IE 瀏覽器
    nsExec::ExecToLog 'taskkill /im "iexplore.exe" /f'

    # 將 {edit, odm}.tn.edu.tw 網址加入信任的網站
    WriteRegDWORD HKCU "${ZONE_MAP}\edit.tn.edu.tw" "http" 2
    WriteRegDWORD HKCU "${ZONE_MAP}\odm.tn.edu.tw"  "http" 2

    # 將 tn.edu.tw 網域加入相容性檢視
    WriteRegBin HKCU "${EMULATION}" "UserFilter" 411F00005308ADBA010000003000000001000000010000000C00000025C1945B1809D30101000000090074006E002E006500640075002E0074007700

    # 將 tn.edu.tw 網域加入到快顯封鎖的例外網站
    WriteRegBin HKCU "${NEWWINDOWS}" "tn.edu.tw" 0000

    # 下載與安裝 IE 自動設定程式 (取自台南市公文系統網站)
    IfFileExists "$PROFILE\Downloads\IE_SET.EXE" found_ieset
        NSISdl::download "http://odm.tn.edu.tw/SODFILE/TNSCH0001/DOWNLOAD/IE_SET.EXE" "$PROFILE\Downloads\IE_SET.EXE"
    found_ieset:
    ExecWait '$PROFILE\Downloads\IE_SET.EXE'

    # 下載預設通訊錄
    IfFileExists "$PROFILE\Downloads\IE_SET.EXE" found_adbook
        NSISdl::download "http://edit.tn.edu.tw/kw/docnet/service/module/docn/adbook/tncg.zip" "$PROFILE\Downloads\tncg.zip"
    found_adbook:
    # http://nsis.sourceforge.net/Nsisunz_plug-in
    nsisunz::UnzipToLog "$PROFILE\Downloads\tncg.zip" "${ADBOOK}"

    # 修正 main.js 程式碼
    # 處理 ADODB.CONNECTION 版本比較的問題
    ${textreplace::ReplaceInFile} "c:\eic\docnet\formbinder\common\js\main.js" "c:\eic\docnet\formbinder\common\js\main.js" 'adoConnect.Version < "2.5"' "parseFloat(adoConnect.Version) < 2.5" "" $0
    
    # 開啟台南市筆硯網站，請使用者自行下載使用者資料
    MessageBox MB_OK|MB_ICONINFORMATION "記得登入筆硯平台，同意安裝元件，並自行下載「使用者資料」。"
    Exec '"$PROGRAMFILES\Internet Explorer\iexplore.exe" "http://edit.tn.edu.tw/"'

# default section end
SectionEnd
