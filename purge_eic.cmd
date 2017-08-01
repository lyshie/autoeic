@echo 自動清除台南市公文系統
@echo off

REM 關閉通訊錄
taskkill /im "Comp.exe" /f >nul 2>&1

REM 完整移除公文系統
wmic product where name="文書編輯-公文製作系統" call uninstall >nul 2>&1
"%ProgramFiles(x86)%\公文管理系統：IE環境設定\uninstall.exe" /U:"%ProgramFiles(x86)%\公文管理系統：IE環境設定\Uninstall\uninstall.xml" >nul 2>&1
"%ProgramFiles%\公文管理系統：IE環境設定\uninstall.exe" /U:"%ProgramFiles%\公文管理系統：IE環境設定\Uninstall\uninstall.xml" >nul 2>&1

REM 刪除未自動移除的檔案
regsvr32 /u /s "%windir%\System32\eicdocn.dll"   >nul 2>&1
regsvr32 /u /s "%windir%\System32\eicsecure.dll" >nul 2>&1
regsvr32 /u /s "%windir%\System32\eicsign.dll"   >nul 2>&1
regsvr32 /u /s "%windir%\System32\eicpdf.dll"    >nul 2>&1
regsvr32 /u /s "%windir%\SysWOW64\eicdocn.dll"   >nul 2>&1
regsvr32 /u /s "%windir%\SysWOW64\eicsecure.dll" >nul 2>&1
regsvr32 /u /s "%windir%\SysWOW64\eicsign.dll"   >nul 2>&1
regsvr32 /u /s "%windir%\SysWOW64\eicpdf.dll"    >nul 2>&1

del "%windir%\System32\eicdocn.dll"   >nul 2>&1
del "%windir%\System32\eicsecure.dll" >nul 2>&1
del "%windir%\System32\eicsign.dll"   >nul 2>&1
del "%windir%\System32\eicpdf.dll"    >nul 2>&1
del "%windir%\SysWOW64\eicdocn.dll"   >nul 2>&1
del "%windir%\SysWOW64\eicsecure.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsign.dll"   >nul 2>&1
del "%windir%\SysWOW64\eicpdf.dll"    >nul 2>&1

rmdir /s /q "c:\eic"
