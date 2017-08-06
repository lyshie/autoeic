
//: initialize

var g_naModeColor = [];
var g_naModeBgColor = [];
var g_oReferenceBar = null;
var g_nPluginMode = 0;
var g_oCookie = null;

function OnInitialize()
{
	try
	{
		_ClearSpace();
		if (window.location.search.indexOf("ApiMode=EXEC") != -1)
			window.parent.hWndApi.OnInit();
		else if (window.location.search.indexOf("ApiMode=PREVIEW") != -1)
			return;
		else
			window.parent.hWndApi.OnInit();

		_Log("�iWeb������s�@�t�αҰʡj(" + ((new Date() - dt) / 1000) + ")", 0xFFAA00);
		OnPreInitialize(true);
	}
	catch (e)
	{
		_FatalError("�t�Ϊ�l�ƥ���", e);
	}
}

function OnPreInitialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		if (true != _CallWinIeEnvInitialize()) return;
		if (true != _CallCompObjectInitialize()) return;
		if (true != _CallDddEngineInitialize(g_coDDDEng)) return;
		if (true != _CallGDLocalInitialize(g_coGDLocal)) return;

		_CallSysEnvDataInitialize();
		if (bInitialize) g_oTimer = setTimeout("OnConfigInitialize(true)", 10);
	}
	catch (e)
	{
		_FatalError("�t�����Ҥ��䴩Web������s�@�t��", e);
		return false;
	}
}

function OnUpdateConfig(strBase, strOld, strNew)
{
	try
	{
		var urlNew = strBase + strNew;
		var urlOld = strBase + strOld;
		if (!g_coGDLocal.IsExist(0, urlNew))
		{
			if (!g_coGDLocal.IsExist(0, urlOld))
				g_coGDLocal.CopyFile(urlNew.replace(/_init/, "_msi"), urlOld);
			return;
		}

		var xmlNew = _LoadXML(urlNew);
		if (xmlNew == null)
			return;

		var xmlOld = _LoadXML(urlOld);
		if (xmlOld != null)
		{
			var xnOldRoot = xmlOld.documentElement;
			var xnNewRoot = xmlNew.documentElement;

			// add nodes
			var xnNodeList = xnNewRoot.selectNodes("/*/*");
			for (var n = 0; n < xnNodeList.length; n++)
			{
				var xnNode = xnNodeList[n];
				if (xnOldRoot.selectSingleNode(xnNode.nodeName) == null)
					xnOldRoot.appendChild(xnNode.cloneNode(true));
			}

			// remove attributes
			while (xnOldRoot.attributes.length > 0)
				xnOldRoot.removeAttribute(xnOldRoot.attributes(0).nodeName);

			// add attributes
			for (var n = 0; n < xnNewRoot.attributes.length; n++)
			{
				var xnAttr = xnNewRoot.attributes(n);
				xnOldRoot.setAttribute(xnAttr.nodeName, xnAttr.nodeValue);
			}
			// save xml
			_SaveXML(xmlOld, urlOld);
		}
		else
		{
			_SaveXML(xmlNew, urlOld);
		}
		_DelFile(urlNew);
	}
	catch (e)
	{
		alert("UpdateConfig ���ѡG" + e.message);
	}
}

function OnConfigInitialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		g_oConfig = new _DataSetObject(MDT.CONFIG); if (g_oConfig == null) throw (e);

		var strSystemDir = String(window.location.href).toLowerCase();
		var saEIC = strSystemDir.match(/(.:[\/\\][^\/\\]+[\/\\])(docnet[^\/\\]*[\/\\])formbinder[\/\\]/);
		if (!saEIC)
			return alert("���u���ؿ������T");
		g_oConfig.SetData("EIC_DIR", saEIC[1].replace(/\//g, "\\"));
		var dirEIC = (saEIC[1] + saEIC[2]).replace(/\//g, "\\");

		var iPos = strSystemDir.lastIndexOf("?");
		if (iPos != -1)
			strSystemDir = strSystemDir.substr(0, iPos);
		strSystemDir = GetFileDir(strSystemDir);
		strSystemDir = String(PathToUrl(strSystemDir)).toLowerCase();
		g_oConfig.SetData("SYSTEM_AP_DIRECTORY", strSystemDir);
		g_oConfig.SetData("SYSTEM_OFFLINE_DIRECTORY", "file:///" + dirEIC.replace(/\\/g, "/") + "formbinder/");

		MDT.TEST = dirEIC.indexOf("c:") == -1;
		var bOnline = (strSystemDir.toLowerCase()).substr(0, 7) == "http://" ? true : false;
		g_oConfig.SetData("ONLINE", bOnline);

		if (bOnline == false)
		{
			if (strSystemDir.search(g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY")) != 0) { alert("���u���ؿ������T"); return; }

			OnUpdateConfig(dirEIC + "module\\docn\\config\\", "config_system.xml", "config_system_init.xml");
			OnUpdateConfig(dirEIC + "formbinder\\xml\\config\\", "config.xml", "config_init.xml");
		}
		else
		{
			if (true != _FormbinderInstalled()) { return; }
		}

		g_oConfig.SetData("SYSTEM_FORMBINDER_VERSION", "");
		g_oConfig.SetData("SYSTEM_FORMBINDER_SP_VERSION", "");
		g_oConfig.SetData("SYSTEM_FORMBINDER_SERVER_VERSION", "");
		g_oConfig.SetData("SYSTEM_FORMBINDER_SERVER_SP_VERSION", "");

		g_oConfig.SetData("SYSTEM_MODULE_VERSION", "");
		g_oConfig.SetData("SYSTEM_MODULE_SP_VERSION", "");
		g_oConfig.SetData("SYSTEM_MODULE_SERVER_VERSION", "");
		g_oConfig.SetData("SYSTEM_MODULE_SERVER_SP_VERSION", "");

		var xmlTmp = _LoadXML(_G("SYSTEM_AP_DIRECTORY") + "xml/config/config.xml");
		if (xmlTmp == null)
			_NewError("Ū��config�պA�ɵo�Ϳ��~");

		with (xmlTmp.documentElement)
		{
			for (var i = 0; i < attributes.length; i++)
			{
				var oAttr = attributes.item(i);
				g_oConfig.SetData(oAttr.nodeName.toUpperCase(), oAttr.text);
			}

			for (var i = 0; i < childNodes.length; i++)
			{
				if (true != _SetDataByNode(childNodes.item(i)))
					_NewError("Ū��config�պA�ɵo�Ϳ��~");
			}
		}

		g_vModuleID = g_oQueryString.GetData("MID");
		g_vLoginID = g_oQueryString.GetData("UID");

		if (g_vModuleID == null || g_vModuleID == "" || g_vLoginID == null || g_vLoginID == "")
			throw (new Error(0, "�t�ΩI�s���ǤJ���T���պA�ѼơA���p���t�κ޲z��"));

		MDT.TEST = MDT.TEST || (g_vLoginID.toLowerCase() == "edittest");

		if (true != _SetModuleConfigData()) { return false; }

		var sSyncUrl = _G("SYSTEM_SYNC_RESOURCE_URL");
		if (sSyncUrl && sSyncUrl.search(/\/version\/version_home.htm$/i) != -1)
		{
			sSyncUrl = sSyncUrl.replace(/\/version\/version_home.htm$/i, "/");
			g_oConfig.SetData("KW_SERVER_URL", sSyncUrl);
		}

		g_oConfig.SetData("VERSION", _TC(_G("FORMBINDER_VERSION") + "." + _G("FORMBINDER_SP_VERSION"), "-", _G("FORMBINDER_SP_SUB_VERSION")));
		if (bInitialize)
			_Msg("���J�պA�Ѽ�", "�t�αҰ�");
		_SaveLog(true);

		var urlUserConfig = _GetUserConfigUrl();
		if (_LoadXML(UrlToPath(urlUserConfig)) == null && g_oQueryString.GetData("ApiMode") == "EXEC" && document.getElementById('elmSyncFrame') != null && _G("KW_SERVER_URL"))
		{
			if (bInitialize)
				_Msg("�U���ϥΪ̸�ơG" + g_vLoginID, "�t�αҰ�");
			var strCheckFile = UrlToPath(g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("USER_DIRURL") + g_vLoginID + "/version/logs/" + g_vLoginID + ".xml");
			g_coGDLocal.DeleteFile(strCheckFile);

			sSyncUrl = _G("KW_SERVER_URL") + "download_user_home.htm";
			sSyncUrl += "?MID=" + escape(g_vModuleID);
			sSyncUrl += "&UID=" + escape(g_vLoginID);

			document.getElementById("elmSyncFrame").src = sSyncUrl;
			OnDownloadUserData(bInitialize, 0);
		}
		else
			OnConfigInitializeEx(bInitialize);
	}
	catch (e)
	{
		_Alert(e, "CONFIG����إߥ���");
		return false;
	}
}

function OnDownloadUserData(bInitialize, nStep)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }
		window.status = g_vLoginID + "��ƤU����..." + (nStep++);
		if (nStep > 10)
		{
			if (bInitialize)
				_Msg("�U���ϥΪ̸�ƥ��ѡG" + g_vLoginID, "�t�αҰ�");
			_SavePrivateCookieData();
			_UserRegInstalled(_GetUserConfigUrl());
			return;
		}

		if (bInitialize != true)
			bInitialize = false;

		var strCheckFile = UrlToPath(g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("USER_DIRURL") + g_vLoginID + "/version/logs/" + g_vLoginID + ".xml");
		if (_IsLocalFileExist(strCheckFile) && _LoadXML(strCheckFile) != null)
		{
			g_oTimer = setTimeout("OnConfigInitializeEx(" + String(bInitialize) + ")", 10);
			g_coGDLocal.DeleteFile(strCheckFile);
			window.status = "";
			return;
		}
		g_oTimer = setTimeout("OnDownloadUserData(" + String(bInitialize) + ", " + nStep + ")", 1000);
	}
	catch (e)
	{
		_Alert(e, "USER����إߥ���");
		return false;
	}
}

