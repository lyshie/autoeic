@echo �۰ʲM���x�n������t��
@echo off

REM �����q�T��
taskkill /im "Comp.exe" /f >nul 2>&1

REM ���㲾������t��
wmic product where name="��ѽs��-����s�@�t��" call uninstall >nul 2>&1
"%ProgramFiles(x86)%\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"%ProgramFiles(x86)%\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml" >nul 2>&1
"%ProgramFiles%\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"%ProgramFiles%\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml" >nul 2>&1

REM �R�����۰ʲ������ɮ�
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
