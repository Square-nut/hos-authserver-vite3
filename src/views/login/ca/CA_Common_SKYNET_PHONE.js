var ca_key = (function() {
    
    var Const_Vender_Code = "SKYNET";
    var Const_Sign_Type = "PHONE";
    
    var Global_Last_Login_CertInfo = "";
    var Global_Last_Login_SealInfo = "";
    var Global_Last_Login_Token = "";
    var Global_Last_Error_Code = "";
    var Global_Last_Error_Msg = "";
    
    function iGetData(Func,P1,P2,P3,P4,P5,P6,P7,P8,P9) {
    	
    	var result = "";
    	
    	var para = {
	  		CAFunc: Func,
	  		CAVenderCode:Const_Vender_Code,
	  		CASignType:Const_Sign_Type,
	  		P1:P1||"",
	  		P2:P2||"",
	  		P3:P3||"",
	  		P4:P4||"",
	  		P5:P5||"",
	  		P6:P6||"",
	  		P7:P7||"",
	  		P8:P8||"",
	  		P9:P9||""
  		};
  		
  		$.ajax({
    		url: "../CA.Ajax.DS.cls",
    		type: "POST",
    		dataType: "JSON",
    		async: false,
            global:false,
    		data: para,
    		success: function(ret) {
            	if (ret && ret.retCode == "0") {
                	result = ret;
            	} else {
	            	alert(ret.retMsg);
            	}
            },
        	error: function(err) {
            	alert(err.retMsg || err);
        	}
  		});
  		
  		return result;
    }
    
    function iGetCert(key) {
	    //var userCertCode = key.split("-")[0];
	    return iGetData("GetCert",key);
    }
    
    function iGetCertByUserCode(userCode) {
	    return iGetData("GetCertByUserCode",userCode);
    }
    
    function iParseCert(cert) {
	    return iGetData("ParseCert",cert);
    }
    
    function iGetSeal(key) {
	    //var userCertCode = key.split("-")[0];
	    return iGetData("GetSeal",key);
    }
    
    function iGetSignQR() {
  		
  		var result = iGetData("GetSignQR");
  		
  		return result;
	}

	// @signGUID ǩ��guid
	function iGetSignQRResult(signGUID) {
  		
  		var result = iGetData("GetSignQRResult", signGUID);
  		
  		return result;
	}
	
	function iGetPushSignQR(key) {
  		
  		var result = iGetData("GetPushSignQR",key);
  		
  		return result;
	}

	// @signGUID ǩ��guid
	function iGetPushSignQRResult(signGUID) {
  		
  		var result = iGetData("GetPushSignQRResult", signGUID);
  		
  		return result;
	}
	
   	function iAuthSign(inData,key,token) {
  		
  		var result = iGetData("AuthSign", inData, key, token);
  		
  		return result;
	}

	function iGetLastErrorCode() {
	    return Global_Last_Error_Code;
	}

	function iGetLastErrorMsg() {
	    return "������[" + Global_Last_Error_Code + "] ��������[" + Global_Last_Error_Msg + "]"
	}

	function iCheckValid(userCert) {
	    return true;
	}

	// �û���¼
	function iLogin(strFormName, strCertID, strPin) {
	   	
        return false;
	}

	function iGetLoginedInfo() {
		var result = iGetData("GetLoginedInfo");
  		return result;
	}
	
	// todo: ��Ȩ�Զ�ǩ��
	function iSignData(inData,key,token) {
		token = token||"";
		//return iSignDataQR(inData,key,token);
		return oAuthSign(inData,key,token);
	}
	
	function oAuthSign(inData,key,token) {
		var ret = "";
		var rtn = iCheckAuthSignToken(key, token);
		if (rtn.retCode == "0") {
			var token = rtn.signToken || "";
			if(token != "") {
				var rtn = iAuthSign(inData,key,token);
				if ((rtn != "")&&(rtn.retCode == "0")&&(rtn.signStatus = "FINISH")) {
					ret = rtn.signResult;
				}
			}
		} 
		
		if (ret == "") {
			Global_Last_Login_CertInfo = "";
		}
		
		return ret;
	}
	
	function iCheckAuthSignToken(key,token) {
		
		token = token||"";
		
		if (Global_Last_Login_CertInfo == "") {
			var loginedCert = iGetLoginedInfo();
			if (loginedCert.retCode == 0) {
				Global_Last_Login_CertInfo = loginedCert;
			}	
		}
		
		if ((Global_Last_Login_CertInfo != "")&&(Global_Last_Login_CertInfo.certContainer == key)) {
			//����ʹ�ô�������token
			var currentToken = token || (Global_Last_Login_CertInfo.signToken || "");
			if (currentToken != "") {
				Global_Last_Login_CertInfo["signToken"] = currentToken;
				return Global_Last_Login_CertInfo;
			}
		}
		
		
		var para = {VenderCode:Const_Vender_Code,SignType:Const_Sign_Type,Key:key}
		var rtnStr = window.showModalDialog("../csp/dhc.certauth.auth.qrcode.csp",para,"dialogWidth:350px;dialogHeight:350px;toolbar=no;menubar:no;scrollbars:no;resizable:no;location:no;status:no;help:no;fullscreen=no");
	
		if ((typeof(rtnStr) == "undefined")||(rtnStr == "")) {
			return {retCode:"-2",retMsg:"��Ȩ�Զ�ǩ��ʧ��"};
		}
	
		var rtn = $.parseJSON(rtnStr);
		if ((rtn)&&(rtn.retCode == "0")&&(rtn.hisUserName != "")&&(rtn.certContainer == key)&&(rtn.signToken != "")) {
			Global_Last_Login_CertInfo = rtn;
			return rtn;
		}
	
		return {retCode:"-2",retMsg:"��Ȩ�Զ�ǩ��ʧ��"};
		
	}
	
	function iSignDataQR(inData,key,token) {
		
		token = token||"";
		
		var para = {VenderCode:Const_Vender_Code,SignType:Const_Sign_Type,InData:inData,Key:key,Token:token};
		var rtnStr = window.showModalDialog("../csp/dhc.certauth.sign.qrcode.csp",para,"dialogWidth:350px;dialogHeight:350px;toolbar=no;menubar:no;scrollbars:no;resizable:no;location:no;status:no;help:no;fullscreen=no");
		
		if ((typeof(rtnStr) == "undefined")||(rtnStr == "")) {
			Global_Last_Error_Code = "-101";
			Global_Last_Error_Msg = "CAǩ��ȡ��";
			return "";
		}
		
		//var rtn = JSON.parse(rtnStr);
		var rtn = $.parseJSON(rtnStr);
		if (rtn.retCode != "0") {
			Global_Last_Error_Code = rtn.retCode;
			Global_Last_Error_Msg =  rtn.retMsg;
			return "";
		}
		
		if ((key != "")&&(rtn.certContainer != key)) {
			Global_Last_Error_Code = "-102";
			Global_Last_Error_Msg = "ǩ��ҽʦ���ݴ���: ָ��ǩ��ҽʦ:" + key + ", ʵ��ǩ��ҽʦ:" + rtn.certContainer;
			return "";
		} 
		
		if (rtn.signResult == "") {
			Global_Last_Error_Code = "-103";
			Global_Last_Error_Msg = "ǩ�����Ϊ��";
			return "";
		}
		
		//ǩ������ͬʱҲ�ǵ�¼����
		if ((rtn)&&(rtn.retCode == "0")&&(rtn.hisUserName != "")) {
			Global_Last_Login_CertInfo = rtn;
		}
		
		return rtn.signResult;
	}
	
	function iPushSignDataQR(inData,key,token) {
		
		token = token||"";
		
		var para = {VenderCode:Const_Vender_Code,SignType:Const_Sign_Type,InData:inData,Key:key,Token:token};
		var rtnStr = window.showModalDialog("../csp/dhc.certauth.pushsign.qrcode.csp",para,"dialogWidth:350px;dialogHeight:350px;toolbar=no;menubar:no;scrollbars:no;resizable:no;location:no;status:no;help:no;fullscreen=no");
		
		if ((typeof(rtnStr) == "undefined")||(rtnStr == "")) {
			Global_Last_Error_Code = "-101";
			Global_Last_Error_Msg = "CAǩ��ȡ��";
			return "";
		}
		
		//var rtn = JSON.parse(rtnStr);
		var rtn = $.parseJSON(rtnStr);
		if (rtn.retCode != "0") {
			Global_Last_Error_Code = rtn.retCode;
			Global_Last_Error_Msg =  rtn.retMsg;
			return "";
		}
		
		if ((key != "")&&(rtn.certContainer != key)) {
			Global_Last_Error_Code = "-102";
			Global_Last_Error_Msg = "ǩ��ҽʦ���ݴ���: ָ��ǩ��ҽʦ:" + key + ", ʵ��ǩ��ҽʦ:" + rtn.certContainer;
			return "";
		} 
		
		if (rtn.signResult == "") {
			Global_Last_Error_Code = "-103";
			Global_Last_Error_Msg = "ǩ�����Ϊ��";
			return "";
		}
		
		//ǩ������ͬʱҲ�ǵ�¼����
		/*
		if ((rtn)&&(rtn.retCode == "0")&&(rtn.hisUserName != "")) {
			Global_Last_Login_CertInfo = rtn;
		}
		*/
		
		return rtn.signResult;
	}
	
	function iHashData(inData) {
		var rtn = iGetData("HashData",inData);
		if ((rtn.retCode == "0")) {
			return rtn.hashData;
		} else {
			Global_Last_Error_Msg = rtn.retMsg;
			return "";
		}
	}
	
	function iIsLastLoginCert(key,cert) {
		key = key||"";
		cert = cert||"";
		if ((key != "")&&(Global_Last_Login_CertInfo != "")&&(Global_Last_Login_CertInfo.certContainer == key)){
			return true;
		} else if ((cert != "")&&(Global_Last_Login_CertInfo != "")&&(Global_Last_Login_CertInfo.signCert == cert)){
			return true;
		} else {
			return false;
		}
	}
	
	function iIsLastLoginSeal(key) {
		var usercertcode = key.split("-")[0];
		if ((key != "")&&(Global_Last_Login_SealInfo != "")&&(Global_Last_Login_SealInfo.userCertCode == usercertcode)){
			return true;
		} else {
			return false;
		}
	}
	
	function iGetRealKey(key) {
        key = key||"";
		if (key == "") {
			if (Global_Last_Login_CertInfo == "") {
				return "";
			} else {
				return Global_Last_Login_CertInfo.certContainer||"";
			}
		} else {
			return key;
		}
	}
    
    function iGetTokenIsValid(key,token) {
		var result = iGetData("GetTokenIsValid",key,token);
  		return result;
	}
	
	// /////////////////����ӿ�

	function oGetUserList() {
	    return ""
	}
	
	function oSignedData(content, key) {
		key = iGetRealKey(key);
	    return iSignData(content, key);
	}
	
	function oSignedOrdData(content, key) {
		key = iGetRealKey(key);
	    return iSignData(content, key);
	}
	
	function oGetSignCert(key) {
		key = iGetRealKey(key);
		if (key == "") return "";
		 
		if (iIsLastLoginCert(key)) {
			return Global_Last_Login_CertInfo.signCert;
		} else {
			var obj = iGetCert(key);
			if (obj.retCode == "0") {
				return obj.signCert;
			}
		}
		 
		return "";
	}
	
	function oGetIdentityID(key) {
		key = iGetRealKey(key);
		if (key == "") return "";
		 
		if (iIsLastLoginCert(key)) {
			return Global_Last_Login_CertInfo.identityID||"";
		} else {
			var obj = iGetCert(key);
			if (obj.retCode == "0") {
				return obj.identityID||"";
			}
		}
		 
		return "";
	}
	
	// ֤���ʶ������������֤��,�����û�֤��Ψһ��ʶ
	function oGetUniqueID(cert,key) {
	    
	    if (cert == "") return "";
	   	
		if (iIsLastLoginCert("",cert)) {
			return Global_Last_Login_CertInfo.userCertCode;
		} else {
			
			var obj = iGetCert(key);
			if (obj.retCode == "0") {
				return obj.userCertCode;
			}
			
			return "";
		}
		 
		return "";
	}

	function oGetCertCNName(cert,key) {
	   	 
	   	if (cert == "") return "";
	   	
		if (iIsLastLoginCert("",cert)) {
			return Global_Last_Login_CertInfo.certName;
		} else {
			var obj = iParseCert(key);
			if (obj.retCode == "0") {
				return obj.certCN;
			}
			
			return "";
		}
		 
		return "";
	}

	function oGetKeySN(key) {
	    if (key != "") {
	        var strs = new Array(); // ����һ����
	        strs = key.split("/"); // �ַ��ָ�
	        var keysn = strs[1];
	        return keysn;

	    } else {
	        return null;
	    }
	}

	function oGetPicBase64(key) {
	   key = iGetRealKey(key);
	   if (key == "") return "";
		 
		if (iIsLastLoginSeal(key)) {
			return Global_Last_Login_SealInfo.certImage;
		} else {
			var obj = iGetSeal(key);
			if (obj.retCode == "0") {
				return obj.certImage;
			}
		}
		 
		return "";
	}

	function oGetCertNo(key) {
		key = iGetRealKey(key);
		if (key == "") return "";
		 
		if (iIsLastLoginCert(key)) {
			return Global_Last_Login_CertInfo.certNo;
		} else {
			var obj = iGetCert(key);
			if (obj.retCode == "0") {
				return obj.certNo;
			}
		}
		 
		return "";
	}

	function oGetCertSN(cert,key) {
		key = iGetRealKey(key);
		if (key == "") return "";
		 
		if (iIsLastLoginCert(key)) {
			return Global_Last_Login_CertInfo.certNo;
		} else {
			var obj = iGetCert(key);
			if (obj.retCode == "0") {
				return obj.certSN;
			}
		}
		 
		return "";
	}
	
	function oIsLogin(key) {
		return iIsLastLoginCert(key,"");
	}
	
	function oGetUsrSignatureInfo(key) {
	    var usrSignatureInfo = new Array();
	    var cert = oGetSignCert(key);
	    usrSignatureInfo["identityID"] = oGetIdentityID(key);
	    usrSignatureInfo["certificate"] = cert;
	    usrSignatureInfo["certificateNo"] = oGetCertNo(key);
	    usrSignatureInfo["CertificateSN"] = oGetCertSN(cert,key);
	    usrSignatureInfo["uKeyNo"] = ogetKeySN(key);
	   	usrSignatureInfo["signImage"] = oGetPicBase64(key);
	    usrSignatureInfo["UsrCertCode"] = oGetUniqueID(cert,key);
	    usrSignatureInfo["CertName"] = oGetCertCNName(cert,key);
	    return usrSignatureInfo;
	}

	function oGetCertInfoByUserCode(userCode) {
		var cert = iGetCertByUserCode(userCode);
		if (cert === "") return "";
		if (cert.retCode != "0") return "";
		if (cert.certContainer == "") return "";
		
		var key = cert.certContainer;
		var usrSignatureInfo = new Array();
		usrSignatureInfo["identityID"] = "";
	    usrSignatureInfo["certificate"] = cert.signCert;
	    usrSignatureInfo["certificateNo"] = cert.certNo;
	    usrSignatureInfo["CertificateSN"] = cert.certSN;
	    usrSignatureInfo["uKeyNo"] = "";
	   	usrSignatureInfo["signImage"] = oGetPicBase64(key);
	    usrSignatureInfo["UsrCertCode"] = cert.userCertCode;
	    usrSignatureInfo["CertName"] = cert.certCN;
	    return usrSignatureInfo;
	}
	
	//У����������� ��ȷ���ؿ�
	function oCheckPWD(strCertID, strPin) {
	    if (strCertID == null || strCertID == "") {
	        return "��ȡ�û���Ϣʧ��";
	    }
		/*
	    if (strPin == null || strPin == "") {
	        return "������֤������";
	    }
	    if (strPin.length < 6 || strPin.length > 16) {
	        return "���볤��Ӧ����4-16λ֮��";
	    }
		*/
	    // У������
	    var ret = iLogin(strCertID, strPin);
	    if (!ret) {
	        return "��¼ʧ��!";
	    }
		
	    return "";
	}

	//У�������
	function oCheckForm(strCertID, strServerCert, strServerRan, strServerSignedData) {
		
	    return false;
	}
    
    /// ����HISUI-Dialog����
    function createModalDialog(dialogId, dialogTitle, width, height, iframeId, iframeContent,callback,arr1,arr2,maximi,minimi){
        $("body").append("<div id='"+dialogId+"'</div>");
        if (isNaN(width)) width = 800;
        if (isNaN(height)) height = 500;  
        if(document.getElementById("editor")&&(judgeIsIE()==false))
        document.getElementById("editor").style.visibility="hidden"; //���ز��
        if (maximi == undefined) maximi = false;
        if (minimi == undefined) minimi = false;
        $HUI.dialog('#'+dialogId,{ 
            title: dialogTitle,
            width: width,
            height: height,
            cache: false,
            collapsible: false,
            minimizable:minimi,
            maximizable:maximi,
            resizable: false,
            modal: true,
            closed: false,
            closable: true,
            isTopZindex: true,
            content: iframeContent,
            onBeforeClose:function(){
                var tempFrame = $('#'+iframeId)[0].contentWindow;
                if (tempFrame && tempFrame.returnValue)
                {
                    rtnStr = tempFrame.returnValue;
                    
                    if ((typeof(rtnStr) == "undefined")||(rtnStr == "")) {
                        rtnStr = {retCode:"-2",retMsg:"��¼ʧ��"};
                    } else {
                        var rtn = $.parseJSON(rtnStr);
                        if ((rtn)&&(rtn.retCode == "0")&&(rtn.hisUserName != "")) {
                            Global_Last_Login_CertInfo = rtn;
                        }
                        rtnStr = rtn||{retCode:"-2",retMsg:"��¼ʧ��"};
                    }
                    
                    if ((rtnStr !== "") &&(typeof(callback) === "function"))
                    {
                        callback(rtnStr,arr1,arr2);
                    }
                }
            },
            onClose:function(){
                if(document.getElementById("editor"))
                document.getElementById("editor").style.visibility="visible"; //���ز��
             }
        });
    }
    
    function judgeIsIE() { //ie?
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    }

	function oLoginForm(paraObj,callback,arr1,arr2) {
		paraObj = paraObj||"";
        var forceLogin = paraObj.forceLogin||false;
        if ((!forceLogin)&&(Global_Last_Login_CertInfo != "")) {
            if (oGetTokenIsValid(Global_Last_Login_CertInfo.certContainer,Global_Last_Login_CertInfo.signToken))
            {        
                if (judgeIsIE()){
                    return Global_Last_Login_CertInfo;
                }else {
                    callback(Global_Last_Login_CertInfo,arr1,arr2);    
                    return;
                }
            }
        }
        
        if ((!forceLogin)) {
            var loginedCert = iGetLoginedInfo();
            if (loginedCert.retCode == 0) {
                if (oGetTokenIsValid(loginedCert.certContainer,loginedCert.signToken))
                {
                    Global_Last_Login_CertInfo = loginedCert;
                    if (judgeIsIE()){
                        return Global_Last_Login_CertInfo;
                    }else {
                        callback(Global_Last_Login_CertInfo,arr1,arr2);    
                        return;
                    }
                }
            }
        }
        
        
        if (judgeIsIE())
        {
            var para = {VenderCode:Const_Vender_Code,SignType:Const_Sign_Type}
            var rtnStr = window.showModalDialog("../csp/dhc.certauth.login.qrcode.csp?venderCode="+Const_Vender_Code+"&signType="+Const_Sign_Type,para,
                            "dialogWidth:400px;dialogHeight:400px;toolbar=no;menubar:no;scrollbars:no;resizable:no;location:no;status:no;help:no;fullscreen=no");
            
            if ((typeof(rtnStr) == "undefined")||(rtnStr == "")) {
                return {retCode:"-2",retMsg:"��¼ʧ��"};
            }
            
            var rtn = $.parseJSON(rtnStr);
            if ((rtn)&&(rtn.retCode == "0")&&(rtn.hisUserName != "")) {
                Global_Last_Login_CertInfo = rtn;
            }
            return rtn||{retCode:"-2",retMsg:"��¼ʧ��"};
        }
        else
        {
            var content = '<iframe id="loginQrcodeFrame" scrolling="auto" frameborder="0" src="dhc.certauth.login.qrcode.csp?isNeedCallBack=1&venderCode='+Const_Vender_Code+'&signType='+Const_Sign_Type+'" style="width:100%; height:100%;"></iframe>';
            createModalDialog("loginQrcode","ɨ��ҳ��",400,500,'loginQrcodeFrame',content,callback,arr1,arr2);        
        }
	}
	
	function oGetRealKey(key) {
		return iGetRealKey(key)
	}
	
	function oHashData(content){
	   	return iHashData(content)  
	}
	
    function oGetTokenIsValid(key,token) {
		return iGetTokenIsValid(key,token)
	}
    
	function oGetLastError() {
		return iGetLastErrorMsg();
	}
	
    return {
    	OCX: "",
    	VenderCode:Const_Vender_Code,
    	SignType:Const_Sign_Type,
    	GetRealKey: function(key) {
	    	return oGetRealKey(key);
    	},
        CheckPWD: function(key, pwd) {
            return oCheckPWD(key, pwd);
        },
        CheckForm: function(key, strServerCert, strServerRan, strServerSignedData) {
            return oCheckForm(key, strServerCert, strServerRan, strServerSignedData);
        },
        Login: function(strFormName, strCertID, strPin) {
            return oLogin(strFormName, strCertID, strPin);
        },
        IsLogin: function(strKey) {
            return oIsLogin(strKey);
        },
        GetUserList: function() {
            return oGetUserList();
        },
        GetSignCert: function(key) {
            return oGetSignCert(key);
        },
        GetUniqueID: function(cert, key) {
            return oGetUniqueID(cert, key);
        },
        GetCertNo: function(key) {
            return oGetCertNo(key);
        },
        SignedData: function(contentHash, key) {
            return oSignedData(contentHash, key)
        },
        SignedOrdData: function(contentHash, key) {
            return oSignedOrdData(contentHash, key)
        },
        getUsrSignatureInfo: function(key) {
            return oGetUsrSignatureInfo(key);
        },
        getCertInfoByUserCode: function(userCode) {
	        return oGetCertInfoByUserCode(userCode);
        },
        HashData:function(content){
	    	return oHashData(content)  
	    },
	    LoginForm:function(paraObj,callback,arr1,arr2) {
		    return oLoginForm(paraObj,callback,arr1,arr2);
	    },
        GetTokenIsValid:function(key,token) {
		    return oGetTokenIsValid(key,token);
	    },
	    GetLastError:function() {
	    	return oGetLastError();
	    }
    }
})();