function OnConfigInitializeEx(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		if (true != _SetUserConfigData()) { return false; }
		if (true != _SetExtraConfigData()) { return false; }
		if (true != _SetEnvConfigData()) { return false; }
		_LoadCookieData(); 		// Load COOKIE

		if (bInitialize)
		{
			_Msg("���JCONFIG�G" + g_vLoginID, "�t�αҰ�");
			if (_G("KW_SERVER_URL"))
			{
				g_xmlDoc = _NewXML(true);
				g_xmlDoc.onreadystatechange = OnLoadXMLFromServer;
				g_xmlDoc.load(_G("KW_SERVER_URL") + "maintain/xml/system_config.xml");
			}
			var sUserID = _HideID(g_vLoginID);
			window.parent.document.title = "���xWeb������s�@�t�� ver:" + _G("VERSION") + " (" + sUserID + ")";
			if (sUserID != g_vLoginID && _G("�b���޲z���x") != null && GetCookie("PROMPT_CHGID") != "N")
			{
				if (_MsgBox("�z���b�ϥΡu�����Ҧr���v���b���A���t�X�Ӹ�k�O�W�d�H���@�ӤH���p�A�бz�ܡu" + _G("�b���޲z���x", "�ڪ�E�F��") + "�v�ӽФ@�շs���ۭq�b���᭫�s�n�J�t�ΡA�çR���쨭���Ҧr�����b���C", "48|,|1=�T�@�w|,|0=�ڪ��D�F�A�U�����n�A��ܡC") == 0)
					SetCookie("PROMPT_CHGID", "N");
			}

			if (window.parent.hWndFlow && g_oQueryString.GetData("ApiMode") == null && _G("�u�Wñ�ֺ��F", "").search(/^http/i) != -1)
				window.parent.document.getElementById("hWndFlow").src = "../../../formbinder/flowmgr/docflow.htm";
			g_oTimer = setTimeout("OnRightInitialize(true)", 10);
			g_coDDDEng.PageOrder = _G("�����C�L�M�_����m", 1);
			if (_G("�����C�L�M�_���s��") == "Y")
				g_coDDDEng.bpStampNoSkip = 1;
		}
		OnObjectInitialize(true);

		var nMode = (_G("�y��I���C��") == "Y") ? 49 : 35;
		var sColor = (_G("�y��I���C��") == "Y") ? ".cssHeadNoteBg" : ".cssHeadNote";
		for (var n = 0; n <= nMode + 1; n++)
		{
			g_naModeColor[n] = _TransColorToInt(_GetCssText(sColor + n, "color", "#000000"));
			g_naModeBgColor[n] = _TransColorToInt(_GetCssText(sColor + n, "backgroundColor", "#FFFFFF"));
		}
	}
	catch (e)
	{
		_Alert(e, "CONFIG����إߥ���");
		return false;
	}
}

function OnRightInitialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		g_oRight = new _DataSetObject(); if (g_oRight == null) throw (e);

		var xnNode = g_oConfig.GetData("SYSTEM_USER_RIGHT");
		for (var idx = 0; idx < xnNode.childNodes.length; idx++)
		{
			var oNode = xnNode.childNodes.item(idx);
			g_oRight.SetData(oNode.nodeName, oNode.getAttribute("bEnable") == "Y" ? true : false);
		}

		if (g_oQueryString.GetData("UserRight") != null) g_oRight.SetData("RIGHT_ACCEPT", g_oQueryString.GetData("UserRight") == "1");

		g_oRight.SetData("RIGHT_DOC_STAMP_SET", false);
		if (g_oConfig.GetData("SYSTEM_DOC_STAMP") == "ENABLE") g_oRight.SetData("RIGHT_DOC_STAMP_SET", g_oQueryString.GetData("SetStamp") != "N");

		try
		{
			if (g_oConfig.GetData("SYSTEM_TIME_FROM") == "TimeService")
				g_coPDF.SyncTime();
		}
		catch (e)
		{
		}

		if (bInitialize) g_oTimer = setTimeout("OnMenuInitialize(true)", 10);
	}
	catch (e)
	{
		_FatalError("RIGHT����إߥ���", e); return false;
	}
}

function OnMenuInitialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		//		if (bInitialize)
		{
			// Load Menu
			var xmlPath, xmlMenu;
			var bBig = _G("�\��C�j�ϥ�") == "Y";
			if (bBig)
			{
				xmlPath = _TransformFile(_G("SYSTEM_MODULE_DIRECTORY"), "config/main/menu_w.xml");
				xmlMenu = _LoadXML(xmlPath);
				$("#elmMenuBar").height(24);
			}
			if (xmlMenu == null)
			{
				bBig = false;
				xmlPath = _TransformFile(_G("SYSTEM_MODULE_DIRECTORY"), "config/main/menu.xml");
				xmlMenu = _LoadXML(xmlPath);
			}
			if (xmlMenu == null)
				_NewError("�L�k���J���");

			// Test condition
			var xnNodeList = xmlMenu.selectNodes("//*[@check!='' or @test!='']");
			for (var n = 0; n < xnNodeList.length; n++)
			{
				var xnNode = xnNodeList[n];
				if (!_TestRelateData(xnNode.getAttribute("check")) || !_TestRelateData(xnNode))
					xnNode.setAttribute("display", "none");
				else
					xnNode.setAttribute("display", "");
			}

			// Add plugin menu
			var strPluginPath = g_oConfig.GetData("SYSTEM_AP_DIRECTORY") + "xml/plugins/";
			var saFile = g_coGDLocal.IsExist(4, UrlToPath(strPluginPath + "*.xml"));
			var strPluginName = g_oConfig.GetData("SYSTEM_OPTION_PLUGIN");
			if (strPluginName == null)
				strPluginName = "DOCVIEW|;|HDNOTE";
			if (saFile && strPluginName)
			{
				saFile = saFile.split("&");
				var saPluginName = strPluginName.split("|;|");
				for (var n = 0; n < saFile.length; n++)
				{
					var bPlugin = false;
					saFile[n] = saFile[n].toUpperCase();
					for (var x = 0; x < saPluginName.length; x++)
					{
						if (saPluginName[x] && saFile[n].indexOf(saPluginName[x]) == 0)
						{
							bPlugin = true;
							break;
						}
					}
					if (bPlugin == false)
						continue;

					var xmlPlugin = _LoadXML(strPluginPath + saFile[n]);
					if (xmlPlugin == null)
						continue;
					// Add menu
					var xnNodeList = xmlPlugin.selectNodes("/*/MENU");
					for (var x = 0; x < xnNodeList.length; x++)
					{
						var xnNode = xnNodeList[x];
						if (bBig)
						{
							_SetXA(xnNode, "out", _XA(xnNode, "out").replace(/cssMenu/, "cssMenuW"));
							_SetXA(xnNode, "over", _XA(xnNode, "over").replace(/cssMenuOver/, "cssMenuOverW"));
						}
						// Get addin position
						var xnParent = xmlMenu.documentElement;
						var strID = xnNode.getAttribute("_parent");
						if (strID != null)
						{
							xnNode.removeAttribute("_parent");
							xnParent = xmlMenu.selectSingleNode("//*[@id='" + strID + "']");
						}
						if (xnParent == null)
							continue;

						var xnBefore = null;
						var strID = xnNode.getAttribute("_before");
						if (strID != null)
						{
							xnNode.removeAttribute("_before");
							xnBefore = xnParent.selectSingleNode("*[@id='" + strID + "']");
						}
						xnParent.insertBefore(xnNodeList[x], xnBefore);
					}
					_DelXML(xmlPlugin);
				}
			}

			g_oMenu = new XMLMenu();
			g_oMenu.LoadXML(xmlMenu.documentElement);

			elmMenu.innerHTML = "";
			if (g_oMenu.GetObjectList(elmMenu) == null)
				throw (e);

			_DelXML(xmlMenu);
			var oMenu = g_oMenu.Find("elmMenuCollapse");
			if (oMenu)
				oMenu.Click();

			if (!bInitialize)
			{
				if (elmHdnMenu.menu)
				{
					elmHdnMenu.menu = null;
					LoadMenu(elmHdnMenu, "config/advance/hdn_menu" + _G("�\��CXML"));
				}
				if (elmClearMenu.menu)
				{
					elmClearMenu.menu = null;
					LoadMenu(elmClearMenu, "config/advance/clear_menu" + _G("�\��CXML"));
				}
				if (divVIEWMenu.menu)
				{
					divVIEWMenu.menu = null;
					LoadMenu(divVIEWMenu, "config/advance/hdn_view" + _G("�\��CXML"));
				}
			}
		}

		if (bInitialize)
		{
			_Msg("���JMENU", "�t�αҰ�");
			g_oTimer = setTimeout("OnScreenInitialize(true)", 10);
		}
		return;
	}
	catch (e)
	{
		_FatalError("MENU����إߥ���", e); return false;
	}
}

function OnScreenInitialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		//if (elmMenu.readyState == "complete" || elmMenu.readyState == 4)
		{
			if (document.body.offsetHeight <= 0)
				return;
			elmUser.innerText = "�ϥΪ̡G" + g_oConfig.GetData("SYSTEM_USER_USERNAME");

			_DoRefreshVersionInfo();

			var bShowLogo = g_oConfig.GetData("SYSTEM_LOGO_DISABLE") != "Y";
			if (bShowLogo == false)
			{
				elmLogo.style.display = "none";
				elmChr.style.display = "none";
			}
			else
			{
				elmLogo.style.display = "";
				elmChr.style.display = "";

				elmLogo.style.left = _N(elmBody.offsetLeft);
				//elmChr.style.left = _N(elmBody.offsetLeft);
			}

			if (bInitialize == true)
			{
				g_oTimer = setTimeout("OnResourceInitialize(true)", 10);
			}
			else
			{
				if (document.getElementById('elmImgIconHome') != null)
				{
					var vTitle = g_oConfig.GetData("SYSTEM_IMG_ICONHOME_TITLE");
					if (vTitle == null || vTitle == "") vTitle = "�s���ܡu��ѽs��@�q�A�ȥ��x�v����"
					elmImgIconHome.alt = vTitle;
				}

				//				elmMainFrame.style.width = "100%";

				elmFrame.style.visibility = "visible";
				elmMenu.style.visibility = "visible";

				elmUserDIV.style.display = "";
				//				elmHelp.style.display = "";

				iOnRefreshView(true, true);
				_Log("�i�t�θ��J�����j", 0x00DD00);

				window.onresize = _TimerToResetWindowBody;

				if (bInitialize != null) g_oTimer = setTimeout("OnProjectInitialize()", 10);
			}
		}
		//else
		//{
		//	if (bInitialize) g_oTimer = setTimeout("OnScreenInitialize(true)", 10);
		//}
	}
	catch (e)
	{
		_FatalError("�e����l����", e); return false;
	}
}

function OnResourceInitialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		//if (elmHTML.readyState == "complete" || elmHTML.readyState == 4)
		{
			if (g_oResource != null) g_oResource.Reset();
			else g_oResource = new _ResourceObject();

			if (g_oResource == null) throw (e);

			g_oResource.SetData("_COLLECTION", new _CollectObject());
			g_oWs = new WorkingStorage(g_oConfig, g_oResource.GetData("_COLLECTION"));

			var vSysAPI = g_oConfig.GetData("SYSTEM_API");
			if (vSysAPI != null && vSysAPI != "")
			{
				var aResourceEnable = window.parent == null ? null : (window.parent.MGR_aResourceEnable);
				if (aResourceEnable != null)
				{
					for (var key in aResourceEnable)
					{
						if (key != null && key != "") g_oResource.SetEnabled(key, aResourceEnable[key]);
					}
				}
			}

			if (bInitialize && _HasPlugin(3))
			{
				//$("#divDI").resizable({ handles: "s", helper: "bottom-helper", ghost: true, start: DoResizeStart, stop: DoResize });
				//$("#divLeft").resizable({ handles: "e", helper: "right-helper", ghost: true, start: DoResizeStart, stop: DoResize });
				//var nWidth = 1; //_N(GetCookie("HdnRightView"), 250);
				//elmOpinionFrame.style.display = "";
				//elmOpinionFrame.style.width = nWidth + "px";
				//nWidth = _N(elmFrame.clientWidth) - nWidth;
				//elmMainFrame.style.width = nWidth + "px";
				//elmFrameBody.style.width = nWidth + "px";
				//elmViewerDi.style.width = nWidth + "px";
				//elmDDDViewer.style.width = nWidth + "px";
				//elmFrameBody.style.overflowX = "auto";
				//document.getElementById('elmOpinionBody').src = "plugins/docinfo.htm";
				//document.getElementById('elmOpinionBody').style.borderLeft = "0px solid black";
				//document.getElementById('jsAdvView').src = "plugins/js/advance.js";
			}

			if (bInitialize) g_oTimer = setTimeout("OnFrameInitialize(true)", 10);
		}
		//else
		//{
		//	if (bInitialize) g_oTimer = setTimeout("OnResourceInitialize(true)", 10);
		//}

		if (g_oQueryString.GetData("ApiMode") != "EXEC" && g_oQueryString.GetData("ApiMode") != "PREVIEW" && g_oConfig.GetData("SYSTEM_THEME") == null)
		{
			_Alert("New�IWeb������s�@�t�Φ��s�����o�I�w��z�I��ϥΡC");
			_OpenDlgSelectFavorite();
		}

		//		var xmlPath = _TransformFile(g_oConfig.GetData("SYSTEM_MODULE_DIRECTORY"), "resource/res_theme.xml");
		//		if (g_oConfig.GetData("SYSTEM_THEME")  && _IsLocalFileExist(UrlToPath(xmlPath)))
		//		{
		//			var xmlDoc = _LoadXML(xmlPath);
		//			if (xmlDoc && xmlDoc.selectSingleNode("/*[@id='" + g_oConfig.GetData("SYSTEM_THEME") + "']") != null)
		//			{
		//				g_oConfig.SetData("SYSTEM_THEME_LINK", g_oConfig.GetData("SYSTEM_THEME"));
		//				if (document.getElementById("elmThemeLink") != null)
		//					elmThemeLink.style.display = "";
		//			}
		//		}
	}
	catch (e)
	{
		_FatalError("RESOURCE����إߥ���", e); return false;
	}
}

function OnFrameInitialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		g_oFrame = _CreateFrame(elmView, document); if (g_oFrame == null) throw (e);

		g_oResource.SetData("_FRAME", g_oFrame);

		if (bInitialize) g_oTimer = setTimeout("OnDocumentBarIntialize(true)", 10);
	}
	catch (e)
	{
		_FatalError("FRAME����إߥ���", e); return false;
	}
}

function OnDocumentBarIntialize(bInitialize)
{
	try
	{
		if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

		// Load Menu
		var xmlPath = _TransformFile(g_oConfig.GetData("SYSTEM_MODULE_DIRECTORY"), "config/main/document_list.xml");
		var xmlMenu = _LoadXML(xmlPath);
		g_oDocumentBar = new XMLMenu();
		g_oDocumentBar.LoadXML(xmlMenu.documentElement);
		if (g_oDocumentBar.GetObjectList(elmDocumentList) == null)
			throw (e);

		//		if (_HasPlugin(0))
		{
			xmlPath = _TransformFile(g_oConfig.GetData("SYSTEM_MODULE_DIRECTORY"), "config/main/reference_list.xml");
			xmlMenu = _LoadXML(xmlPath);
			g_oReferenceBar = new XMLMenu();
			g_oReferenceBar.LoadXML(xmlMenu.documentElement);
			elmReferenceList.style.display = "";
			elmReferenceList.width = "50%";
			elmDocumentList.width = "50%";
			if (g_oReferenceBar.GetObjectList(elmReferenceList) == null)
				throw (e);
		}

		if (bInitialize) g_oTimer = setTimeout("OnAddBookInitialize(true)", 10);
	}
	catch (e)
	{
		_FatalError("DOCUMENTBAR����إߥ���", e);
	}
}

function OnAddBookInitialize(bInitialize)
{
	if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

	if (g_coADBook != null)
	{
		try
		{
			g_oAdBook = new AdBookObject(g_coADBook);
			g_oAdBook.Initialize(g_oConfig.GetData("ADDBOOK_INI_URL"));

			if (g_oResource != null) g_oResource.SetData("_ADBOOK", g_oAdBook);

			g_vAdBookType = "ADDRBOOK";
		}
		catch (e)
		{
			_FatalError("�@�γq�T������إߥ���", e); return false;
		}
	}

	if (bInitialize)
	{
		_Msg("���JADBOOK", "�t�αҰ�");
		g_oTimer = setTimeout("OnScreenInitialize(false)", 10);
	}
}


function SyncAdbook(nCount)
{
	try
	{
		var bAutoSync = true;
		// �ˮ֮t����
		if (nCount >= _GN("SYSTEM_ADBOOK_SYNC_DIFF", 2000))
		{
			var sSyncUrl = _G("KW_SERVER_URL") + "adbook_sync/addrbook_sync_home.htm";
			sSyncUrl += "?MID=" + escape(g_vModuleID);
			sSyncUrl += "&UID=" + escape(g_oConfig.GetData("SYSTEM_USER_LOGINID"));
			sSyncUrl += "&DN=" + escape(g_oConfig.GetData("SYSTEM_USER_DN"));
			window.open(sSyncUrl, "_blank", "width=500, height=180, toolbar=no, menubar=no, scrollbars=no, status=no, titlebar=no, location=no, resizable=yes");
			bAutoSync = false;
		}
		if (bAutoSync && _G("SYSTEM_ADBOOK_SYNC_WEB") != "N")
			window.setTimeout("try{g_oAdBook.DownloadFromWeb();}catch(e){}", 300000);
	}
	catch (e)
	{
		_Alert(e, "�@�γq�T���P�B��s����");
	}
}

