@echo �۰ʦw�˥x�n������t��
@echo off

SET "doc_source=http://edit.tn.edu.tw/kw/docnet/service/formbinder/install/down/docNinstall.msi"
SET "doc_target=%userprofile%\Downloads\docNinstall.msi"
SET "ieset_source=http://raw.githubusercontent.com/lyshie/autoeic/master/IE_SET.EXE"
SET "ieset_target=%userprofile%\Downloads\IE_SET.exe"

REM SET "origin=C:\eic"
REM FOR /F %%A IN ('WMIC OS GET LocalDateTime ^| FINDSTR \.') DO @SET B=%%A
REM SET "backup=eic_%B:~0,8%-%B:~8,6%"

REM �����q�T��
taskkill /im "Comp.exe" /f >nul 2>&1

REM ���㲾������t��
wmic product where name="��ѽs��-����s�@�t��" call uninstall >nul 2>&1
"%ProgramFiles(x86)%\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"%ProgramFiles(x86)%\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml"
"%ProgramFiles%\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"%ProgramFiles%\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml"

REM �R�����۰ʲ������ɮ�
del "%windir%\System32\eicdocn.dll" >nul 2>&1
del "%windir%\System32\eicsecure.dll" >nul 2>&1
del "%windir%\System32\eicsign.dll" >nul 2>&1
del "%windir%\SysWOW64\eicdocn.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsecure.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsign.dll" >nul 2>&1

REM �ƥ��쥻����Ƨ�
REM IF EXIST "%origin%" (
REM     ren "%origin%" "%backup%" >nul 2>&1
REM ) ELSE (
REM     REM nothing
REM )

REM �U���P�w�ˤ���t��
IF EXIST "%doc_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "docinstall" /download /priority normal "%doc_source%" "%doc_target%"
)
msiexec /i "%doc_target%" /qn /norestart >nul 2>&1

REM �j������IE
taskkill /im "iexplore.exe" /f >nul 2>&1


SET "policy=%userprofile%\Downloads\winopenTool1015.hta"
SET "zone_map=HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\"
SET "emulation=HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData"
SET "newwindows=HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\New Windows\Allow"

REM �[�J��H��������
reg add "%zone_map%edit.tn.edu.tw" /v http /t REG_DWORD /d 2 /f >nul 2>nul
reg add "%zone_map%odm.tn.edu.tw" /v http /t REG_DWORD /d 2 /f >nul 2>nul

REM �[�J��ۮe���˵�
reg add "%emulation%" /v UserFilter /t REG_BINARY /d "411f00005308adba010000003000000001000000010000000c00000025c1945b1809d30101000000090074006e002e006500640075002e0074007700" /f >nul 2>nul

REM �[�J�������ꪺ�ҥ~����
reg add "%newwindows%" /v "tn.edu.tw" /t REG_BINARY /d "0000" /f >nul 2>nul


REM �U���P�w��IE�۰ʳ]�w�{��
IF EXIST "%ieset_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "ieset" /download /priority normal "%ieset_source%" "%ieset_target%"
)
%ieset_target%

"%ProgramFiles%\Internet Explorer\iexplore.exe" "http://edit.tn.edu.tw/"
