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
Name "�۰ʦw�˥x�n������t�� (autoeic)"
OutFile "autoeic.exe"

# default section start; every NSIS script has at least one section.
Section
    # �����q�T���{��
    nsExec::ExecToLog 'taskkill /im "Comp.exe" /f'

    # ��������s�@�t��
    nsExec::ExecToLog 'wmic product where name="��ѽs��-����s�@�t��" call uninstall'

    # ��������޲z�t�� IE ���ҳ]�w�{��
    IfFileExists "$PROGRAMFILES32\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml" uninstall_ieset32
        Goto skip_uninstall_ieset
    uninstall_ieset32:
    ExecWait '"$PROGRAMFILES32\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"$PROGRAMFILES32\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml"'
    
    IfFileExists "$PROGRAMFILES64\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml" uninstall_ieset64
        Goto skip_uninstall_ieset
    uninstall_ieset64:
    ExecWait '"$PROGRAMFILES64\����޲z�t�ΡGIE���ҳ]�w\uninstall.exe" /U:"$PROGRAMFILES64\����޲z�t�ΡGIE���ҳ]�w\Uninstall\uninstall.xml"'

    skip_uninstall_ieset:
    
    # �R�����۰ʲ������ɮ� (eic*)
    Delete "$WINDIR\System32\eicdocn.dll"
    Delete "$WINDIR\System32\eicsecure.dll"
    Delete "$WINDIR\System32\eicsign.dll"
    Delete "$WINDIR\System32\eicpdf.dll"

    Delete "$WINDIR\SysWOW64\eicdocn.dll"
    Delete "$WINDIR\SysWOW64\eicsecure.dll"
    Delete "$WINDIR\SysWOW64\eicsign.dll"
    Delete "$WINDIR\SysWOW64\eicpdf.dll"

    # ����(�ƥ�)�J���q�T���A�B�z�q�T�����`���D
    ${GetTime} "" "L" $0 $1 $2 $3 $4 $5 $6
    IntFmt $4 "%02d" $4
    Push "$2$1$0-$4$5$6"
    Pop $0
    Rename "${ADBOOK}\tncg"  "${ADBOOK}\tncg_$0"
    Rename "${ADBOOK}\tncg2" "${ADBOOK}\tncg2_$0"

    # �U���P�w�ˤ���t��
    IfFileExists "$PROFILE\Downloads\docNinstall.msi" found_docinstall
        NSISdl::download "http://edit.tn.edu.tw/kw/docnet/service/formbinder/install/down/docNinstall.msi" "$PROFILE\Downloads\docNinstall.msi"
    found_docinstall:
    ExecWait 'msiexec /i "$PROFILE\Downloads\docNinstall.msi" /qn /norestart'

    # �j�������ϥΤ��� IE �s����
    nsExec::ExecToLog 'taskkill /im "iexplore.exe" /f'

    # �N {edit, odm}.tn.edu.tw ���}�[�J�H��������
    WriteRegDWORD HKCU "${ZONE_MAP}\edit.tn.edu.tw" "http" 2
    WriteRegDWORD HKCU "${ZONE_MAP}\odm.tn.edu.tw"  "http" 2

    # �N tn.edu.tw ����[�J�ۮe���˵�
    WriteRegBin HKCU "${EMULATION}" "UserFilter" 411F00005308ADBA010000003000000001000000010000000C00000025C1945B1809D30101000000090074006E002E006500640075002E0074007700

    # �N tn.edu.tw ����[�J�������ꪺ�ҥ~����
    WriteRegBin HKCU "${NEWWINDOWS}" "tn.edu.tw" 0000

    # �U���P�w�� IE �۰ʳ]�w�{�� (���ۥx�n������t�κ���)
    IfFileExists "$PROFILE\Downloads\IE_SET.EXE" found_ieset
        NSISdl::download "http://odm.tn.edu.tw/SODFILE/TNSCH0001/DOWNLOAD/IE_SET.EXE" "$PROFILE\Downloads\IE_SET.EXE"
    found_ieset:
    ExecWait '$PROFILE\Downloads\IE_SET.EXE'

    # �U���w�]�q�T��
    IfFileExists "$PROFILE\Downloads\IE_SET.EXE" found_adbook
        NSISdl::download "http://edit.tn.edu.tw/kw/docnet/service/module/docn/adbook/tncg.zip" "$PROFILE\Downloads\tncg.zip"
    found_adbook:
    # http://nsis.sourceforge.net/Nsisunz_plug-in
    nsisunz::UnzipToLog "$PROFILE\Downloads\tncg.zip" "${ADBOOK}"

    # �ץ� main.js �{���X
    # �B�z ADODB.CONNECTION ������������D
    ${textreplace::ReplaceInFile} "c:\eic\docnet\formbinder\common\js\main.js" "c:\eic\docnet\formbinder\common\js\main.js" 'adoConnect.Version < "2.5"' "parseFloat(adoConnect.Version) < 2.5" "" $0
    
    # �}�ҥx�n�����x�����A�ШϥΪ̦ۦ�U���ϥΪ̸��
    MessageBox MB_OK|MB_ICONINFORMATION "�O�o�n�J���x���x�A�P�N�w�ˤ���A�æۦ�U���u�ϥΪ̸�ơv�C"
    Exec '"$PROGRAMFILES\Internet Explorer\iexplore.exe" "http://edit.tn.edu.tw/"'

# default section end
SectionEnd