var g_xmlOpinionLex = null;
function OnLoadXMLFromServer()
{
	if (g_xmlDoc == null || g_xmlDoc.readyState != 4)
		return;

	if (g_xmlDoc.documentElement != null)
	{
		try
		{
			// Default CONFIG
			var saMap = { "SYSTEM_FORMBINDER_SERVER_URLDIR": "", "SYSTEM_MODULE_SERVICE_URLDIR": "", "SYSTEM_AP_MAIN_URL": "mgr/mgrindex.htm", "SYSTEM_API_MGR_JS_URL": "mgr/mgr.js", "SYSTEM_FORM_ACCEPTOR_RESOURCE": "EIC_SYSTEM_ACCEPTORLIST", "SYSTEM_DOC_MAILMD_RESOURCE": "EIC_SYSTEM_MAILMD", "SYSTEM_OPN_LIST": "", "SYSTEM_DOCINFO_FILENO": "DISABLE", "SYSTEM_DOCINFO_FILELIFE": "DISABLE", "SYSTEM_SYNC_RESOURCE_URL": "", "SYSTEM_THEME_CURRENT": "" };

			// Load config_system.xml
			var urlSysConfig = _G("SYSTEM_OFFLINE_DIRECTORY") + _G("MODULE_DIRURL") + g_vModuleID.toLowerCase() + "/config/config_system.xml";
			var xmlConfig = _LoadXML(urlSysConfig);
			var xnRoot = xmlConfig.documentElement;
			var xnNode, xnTmp, sName;

			// Check default config
			for (sName in saMap)
			{
				xnTmp = xnRoot.selectSingleNode(sName);
				if (xnTmp == null && saMap[sName])
					_AppendChild(xnRoot, sName, saMap[sName]);
			}
			// Get current config & remove duplicate
			var xnList = xmlConfig.selectNodes("/*/*");
			for (var n = 0, nLen = xnList.length; n < nLen; n++)
			{
				xnNode = xnList[n];
				sName = xnNode.nodeName;
				if (saMap[sName] == null) // custom
					saMap[sName] = false;
				else if (saMap[sName] === false) // duplicate
				{
					xnTmp = xnRoot.selectSingleNode(sName);
					xnRoot.removeChild(xnTmp);
				}
			}
			// Set config
			xnList = g_xmlDoc.selectNodes("/*/*[not(@hidden) or @hidden!='1']");
			for (var n = 0, nLen = xnList.length; n < nLen; n++)
			{
				xnNode = xnList[n];
				sName = xnNode.nodeName;
				xnTmp = xnRoot.selectSingleNode(sName);
				if (xnNode.text.indexOf("@base_url@") != -1)
					xnNode.text = xnNode.text.replace(/@base_url@/, _G("KW_SERVER_URL"));

				if (xnNode.getAttribute("now") != "2")
				{
					if (saMap[sName] == null) // new
					{
						xnRoot.insertBefore(xnNode.cloneNode(true), xnRoot.firstChild);
						saMap[sName] = true;
					}
					else if (saMap[sName] === true) // duplicate
					{
						xnRoot.insertBefore(xnNode.cloneNode(true), xnRoot.firstChild);
						xnRoot.removeChild(xnTmp);
					}
					else if (saMap[sName] === false) // exist
					{
						xnRoot.replaceChild(xnNode.cloneNode(true), xnTmp);
						saMap[sName] = true;
					}
				}
				// direct set
				if (xnNode.getAttribute("now"))
					_SetDataByNode(xnNode);
			}

			// Clear
			for (sName in saMap)
			{
				if (saMap[sName] !== false)
					continue;
				xnTmp = xnRoot.selectSingleNode(sName);
				if (xnTmp != null)
					xnRoot.removeChild(xnTmp);
			}

			_SaveXML(xmlConfig, urlSysConfig);
			_DelXML(xmlConfig);
			g_xmlDoc = _DelXML(g_xmlDoc);

			// Sync addrbook
			if (_G("SYSTEM_ADBOOK_SYNC_CHK") != "N")
			{
				var strSyncDay = _DT(new Date(), "yyyy-mm-dd");
				if (strSyncDay != GetCookie("AddrBookSyncDay"))
				{
					var sao = new SyncAdbookObject(g_coADBook);
					if (sao.initial(g_coGDLocal, g_vLoginID))
						sao.getAdbookDiffCount(SyncAdbook);
					SetCookie("AddrBookSyncDay", strSyncDay);
				}
				else
					SyncAdbook(0);
			}
			else
				SyncAdbook(0);
		}
		catch (e)
		{
			_Err(e, "�U��CONFIG");
		}
	}

	try
	{
		var sUrl = _G("SYSTEM_COMMON_WORDBASE_URL");
		if (sUrl)
		{
			if (_G("SYSTEM_COMMON_WORDBASE_URL_EX"))
				sUrl = _G("SYSTEM_COMMON_WORDBASE_URL_EX");
			else
				sUrl = _G("SYSTEM_MODULE_SERVICE_URLDIR") + sUrl;

			g_xmlLex = _NewXML(true);
			g_xmlLex.async = true;
			g_xmlLex.onreadystatechange = _SaveCommonLexXMLFromServer;
			g_xmlLex.load(sUrl);
		}
	}
	catch (e) { }

	try
	{
		var sUrl = _G("SYSTEM_COMMON_ORG_WORDBASE_URL");
		if (sUrl)
		{
			g_xmlOrgLex = g_coGDLocal.NewXML();
			g_xmlOrgLex.async = true;
			g_xmlOrgLex.onreadystatechange = _SaveCommonOrgLexXMLFromServer;
			g_xmlOrgLex.load(_G("SYSTEM_MODULE_SERVICE_URLDIR") + sUrl);
		}
	}
	catch (e) { }

	try
	{
		var sUrl = _G("SYSTEM_COMMON_OPINION_WORDBASE_URL");
		if (sUrl)
		{
			if (_G("SYSTEM_COMMON_OPINION_WORDBASE_URL_EX"))
				sUrl = _G("SYSTEM_COMMON_OPINION_WORDBASE_URL_EX");
			else
				sUrl = _G("SYSTEM_MODULE_SERVICE_URLDIR") + sUrl;

			g_xmlOpinionLex = g_coGDLocal.NewXML();
			g_xmlOpinionLex.async = true;
			g_xmlOpinionLex.onreadystatechange = _SaveCommonOpinionLexXMLFromServer;
			g_xmlOpinionLex.load(sUrl);
		}
	}
	catch (e) { }

	try
	{
		if (_G("�̷s����"))
		{
			g_xmlDoc = _NewXML(true);
			g_xmlDoc.onreadystatechange = ShowHotNews;
			g_xmlDoc.load(_G("�̷s����"));
		}
	}
	catch (e) { }

	_CheckFormBinderVersionWithServer();
}

function OnProjectInitialize(bInitialize)
{
	if (g_oTimer != null) { clearTimeout(g_oTimer); g_oTimer = null; }

	//if (elmDocumentList.readyState == "complete" || elmDocumentList.readyState == 4)
	{
		try
		{
			var strMethod = g_oQueryString.GetData("Method");

			if (strMethod == null || strMethod == "") //cancel
			{
				g_oQueryString.SetData("SetDocDataOnload", null);

				// �^�_�̫᪺�s�説�A
				var strBackupDir = _GetBackupDir(0, false, "���R�W");
				if (strBackupDir != null)
				{
					var strDir = UrlToPath(strBackupDir);
					var strFile = strDir + "main.wsp";
					if (g_coGDLocal.IsExist(0, strFile) == true)
					{
						if (API_NewLocalProject(strDir.replace(/\\$/, "")) && g_oProject != null)
							g_oProject.m_strBackupDir = strBackupDir;
					}
				}
				return;
			}

			if (strMethod.toUpperCase() == "OPEN")
			{
				var strPrjOpenMode = String(g_oQueryString.GetData("PrjOpenMode")).toUpperCase();
				if (strPrjOpenMode == "LOCALPRJ")
				{
					var strPrjLocalURL = g_oQueryString.GetData("PrjLocalURL");
					var strCmdURL = g_oQueryString.GetData("PrjCmdURL");
					var strPrjItemID = g_oQueryString.GetData("PrjItemID");

					if ((strPrjLocalURL == null || strPrjLocalURL == ""))
					{
						g_oQueryString.SetData("SetDocDataOnload", null); throw (e);
					}

					if (strCmdURL == null || strCmdURL == "")
					{
						strCmdURL = "common/dialog/localstgpage.htm";
					}

					if (g_oQueryString.GetData("AsNew"))
					{
						if (API_NewLocalProject(strPrjLocalURL) == false) throw (e);
					}
					else
					{
						if (API_OpenLocalProject(strPrjLocalURL, strPrjItemID) == false) throw (e);
					}
					//if( _OpenProjectByLocalFile(strPrjLocalURL, strCmdURL, strPrjItemID) == false ) throw(e);
				}
				else if (strPrjOpenMode == "SERVERPRJ")
				{
					var strPrjPoolID = g_oQueryString.GetData("PrjPoolID");
					var strPrjItemID = g_oQueryString.GetData("PrjItemID");
					var urlFileSvr = g_oQueryString.GetData("urlFileSvr");

					if (API_OpenProjectByPrjPoolID(strPrjPoolID, urlFileSvr, strPrjItemID) == false) throw (e);
				}
				else if (strPrjOpenMode == "SERVERDOC")
				{
					var strDocPoolID = g_oQueryString.GetData("DocPoolID");
					var urlFileSvr = g_oQueryString.GetData("urlFileSvr");

					if (API_OpenProjectByDocPoolID(strDocPoolID, urlFileSvr) == false) throw (e);
				}

				var strExchgInfoURL = g_oQueryString.GetData("ImportExchgInfo");
				if (g_oProject != null && strExchgInfoURL != "" && strExchgInfoURL != null)
				{
					var oArg = new Array();
					oArg["METHOD"] = "ImportExchgInfo";
					oArg["ExtraData"] = new Array(strExchgInfoURL, g_oProject.m_oDocList, g_oResource);

					oArg["_COLLECTION"] = g_oResource.GetData("_COLLECTION");

					var bExecOK = _ShowModalDialog("common/dialog/command_dlg_exec.htm", oArg, "dialogHeight: 220px; dialogWidth: 360px; scroll: yes; status: no; resizable: yes");
					if (bExecOK == true)
					{
						g_oProject.SetPrjectFlag(null, true, null);
						if (g_oFrame.CloseDocument() == false) throw (e);
						iOnRefreshView(false, false);
					}
				}
			}
			else if (strMethod.toUpperCase() == "IMPORT")
			{
				var strFileUrl = g_oQueryString.GetData("FileName");
				var strFileType = g_oQueryString.GetData("FileType");

				if (strFileUrl == null || strFileUrl == "")
				{
					g_oQueryString.SetData("SetDocDataOnload", null);
					/* _NewError("���䴩�ӶפJ�覡�A�и߰ݨt�κ޲z��"); */throw (e);
				}

				if (strFileUrl.substr(0, 7) == "http://");
				else
				{
					strFileUrl = "file:///" + strFileUrl;
				}

				if (strFileType.toUpperCase() == "DI")
				{
					if (_ImportProjectByDI(strFileUrl, true) == false) throw (e);
				}
				else
				{
					_NewError("�t�ζפJ���䴩���ɮ׮榡");
				}
			}
			else if (strMethod.toUpperCase() == "TRANSLATE")
			{
				var strFileUrl = g_oQueryString.GetData("FileName");
				var strFileType = g_oQueryString.GetData("FileType");

				if (strFileUrl == null || strFileUrl == "") { g_oQueryString.SetData("SetDocDataOnload", null); return; }

				var bTransAutoClose = g_oQueryString.GetData("TransAutoClose") == true;

				try
				{
					if (strFileUrl != null && strFileUrl != "")
					{
						if (strFileType.toUpperCase() == "DAT")
						{
							var strSdiTemplFile = g_oQueryString.GetData("SdiTemlFile"); //GetQueryString("SdiTemlFile", null);
							var strBinderFile = g_oQueryString.GetData("BinderFile"); //GetQueryString("BinderFile", null);

							var strTransPrjLocalSaveDIR = g_oQueryString.GetData("TransPrjLocalSaveDIR");
							var strFileCmdURL = g_oQueryString.GetData("DefaultFileCmdURL");

							var strTransPrjLocalLogFile = g_oQueryString.GetData("TransPrjLocalLogFile");
							var strTransAction = g_oQueryString.GetData("TransAction");

							if (strTransAction == "PRINT" || strTransAction == "TRANSLATE") bTransAutoClose = true;
							else if (strTransAction == "PREVIEW" || strTransAction == "PREVIEWPRINT") bTransAutoClose = false;

							var bLoad = ((strTransAction != "" && strTransAction != null) || (strTransPrjLocalSaveDIR != null && strTransPrjLocalSaveDIR != ""));

							if (TranslateProjectByMultiDat(strFileUrl, strSdiTemplFile, strBinderFile, bLoad, strTransPrjLocalSaveDIR, strFileCmdURL, strTransPrjLocalLogFile) == false) throw (e);

							if (strTransAction == "TRANSLATE") alert("���ɧ@�~���槹��");
						}
						else
							_NewError("�t�ζפJ���䴩���ɮ׮榡");
					}
					else
						_NewError("���䴩�ӶפJ�覡�A�и߰ݨt�κ޲z��");
				}
				catch (e) { _Alert(e, "���ɵo�Ϳ��~"); window.close(); return; }
				if (bTransAutoClose) { window.close(); return; }
			}

			var bReadOnly = (g_oQueryString.GetData("ReadOnly") == "Y" || g_oQueryString.GetData("ReadOnly") == "R");
			if (bReadOnly) _SetGobalProjectReadOnly(true);
		}
		catch (e)
		{
			iOnCloseProject(false, true);
			_Alert(e, "���J�ɮץ���");
		}
	}
	//else
	//{
	//	if (bInitialize) g_oTimer = setTimeout("OnProjectInitialize()", 10);
	//}
}

