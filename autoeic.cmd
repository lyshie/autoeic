@echo �۰ʦw�˥x�n������t��
@echo off
SET "doc_source=http://edit.tn.edu.tw/kw/docnet/service/formbinder/install/down/docNinstall.msi"
SET "doc_target=%userprofile%\Downloads\docNinstall.msi"
SET "ieset_source=http://raw.githubusercontent.com/lyshie/autoeic/master/IE_SET.EXE"
SET "ieset_target=%userprofile%\Downloads\IE_SET.exe"

SET "origin=C:\eic"
SET "backup=eic_%date%_%time%"

REM ���㲾������t��
wmic product where name="��ѽs��-����s�@�t��" call uninstall >nul 2>&1
"%ProgramFiles(x86)%\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"%ProgramFiles(x86)%\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml"
"%ProgramFiles%\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"%ProgramFiles(x86)%\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml"

REM �R�����۰ʲ������ɮ�
del "%windir%\System32\eicdocn.dll" >nul 2>&1
del "%windir%\System32\eicsecure.dll" >nul 2>&1
del "%windir%\System32\eicsign.dll" >nul 2>&1
del "%windir%\SysWOW64\eicdocn.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsecure.dll" >nul 2>&1
del "%windir%\SysWOW64\eicsign.dll" >nul 2>&1

REM �ƥ��쥻����Ƨ�
IF EXIST "%origin%" (
    ren "%origin%" "%backup%" >nul 2>&1
) ELSE (
    REM nothing
)

REM �U���P�w�ˤ���t��
IF EXIST "%doc_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "docinstall" /download /priority normal "%doc_source%" "%doc_target%"
)
msiexec /i "%doc_target%" /qn /norestart >nul 2>&1

REM �j������IE
taskkill /im "iexplore.exe" /f >nul 2>&1

REM �U���P�w��IE�۰ʳ]�w�{��
IF EXIST "%ieset_target%" (
    REM nothing
) ELSE (
    bitsadmin /transfer "ieset" /download /priority normal "%ieset_source%" "%ieset_target%"
)
%ieset_target%