///0.Ϊ����Ukey
function GetUserList() {
	return ca_key.GetUserList();
}
function getUserList_pnp() {
	return ca_key.GetUserList();
}
function GetList_pnp() {
	return ca_key.GetUserList();
}
function Login(strFormName, key, pin) {
	return Login(strFormName, key, pin);
}
function CheckPWD(key, pin) {
    return ca_key.CheckPWD(key, pin);
}
function CheckForm(key, strServerCert, strServerRan, strServerSignedData) {
    return ca_key.CheckForm(key, strServerCert, strServerRan, strServerSignedData);
}

///1.��¼���
function LoginForm(paraObj,callback,arr1,arr2) {
	return ca_key.LoginForm(paraObj,callback,arr1,arr2);
}
function IsLogin(key) {
	return ca_key.IsLogin(key);
}
function GetTokenIsValid(key,token) {
	return ca_key.GetTokenIsValid(key,token);	
}

///2.֤����Ϣ
///��ȡcontainerName
function GetRealKey(key) {
	return ca_key.GetRealKey();
}
///��ȡ֤��base64����
function GetSignCert(key) {
	return ca_key.GetSignCert(key);
}
///��ȡCA�û�Ψһ��ʶ
function GetUniqueID(cert, key) {
	return ca_key.GetUniqueID(cert, key);
}
///��ȡ֤��Ψһ��ʶ
function GetCertNo(key) {
	return ca_key.GetCertNo(key);
}
///��ȡ֤����Ϣ����
function getUsrSignatureInfo(key) {
	return ca_key.getUsrSignatureInfo(key);
}
///��ȡ֤�鼰ͼƬ��Ϣ����֤��ʹ��
function getCertInfoByUserCode(userCode) {
	return ca_key.getCertInfoByUserCode(userCode);
}

///3.ǩ�����
///�Դ�ǩ������Hash
function HashData(content){
	return ca_key.HashData(content) 
}
///�Դ�ǩ���ݵ�Hashֵ��ǩ��
function SignedData(contentHash, key) {
	return ca_key.SignedData(contentHash, key)
}
function SignedOrdData(contentHash, key) {
	return ca_key.SignedOrdData(contentHash, key)
}

///4.����
function GetLastError() {
    return ca_key.GetLastError();
}
export {
  Login,
  GetUserList,
  GetSignCert,
  GetUniqueID,
  GetCertNo,
  SignedData
}