//: initial-subscript

function _CallWinIeEnvInitialize()
{
	try
	{
		var adoConnect = new ActiveXObject("ADODB.CONNECTION");
		if (adoConnect.Version < "2.5") throw (e);
	}
	catch (e)
	{
		alert("�A���t�Υ������w�˷L�n���q�ҵo�檺ADO����(MDAC 2.5 ���H�W)�A\n�Ы�[�T�w]��Ѿ\�w�˸ɱϤ�k�I���¡I�I");
		window.location.href = "help/autoexammdac/autoexammdac.htm"; return false;
	}

	try
	{
		var xmlHttp = new ActiveXObject("microsoft.XMLHTTP");
		if (xmlHttp == null) throw (e);
	}
	catch (e)
	{
		alert("�A���t�Υ������w�˷L�n���q�ҵo�檺MSXML����(2.5 ��)�A\n�Ы�[�T�w]��Ѿ\�w�˸ɱϤ�k�I���¡I�I");
		window.location.href = "help/autoexamxml/autoexamxml.htm"; return false;
	}

	return true;
}

function _CallCompObjectInitialize()
{
	try
	{
		if (g_coGDLocal.readyState != 4) throw (new Error(-1, "GDFile����إߥ���"));

		if (document.getElementById('g_coParaEdit') != null)
		{
			if (g_coParaEdit.readyState != 4) throw (new Error(-1, "ParaEdit����إߥ���"));
		}
		if (document.getElementById('g_coSignature') != null)
		{
			if (g_coSignature.readyState != 4) throw (new Error(-1, "Signature����إߥ���"));
		}
		if (document.getElementById('g_coPDF') != null)
		{
			if (g_coPDF.readyState != 4) throw (new Error(-1, "PDF����إߥ���"));
		}
		if (document.getElementById('g_coDDDEng') != null)
		{
			if (g_coDDDEng.readyState != 4) throw (new Error(-1, "DddEngine����إߥ���"));
		}
		if (document.getElementById('g_coADBook') != null)
		{
			if (g_coADBook.readyState != 4) throw (new Error(-1, "AddrBook����إߥ���"));
		}
	}
	catch (e)
	{
		_Alert(e, "����s�@�����s�{�ǩ|�������A�������s�}���A�H Administrator �� Power User �v���n�J�A���s�i�J����s�@�����t�Χ�s");
		return false;
	}

	return true;
}

function _CallDddEngineInitialize(coDDDEng)
{
	if (coDDDEng == null) return false;

	try
	{
		coDDDEng.enableExFont(false);
		coDDDEng.setFontAutoDirSamples(1, "�K�w�w��");

		coDDDEng.printDialogDefault("�@��h�o", 0, 0);
		coDDDEng.printDialogDefault("�M�_��", 1, 0);
		coDDDEng.printDialogDefault("�C�L���O", 0, 0);
	}
	catch (e)
	{
		_Alert(e, "���x�t�Τ���DddEngine��l�Ƶo�Ϳ��~");
		return false;
	}

	return true;
}

function _CallGDLocalInitialize(coGDLocal)
{
	if (coGDLocal == null) return false;

	try
	{
		if (String(window.location.href.substr(0, 7)).toLowerCase() == "http://")
		{
			coGDLocal.init(window, g_vGDRightCode);
		}
		else
			coGDLocal.init(window, "");
	}
	catch (e)
	{
		_Alert(e, "���x�t�Τ���GDLocal��l�Ƶo�Ϳ��~");
		return false;
	}

	return true;
}

function _FormbinderInstalled()
{
	try
	{
		var bInstalled = true;
		try
		{
			var urlFormbinder = g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + "xml/config/config.xml";

			var xmlConfig = _LoadXML(urlFormbinder);
			if (xmlConfig == null) throw (e)
		}
		catch (e)
		{
			bInstalled = false;
		}

		if (bInstalled == false)
		{
			alert("�z�|���w��Web������s�@�t�ΡA�Ы�[�T�w]��A�t�αN�޾ɱz�w�ˡA����!!");
			window.location.href = "welcome.htm"; return false;
		}

		return true;
	}
	catch (e)
	{
		_Alert(e);
	}
	return false;
}

function _UserRegInstalled(urlUserConfig, bAutoReg)
{
	if (bAutoReg != false) bAutoReg = true;
	try
	{
		var pathUserConfig = UrlToPath(urlUserConfig);
		if (_IsLocalFileExist(pathUserConfig) == false)
		{
			if (bAutoReg)
			{
				try
				{
					var urlSysConfig = g_oConfig.GetData("SYSTEM_AP_DIRECTORY") + g_oConfig.GetData("MODULE_DIRURL") + g_vModuleID.toLowerCase() + "/config/config_system.xml";
					var xmlSys = _LoadXML(urlSysConfig);
					if (xmlSys == null) throw (e);

					var xnService = xmlSys.documentElement.selectSingleNode("SYSTEM_MODULE_SERVICE_URLDIR");
					if (xnService == null) throw (e);

					var urlUserReg = xnService.text + "user/welcome.htm";

					alert("�ϥΪ̱b���|���إߡA�Ы�[�T�w]��A�t�αN���z�޾ɦw�˨ϥΪ̱b��");
					if (g_oQueryString.GetData("ApiMode") === "EXEC")
						window.open(urlUserReg, "_blank", "width=" + window.screen.availWidth + ", height=" + window.screen.availHeight + ", menubar=yes, toolbar=yes, scrollbars=yes, status=yes, resizable=yes");
					else
						window.parent.location.href = urlUserReg;
				}
				catch (e)
				{
					alert("�ϥΪ̱b���|���إߡG�t�Τ޾ɦw�˨ϥΪ̱b���ɧ䤣��b���A�ȳ]�w�պA��ơA�и߰ݱz���t�κ޲z��");
				}
			}

			return false;
		}
	}
	catch (e)
	{
		return false;
	}

	return true;
}

function _LoadUserLoginBean(urlUserLoginBean)
{
	var bLoadReady = false;
	try
	{
		if (urlUserLoginBean != null && urlUserLoginBean != "")
		{
			var pathUserLoginBean = UrlToPath(urlUserLoginBean);
			if (_IsLocalFileExist(pathUserLoginBean) == true)
			{
				try
				{
					var xmlTmp = _LoadXML(urlUserLoginBean);
					if (xmlTmp != null)
					{
						var xnTmp = xmlTmp.documentElement;
						var xnBuff = xnTmp.selectSingleNode("LOGIN_TIME");
						if (xnBuff != null)
						{
							var dtNow = new Date();
							var dtLogin = new Date(xnBuff.text);

							var mSec = dtNow.getTime() - dtLogin.getTime();
							if (mSec <= 30000 && mSec > 0)
							{
								xnBuff = xnTmp.selectSingleNode("USER_PWD");
								if (xnBuff != null) g_strDecPwdUserConfig = xnBuff.text;

								bLoadReady = true;
							}
						}
					}
				}
				catch (e) { }

				g_coGDLocal.DeleteFile(pathUserLoginBean);
			}
		}
	}
	catch (e) { }

	return bLoadReady;
}

function _UserReloadConfig()
{
	try
	{
		var urlSysConfig = g_oConfig.GetData("SYSTEM_AP_DIRECTORY") + g_oConfig.GetData("MODULE_DIRURL") + g_vModuleID.toLowerCase() + "/config/config_system.xml";

		var xmlSys = _LoadXML(urlSysConfig);
		if (xmlSys == null) throw (e);

		var xnService = xmlSys.documentElement.selectSingleNode("SYSTEM_MODULE_SERVICE_URLDIR");
		if (xnService == null) throw (e);

		var urlUserReg = xnService.text + "user/welcome.htm?act=reload";

		_SavePrivateCookieData();

		alert("�{���w��s�A�t�ΤΨϥΪ̳]�w�ɶ����s�]�w�A�Ы�[�T�w]���A�t�αN���޾ɱz�����]�w");
		window.top.location.href = urlUserReg;
	}
	catch (e)
	{
		return false;
	}

	return true;
}

function _SavePrivateCookieData()
{
	try
	{
		if (g_vLoginID == "" || g_vLoginID == null) return false;

		var bOK = true;
		var bOpen = false;
		try
		{
			g_coGDLocal.CreateDir("c:\\Temp");

			var xmlInfo = _LoadText("<INSTALL/>", "big5");
			if (xmlInfo == null)
				return null;

			var xnUSerID = xmlInfo.createElement("SYSTEM_USER_LOGINID");
			xnUSerID.text = g_vLoginID;

			xmlInfo.documentElement.appendChild(xnUSerID);

			g_coGDLocal.SaveXML(xmlInfo, "c:\\temp\\docncookie.xml");
			/*
			var strFilePath = "c:\\temp\\docncookie.txt";
			g_coGDLocal.Save(strFilePath); bOpen = true;

			strLine = "SYSTEM_USER_LOGINID=" + g_userID + "\r\n";
			g_coGDLocal.WriteLn(strLine);
			*/
		}
		catch (e) { bOK = false; }

		if (bOpen) g_coGDLocal.WriteEOF();

		return bOK;
	}
	catch (e) { }
}

function _ModuleInstalled(urlSysSererConfig)
{
	try
	{
		var urlSysConfig = g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("MODULE_DIRURL") + g_vModuleID.toLowerCase() + "/config/config_system.xml";

		var pathSysConfig = UrlToPath(urlSysConfig);
		if (_IsLocalFileExist(pathSysConfig) == false)
		{
			if (g_oConfig.GetData("ONLINE") == true)
			{
				try
				{
					var xmlSys = _LoadXML(urlSysSererConfig);
					if (xmlSys == null) throw (e);

					var xnService = xmlSys.documentElement.selectSingleNode("SYSTEM_MODULE_SERVICE_URLDIR");
					if (xnService == null) throw (e);

					var urlInstallModule = xnService.text + "install/welcome.htm?act=module";

					alert("�t�μҲյ{���|���w�ˡA�Ы�[�T�w]��A�t�αN���z�޾ɦw�˨t�μҲյ{��");
					window.location.href = urlInstallModule;
				}
				catch (e)
				{
					alert("�t�μҲյ{���|���إߡG�t�Τ޾ɦw�˨t�μҲյ{���ɧ䤣��]�w�պA��ơA�и߰ݱz���t�κ޲z��");
				}
			}
			else
			{
				alert("�t�μҲյ{���|���إߡA�и߰ݱz���t�κ޲z��");
			}

			return false;
		}
	}
	catch (e)
	{
		return false;
	}

	return true;
}

function _SetUserConfigData()
{
	g_vModuleID = g_oQueryString.GetData("MID");
	g_vLoginID = g_oQueryString.GetData("UID");

	if (g_vModuleID == null || g_vModuleID == "" || g_vLoginID == null || g_vLoginID == "")
		_NewError("�t�ΩI�s���ǤJ���T���պA�ѼơA���p���t�κ޲z��");

	var urlUserConfig = _GetUserConfigUrl();
	try
	{
		if (_UserRegInstalled(urlUserConfig) == false) return null;

		_LoadUserLoginBean(GetFileDir(urlUserConfig) + "userloginbean");

		var xmlTmp = _ReadLocalUserConfigXML(null, urlUserConfig);
		if (xmlTmp == null) throw (e);

		if (xmlTmp.documentElement.getAttribute("reload") == "FORCE")
		{
			_UserReloadConfig(); return null;
		}

		with (xmlTmp.documentElement)
		{
			for (var i = 0; i < attributes.length; i++)
			{
				var oAttr = attributes.item(i);
				g_oConfig.SetData(oAttr.nodeName.toUpperCase(), oAttr.text);
			}

			for (var i = 0; i < childNodes.length; i++)
			{
				if (true != _SetDataByNode(childNodes.item(i))) throw (e);
			}

		}

		xmlTmp = _LoadXML(urlUserConfig.replace(/user\.xml$/i, "unit.xml"));
		if (xmlTmp != null)
		{
			var xnNodeList = xmlTmp.selectNodes("/*/*");
			for (var n = 0; n < xnNodeList.length; n++)
			{
				_SetDataByNode(xnNodeList[n]);
			}
		}
	}
	catch (e)
	{
		_NewError("Ū���ϥΪ̲պA�ɵo�Ϳ��~�A�Э��s�n�����x�b���A�Ȧ��A���A�t�αN���s���o�z���ӤH�պA��");
	}

	var vModuleID = g_oConfig.GetData("SYSTEM_USER_MODULE_ID");
	if (vModuleID != g_vModuleID)
		_NewError("�ϥΪ̦��A���ҲհѼƻP�ǤJ�ѼƤ��P�A���p���t�κ޲z��");
	var vUserID = g_oConfig.GetData("SYSTEM_USER_LOGINID");
	if (vUserID.toLowerCase() != g_vLoginID.toLowerCase())
		_NewError("�ϥΪ̱b���ѼƻP�ǤJ�ѼƤ��P�A���p���t�κ޲z��");

	g_oConfig.SetData("SYSTEM_LOGIN_MODULE_ID", g_vModuleID);
	g_oConfig.SetData("SYSTEM_LOGIN_USER_ID", g_vLoginID);

	g_oConfig.SetData("SYSTEM_USER_CONFIG_URL", urlUserConfig);
	return true;
}

function _LoadCookieData(bLoadDef)
{
	var xml = null;
	var urlCookie = null;
	if (bLoadDef)
	{
		urlCookie = _G("SYSTEM_USER_COOKIE_DIR").replace(/\.xml$/i, "_def.xml");
		if (_FileExists(urlCookie))
			xml = _LoadXML(urlCookie);
	}
	else
	{
		urlCookie = _ToPath(_G("SYSTEM_USER_DIRECTORY") + "config/cookie.xml");
		_SetG("SYSTEM_USER_COOKIE_DIR", urlCookie);
		g_oCookie = new _DataSetObject(MDT.CONFIG);
		xml = _LoadXML(urlCookie);
	}

	if (xml != null)
	{
		var xnList = _ToList(xml, "/*/*");
		for (var n = 0, nLen = xnList.length; n < nLen; n++)
		{
			try
			{
				var xnTmp = xnList[n];
				var sName = xnTmp.nodeName;
				if (sName == "COOKIE")
					sName = xnTmp.getAttribute("name");

				for (var x = 0, xLen = xnTmp.attributes.length; x < xLen; x++)
				{
					var oAttr = xnTmp.attributes[x];
					if (oAttr.nodeName != "name")
						g_oCookie.SetData(sName + "/@" + oAttr.nodeName, oAttr.text);
				}
				if (xnTmp.firstChild && xnTmp.firstChild.nodeType == 1)
					g_oCookie.SetData(sName, xnTmp.firstChild);
				else
					g_oCookie.SetData(sName, xnTmp.text);
			}
			catch (e)
			{
			}
		}
		if (bLoadDef)
		{
			_SaveCookieData();
			_DelFile(urlCookie);
		}
		else
			_LoadCookieData(true);
	}
}


function _SaveCookieData()
{
	var urlCookie = _G("SYSTEM_USER_COOKIE_DIR");
	if (g_oCookie && urlCookie)
	{
		var xml = _LoadXML(_ToPath(_G("SYSTEM_AP_DIRECTORY") + "xml/template/empty.xml"));
		var xnRoot = xml.documentElement;
		var saCookie = g_oCookie.m_aData;
		var sa, xnTmp;
		for (var key in saCookie)
		{
			try
			{
				if (saCookie[key] == null)
					continue;
				sa = key.split("/@");
				xnTmp = _ToChild(xnRoot, sa[0]);
				if (xnTmp == null)
					xnTmp = _AppendChild(xnRoot, sa[0]);
				if (sa[1])	// Attribute
					xnTmp.setAttribute(sa[1], saCookie[key]);
				else if (saCookie[key].nodeType === 1)	// XML Node
					xnTmp.appendChild(saCookie[key]); //.cloneNode(true));
				else
					xnTmp.text = saCookie[key];
			}
			catch (e)
			{
			}
		}
		_SaveXML(xml, urlCookie);
	}
}

function _SetModuleConfigData()
{
	var urlSysConfig = g_oConfig.GetData("SYSTEM_AP_DIRECTORY") + g_oConfig.GetData("MODULE_DIRURL") + g_vModuleID.toLowerCase() + "/config/config_system.xml";
	try
	{
		if (_ModuleInstalled(urlSysConfig) == false) return null;

		var oXmlDocTmp = _LoadXML(urlSysConfig);
		if (oXmlDocTmp == null) throw (e);

		with (oXmlDocTmp.documentElement)
		{
			for (var i = 0; i < attributes.length; i++)
			{
				var oAttr = attributes.item(i);
				g_oConfig.SetData(oAttr.nodeName.toUpperCase(), oAttr.text);
			}

			for (var i = 0; i < childNodes.length; i++)
			{
				if (true != _SetDataByNode(childNodes.item(i))) throw (e);
			}
		}
	}
	catch (e)
	{
		throw (new Error(-1, "Ū�����A���պA�ɵo�Ϳ��~�A���p���t�κ޲z��"));
	}

	try
	{
		g_oConfig.SetData("SYSTEM_MODULE_CONFIG_URL", urlSysConfig);

		var strTmp = g_oQueryString.GetData("SYSAPI");
		g_oConfig.SetData("SYSTEM_API", strTmp == null ? "" : strTmp);
	}
	catch (e)
	{
		throw (new Error(-1, "Ū�����A���պA�ɵo�Ϳ��~�A���p���t�κ޲z��"));
	}

	return true;
}

function _SetExtraConfigData()
{
	try
	{
		var strTmp = "";

		var vSysAPI = g_oConfig.GetData("SYSTEM_API");
		if (vSysAPI != null && vSysAPI != "")
		{
			var aConfig = window.parent == null ? null : window.parent.MGR_aConfigData;
			if (aConfig != null)
			{
				for (var key in aConfig)
				{
					if (key != "" && (typeof (aConfig[key]) == "string" || typeof (aConfig[key]) == "boolean" || typeof (aConfig[key]) == "number" || typeof (aConfig[key]) == "object"))
						g_oConfig.SetData(key, aConfig[key]);
				}
			}

			var aViewItem = window.parent == null ? null : (window.parent.MGR_aViewItem);
			g_oConfig.SetData("SYSTEM_VIEWITEM_LIST", aViewItem);
		}

		var xnTmp = g_oConfig.GetData("SYSTEM_API_INI");
		if (xnTmp != null)
		{
			strTmp = xnTmp.getAttribute("src");
			if (strTmp != null && strTmp != "")
			{
				var oDataIni = new DataIniObject(g_coGDLocal);
				if (oDataIni.LoadIni(strTmp))
				{
					var strTmp2 = xnTmp.getAttribute("section");
					if (strTmp2 != "" && strTmp2 != null)
					{
						for (var i = 0; i < xnTmp.childNodes.length; i++)
						{
							var xnTmp3 = xnTmp.childNodes.item(i);

							var strTmp3 = oDataIni.GetDataString(strTmp2, xnTmp3.nodeName);
							g_oConfig.SetData(xnTmp3.nodeName, strTmp3);
						}
					}
				}
			}
		}

		strTmp = g_oQueryString.GetData("DocStamp");
		if (strTmp != null && strTmp != "") g_oConfig.SetData("SYSTEM_DOC_STAMP", strTmp);

		return true;
	}
	catch (e)
	{
		throw (new Error(-1, "�t��Ū���~���պA�ɵo�Ϳ��~�A���p���t�κ޲z��"));
	}
}

function _SetEnvConfigData()
{
	var vLoginID = g_vLoginID.toLowerCase();
	var vModuleID = g_vModuleID.toLowerCase();

	var vData = null;
	try
	{
		vData = g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("USER_DIRURL") + vLoginID + "/" + vModuleID + "/";
		g_oConfig.SetData("SYSTEM_USER_DIRECTORY", vData);
	}
	catch (e)
	{
		throw (new Error(-1, "�t�ΫإߨϥΪ̥ؿ��պA�o�Ϳ��~�A���p���t�κ޲z��"));
	}

	vData = null;
	try
	{
		vData = g_oConfig.GetData("SYSTEM_AP_DIRECTORY") + g_oConfig.GetData("MODULE_DIRURL") + vModuleID + "/";
		g_oConfig.SetData("SYSTEM_MODULE_DIRECTORY", vData);
	}
	catch (e)
	{
		throw (new Error(-1, "�t�Ϋإߦ��A���Ҳեؿ��պA�o�Ϳ��~�A���p���t�κ޲z��"));
	}

	vData = null;
	try
	{
		vData = g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("FORM_DIRURL");
		g_oConfig.SetData("SYSTEM_FORM_DIRECTORY", vData);

		if (g_oConfig.GetData("SYSTEM_UNIT_ID"))
		{
			if (_G("SYSTEM_AP_DIRECTORY").indexOf("c:") == -1)
			{
				vData = _G("SYSTEM_AP_DIRECTORY").replace(/docnet/, "docnet_unit") + g_oConfig.GetData("MODULE_DIRURL") + g_oConfig.GetData("SYSTEM_UNIT_ID").toLowerCase();
				if (!g_coGDLocal.IsExist(1, UrlToPath(vData)))
					vData = _G("SYSTEM_AP_DIRECTORY") + g_oConfig.GetData("MODULE_DIRURL") + g_oConfig.GetData("SYSTEM_UNIT_ID").toLowerCase();
			}
			else
				vData = _G("SYSTEM_AP_DIRECTORY") + g_oConfig.GetData("MODULE_DIRURL") + g_oConfig.GetData("SYSTEM_UNIT_ID").toLowerCase();
			if (g_coGDLocal.IsExist(1, UrlToPath(vData)))
				g_oConfig.SetData("SYSTEM_UNIT_DIRECTORY", vData + "/");
		}
	}
	catch (e)
	{
		throw (new Error(-1, "�t�Ϋإߪ���ؿ��պA�o�Ϳ��~�A���p���t�κ޲z��"));
	}

	vData = null;
	try
	{
		vData = g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("LOCAL_DIRURL");
		g_oConfig.SetData("SYSTEM_LOCAL_DIRECTORY", vData);
	}
	catch (e)
	{
		throw (new Error(-1, "�t�Ϋإ�LOCAL�ؿ��պA�o�Ϳ��~�A���p���t�κ޲z��"));
	}

	vData = null;
	try
	{
		vData = g_oConfig.GetData("SYSTEM_FORMBINDER_SERVER_URLDIR") + g_oConfig.GetData("MODULE_DIRURL") + vModuleID + "/";
		g_oConfig.SetData("SYSTEM_MODULE_SERVER_URLDIR", vData);
	}
	catch (e)
	{
		throw (new Error(-1, "�t�Ϋإߦ��A���Ҳզ��A�����}�o�Ϳ��~�A���p���t�κ޲z��"));
	}

	return true;
}

function _DoRefreshVersionInfo()
{
	try
	{
		var sVer = _G("FORMBINDER_VERSION") + "." + _G("FORMBINDER_SP_VERSION");
		sVer = "<SPAN class=\"cssTitle10W\" title=\"���� " + _G("VERSION") + "\">����&nbsp;" + sVer + "</SPAN>";
		//strVersion += "&nbsp;&nbsp;<SPAN class=\"cssTitle10W\">�t�Ϊ���&nbsp;" + g_oConfig.GetData("SYSTEM_VERSION") + "." + g_oConfig.GetData("SYSTEM_SP_VERSION") + "</SPAN>";
		elmVersion.innerHTML = sVer.replace("\n", "�@");
		//		elmHelp.style.left = _N(elmBody.offsetWidth) - _N(elmHelp.offsetWidth) - 5;
	}
	catch (e)
	{
	}
}

function _CheckFormBinderVersionWithServer()
{
	try
	{
		if (_G("SYSTEM_SYNC_RESOURCE") != "N" && document.getElementById('elmSyncFrame') != null && MDT.TEST != true)
		{
			var nSyncInterval = _N(GetCookie("ResSyncInterval"), 0);
			if (nSyncInterval < 1000 || nSyncInterval > 86400000)
				nSyncInterval = 600000;

			var nSyncOffset = _N(GetCookie("ResSyncOffset"), 0);
			if (nSyncOffset < 1000 || nSyncOffset > 600000)
				nSyncOffset = 30000;

			var bDoSync = true;
			var oPreDate = GetCookie("ResSyncStart");
			if (oPreDate)
			{
				oPreDate = Date.parse(oPreDate);
				var oDate = new Date();
				if (oPreDate && ((oDate - oPreDate) < nSyncInterval))
					bDoSync = false;
			}

			if (bDoSync)
				setTimeout("_SyncResourceWithServer();", nSyncOffset);
			else
				setTimeout("_SyncResourceWithServer();", nSyncInterval);
		}
	}
	catch (e) { }
}

function _SyncResourceWithServer()
{
	try
	{
		var sSyncUrl = _G("SYSTEM_SYNC_RESOURCE_URL");
		sSyncUrl += "?MID=" + escape(g_vModuleID);
		sSyncUrl += "&UID=" + escape(g_oConfig.GetData("SYSTEM_USER_LOGINID"));
		sSyncUrl += "&DN=" + escape(g_oConfig.GetData("SYSTEM_USER_DN"));
		sSyncUrl += "&UNZIPSUB=N";
		sSyncUrl += "&BG=" + _GetCssText(".cssFootBG", "backgroundColor").replace(/#/, "");

		document.frames("elmSyncFrame").document.bgColor = _GetCssText(".cssFootBG", "backgroundColor"); //"#558AAB"; 
		document.getElementById("elmSyncFrame").width = "100";
		document.getElementById("elmSyncFrame").height = "16";

		document.getElementById("elmSyncFrame").src = sSyncUrl;
	}
	catch (e) { }
}

function ShowHotNews(nPos)
{
	try
	{
		if (nPos == null)
		{
			if (g_xmlDoc == null || g_xmlDoc.readyState != 4 || g_xmlDoc.documentElement == null)
				return;
			var xml = _LoadText(g_xmlDoc.xml);
			var xnRoot = _ToRoot(xml);
			var xnList = _ToList(xml, "/*/*");
			elmNews._url = _XA(xnRoot, "url");
			elmNews._features = _XA(xnRoot, "features");
			elmMarguee._node = xnRoot.cloneNode(true);
			var nLen = _ToList(xml, "/*/*").length;
			if (nLen > 0)
			{
				elmMarguee._len = nLen;
				elmMarguee._time = 0;
				elmNewsBar.style.display = "";
				ShowHotNews(0);
			}
			g_xmlDoc = _DelXML(g_xmlDoc);
		}
		else
		{
			elmMarguee._time = elmMarguee._time + 1;
			if ((nPos % 2) == 0)
			{
				var xnNode = _ToChild(elmMarguee._node, "./*[" + (nPos / 2) + "]")
				elmMarguee._url = _XA(xnNode, "url");
				elmMarguee._features = _XA(xnNode, "features");
				elmMarguee.innerHTML = xnNode.xml;
				elmMarguee.style.color = "#FFFF00";
				elmNewsBar.style.backgroundColor = "";
				//	 elmNewsBar.className = "cssFootBG";
			}
			else if (elmMarguee._time <= 10)
			{
				elmMarguee.style.color = "#FFFFFF";
				elmNewsBar.style.backgroundColor = "#FF9900";
				//	 elmNewsBar.className = "cssToolBG";
			}

			if (elmMarguee._time * 2.5 > _GN("�̷s�������d�ɶ�", 180))
			{
				elmNews.style.display = "";
				elmNewsBar.style.display = "none";
				DoResize();
			}
			else
			{
				nPos++;
				if (nPos >= elmMarguee._len * 2)
					nPos = 0;
				window.setTimeout("ShowHotNews(" + nPos + ");", 2500);
			}
		}
	}
	catch (e)
	{ }
}

function _SaveCommonLexXMLFromServer()
{
	try
	{
		if (g_xmlLex == null || g_xmlLex.readyState != 4 || g_xmlLex.documentElement == null)
			return;
		_SaveXML(g_xmlLex, _G("SYSTEM_USER_DIRECTORY") + _G("SYSTEM_COMMON_WORDBASE_URL"));
		g_xmlLex = _DelXML(g_xmlLex);
	}
	catch (e)
	{
		_Err(e);
	}
}

function _SaveCommonOrgLexXMLFromServer()
{
	try
	{
		if (g_xmlOrgLex == null || g_xmlOrgLex.readyState != 4 || g_xmlOrgLex.documentElement == null)
			return;

		_SaveXML(g_xmlOrgLex, _G("SYSTEM_USER_DIRECTORY") + _G("SYSTEM_COMMON_ORG_WORDBASE_URL"));
		g_xmlOrgLex = _DelXML(g_xmlOrgLex);
	}
	catch (e)
	{
		_Err(e);
	}
}

function _SaveCommonOpinionLexXMLFromServer()
{
	try
	{
		if (g_xmlOpinionLex == null || g_xmlOpinionLex.readyState != 4 || g_xmlOpinionLex.documentElement == null)
			return;
		var xnList = _ToList(g_xmlOpinionLex, "//*[@dept_ids]");
		for (var m = xnList.length - 1; m >= 0; m--)
			xnList[m].removeAttribute("dept_ids");

		_SaveXML(g_xmlOpinionLex, _G("SYSTEM_USER_DIRECTORY") + _G("SYSTEM_COMMON_OPINION_WORDBASE_URL"));
		g_xmlOpinionLex = _DelXML(g_xmlOpinionLex);
	}
	catch (e)
	{
		_Err(e);
	}
}
//: initial-func

function _CallSysEnvDataInitialize()
{
	try
	{
		MDT.CONFIG = new Object();
		g_oQueryString = new _DataSetObject(MDT.CONFIG);
		g_oQueryData = g_oQueryString;

		var vQuery = window.location.search;
		if (vQuery != "") vQuery = vQuery.substr(1);

		var vArray = vQuery.split('&');
		for (var i = 0; i < vArray.length; i++)
		{
			var vArrayTmp = vArray[i].split("=");

			var strName = g_coGDLocal.DecodeURI(vArrayTmp[0]);
			var strValue = g_coGDLocal.DecodeURI(vArrayTmp[1]);

			if (String(strValue).toLowerCase() == "true")
				strValue = true;
			else if (String(strValue).toLowerCase() == "false")
				strValue = false;

			g_oQueryString.SetData(strName, strValue);
		}

		var args = window.dialogArguments;
		if (args)
		{
			for (var key in args)
			{
				g_oQueryString.SetData(key, args[key]);
			}
		}

		var urlQueryString = g_oQueryString.GetData("QueryStringExtraURL");
		if (urlQueryString != null && urlQueryString != "")
		{
			var strFileExt = String(GetFileExt(urlQueryString)).toLowerCase();
			if (strFileExt == "xml")
			{
				var xml = _LoadXML(urlQueryString);
				if (xml != null)
				{
					var xnData = xml.documentElement;
					_Log(xnData.cloneNode(true), null, true);

					var xnList = xnData.selectNodes("*");
					for (var n = 0, nLen = xnList.length; n < nLen; n++)
					{
						_SetDataByNode(xnList[n], g_oQueryString, true);
					}
					_DelXML(xml);
				}
			}
			else if (strFileExt == "tmp")
			{
				var strOutput = "";
				if (g_coGDLocal.Load(urlQueryString))
				{
					try
					{
						while (!g_coGDLocal.IsEOF())
						{
							strOutput += g_coGDLocal.ReadLn();
						}
					}
					catch (e)
					{
					}
					g_coGDLocal.Close();
				}

				if (strOutput != "")
				{
					var aLine = strOutput.split("\r\n");
					for (var i = 0; i < aLine.length; i++)
					{
						var strLine = aLine[i];

						var iPos = strLine.indexOf('=');
						if (iPos != -1)
						{
							var strType = null;
							var strName = strLine.substr(0, iPos);
							var strData = strLine.substring(iPos + 1);
							iPos = strData.indexOf(',');
							if (iPos != -1)
							{
								strType = strData.substr(0, iPos);
								strData = strData.substring(iPos + 1);
							}

							if (strType == null)
								g_oQueryString.SetData(strName, strData);
							else if (strType.toUpperCase() == "TEXT")
								g_oQueryString.SetData(strName, strData);
							else if (strType.toUpperCase() == "INT")
								g_oQueryString.SetData(strName, parseInt(strData, 10));
							else if (strType.toUpperCase() == "FLOAT")
								g_oQueryString.SetData(strName, parseFloat(strData));
							else if (strType.toUpperCase() == "BOOL")
								g_oQueryString.SetData(strName, (strData.toUpperCase() == "TRUE") ? true : false);
						}
					}
				}
			}
		}

		var urlQueryData = g_oQueryString.GetData("QueryURL");
		if (urlQueryData != null && urlQueryData != "")
		{
			if (urlQueryData.substr(0, 7) != "http://" && urlQueryData.substr(0, 7) != "file://" && urlQueryData.indexOf(":\\") == -1)
				urlQueryData = _G("SYSTEM_AP_DIRECTORY") + urlQueryData;

			var xml = _LoadXML(urlQueryData);
			if (xml != null)
			{
				var xnList = xml.selectNodes("/*/*");
				for (var n = 0, nLen = xnList.length; n < nLen; n++)
				{
					_SetDataByNode(xnList[n], g_oQueryData);
				}
				_DelXML(xml);
			}
		}

		var bDataExchgEnable = g_oQueryString.GetData("DataExchgEnable") == true;
		if (bDataExchgEnable)
		{
			var xml = _LoadXML(_G("DataExchgFileURL", "c:\\dataExchgTmp.xml"));
			if (xml != null)
			{
				var xnList = xml.selectNodes("/*/*");
				for (var n = 0, nLen = xnList.length; n < nLen; n++)
				{
					_SetDataByNode(xnList[n], g_oQueryData, true);
				}
				_DelXML(xml);
			}
		}
	}
	catch (e)
	{
		_Alert(e, "���oQUERYSTRING��ƥ���");
		return false;
	}
	return true;
}

function _SetDataByNode(xnNode, obj, bName)
{
	try
	{
		if (obj == null)
			obj = g_oConfig;

		var sName = (bName) ? xnNode.getAttribute("name") : xnNode.nodeName;
		var sText = xnNode.text;
		var sType = String(xnNode.getAttribute("type")).toUpperCase();

		if (sText === "null")
			obj.SetData(sName, null);
		else if (sType == "NULL" || sType == "TEXT")
			obj.SetData(sName, sText);
		else if (sType == "INT")
			obj.SetData(sName, parseInt(sText, 10));
		else if (sType == "FLOAT")
			obj.SetData(sName, parseFloat(sText));
		else if (sType == "BOOL")
		{
			obj.SetData(sName, sText.toUpperCase() == "TRUE");
			if (sName == "KeepSignInfo")
				_Run("Package_GetSignInfo", sText.toUpperCase() == "TRUE");
		}
		else if (sType == "XML")
		{
			if (bName)
				xnNode = xnNode.firstChild;
			obj.SetData(sName, xnNode.cloneNode(true));
		}
		else if (sType == "RESOURCE")
			obj.SetData(sName, xnNode.firstChild.cloneNode(true));
		else if (sType == "DIRURL")
			obj.SetData(sName, xnNode.getAttribute("dirURL"));
		else if (sType == "LINK")
		{
			var strUrl = _ParseSystemScriptString(xnNode.getAttribute("src"));
			if (strUrl == null) return false;
			var xml = _LoadXML(strUrl);
			if (xml == null)
				return xnNode.getAttribute("if_none") == "PASS";

			var xnList = xml.selectNodes("/*/*");
			for (var n = 0, nLen = xnList.length; n < nLen; n++)
			{
				_SetDataByNode(xnList[n], obj);
			}
			_DelXML(xml);
		}
		else if (sType == "XMLURL")
		{
			var strUrl = _ParseSystemScriptString(xnNode.getAttribute("src"));
			if (strUrl == null) return false;
			var xml = _LoadXML(strUrl);
			if (xml == null)
				return false;

			obj.SetData(sName, xml.documentElement.cloneNode(true));
			_DelXML(xml);
		}
		return true;
	}
	catch (e)
	{
		_Alert(e);
		return false;
	}
}

//: window-initialize

function OnExit()
{
	try
	{
		_RaiseEvent(2, "BeforeExitSystem");

		if (g_oProject != null)
		{
			if (window._bHdnMode != null)
				elmOpinionBody.SaveHdnote(false);
			iOnCloseProject(true, false, false, false);
		}

		OnUninitialize();

		_RaiseEvent(2, "AfterExitSystem");
	}
	catch (e)
	{
		_Err(e, "����o�Ϳ��~");
	}
}

function OnUninitialize()
{
	try
	{
		if (g_oAdBook != null)
		{
			if (g_oAdBook.m_bAsync == true) g_oAdBook.StopDownload();
			g_oAdBook.Close(); g_oAdBook = null;
		}

		if (g_LexDlg != null)
		{
			if (!g_LexDlg.closed) g_LexDlg.close();
			g_LexDlg = null;
		}

		if (g_OpnDlg != null)
		{
			if (!g_OpnDlg.closed) g_OpnDlg.close();
			g_OpnDlg = null;
		}

		if (g_oWs != null)
		{
			var strWorkDir = g_oWs.m_WorkingDir;
			g_coGDLocal.DeleteDir(strWorkDir.substr(0, strWorkDir.length - 1));
			g_oWs = null;
		}
		_Log("�iWeb������s�@�t�������j", 0x0000FF);
		_SaveLog(false);

		if (window.g_coDDDViewer != null)
		{
			g_coDDDViewer.close();
			g_coDDDViewer.closeWindow();
		}
		if (window.g_coDDDViewerDi != null)
		{
			g_coDDDViewerDi.close();
			g_coDDDViewerDi.closeWindow();
		}

		_SaveCookieData();
	}
	catch (e)
	{
		_Alert(e, "����o�Ϳ��~");
	}
}

function _GetUserConfigUrl()
{
	try
	{
		if (g_vLoginID !== "DocNetLocalUser" || g_oQueryString.GetData("ApiMode") == null)
			return g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("USER_DIRURL") + g_vLoginID.toLowerCase() + "/" + g_vModuleID.toLowerCase() + "/config/config_user.xml";

		// get default user config url
		var vUserPathDir = UrlToPath(g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("USER_DIRURL"));
		var vTmp = g_coGDLocal.IsExist(3, vUserPathDir + "*.*"); //�|�ǲŦX���󪺩Ҧ��ؿ�(�H&���j) �^�Ǧr��
		if (vTmp == null)
			return g_oConfig.GetData("SYSTEM_OFFLINE_DIRECTORY") + g_oConfig.GetData("USER_DIRURL") + g_vLoginID.toLowerCase() + "/" + g_vModuleID.toLowerCase() + "/config/config_user.xml";

		var aUser = vTmp.split('&');
		for (var i = 0; i < aUser.length; i++)
		{
			var vUserID = aUser[i];
			if (vUserID == "." || vUserID == ".." || vUserID == "") continue;

			if (g_coGDLocal.IsExist(0, vUserPathDir + vUserID + "\\" + g_vModuleID + "\\config\\config_user.xml") == false)
				continue;

			g_vLoginID = vUserID;
			return vUserPathDir + vUserID + "\\" + g_vModuleID + "\\config\\config_user.xml";
		}
	}
	catch (e)
	{
		throw (new Error(0, "Ū���ϥΪ̲պA�ɵo�Ϳ��~�A�Э��s�n�����x�b���A�Ȧ��A���A�t�αN���s���o�z���ӤH�պA��"));
	}
}

function _FatalError(msg, e)
{
	_Alert(_TC(msg, "�G", e), "Fatal Error");
	window.close();
}

window.onbeforeunload = OnExit;