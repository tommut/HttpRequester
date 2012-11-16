var XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var mimeService = Components.classes["@mozilla.org/mime;1"].getService(Components.interfaces.nsIMIMEService);

var App = {
   inprogress : null,
   synopsis: null,
   elements: {},
   transactions: new Array(),
   lastService: null,
   urlHistory : {},
   contentTypeHistory : {},
   headerNameHistory : {},
   customReadHttpMethods: {},
   customWriteHttpMethdods: {},
    
    Transaction : function(){
		this.timeStamp = null;
		this.requestTransaction = null;
		this.responseTransaction = null;
	},
   
   RequestTransaction : function(){
		this.httpMethod			= null;
		this.url			= null;
		this.requestHeaders = {},
		this.contentType		= null;
		this.content 	= null;
		this.parameters = {}
		this.filename		= null;
		this.username			= null;
		this.password	= null;
		this.timeout    = null;
		this.base64    = null;
    },
	ResponseTransaction : function() { 
		this.title			= null;
		this.status			= null;
		this.statusText			= null;
		this.content		= null;
		this.responseHeaders = null;
		this.responseTimeStamp = null;
	},
   
   getPreferenceString: function(name){
      var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.httprequester.");
      if (preferencesService) {
         try {
            return preferencesService.getCharPref(name);
         } catch (ex) {
            // no preference
         }
      }
      return null;
   },
   getPreferenceComplex: function(name){
      var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.httprequester.");
      if (preferencesService) {
         try {
            return preferencesService.getComplexValue(name, Components.interfaces.nsISupportsString).data;
         } catch (ex) {
            // no preference
         }
      }
      return null;
   },
   setPreferenceComplex: function(name, value){
      var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].
	  	getService(Components.interfaces.nsIPrefService).getBranch("extensions.httprequester.");
      if (preferencesService) {
         try {
		 	var sString = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		    sString.data = value;
		    preferencesService.setComplexValue(name,Components.interfaces.nsISupportsString,sString);
         } catch (ex) {
            // no preference
         }
      }
   },
     getPreferenceInt: function(name){
      var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.httprequester.");
      if (preferencesService) {
         try {
            return preferencesService.getIntPref(name);
         } catch (ex) {
            // no preference
         }
      }
      return null;
   },
    getPreferenceBool: function(name){
      var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.httprequester.");
      if (preferencesService) {
         try {
            return preferencesService.getBoolPref(name);
         } catch (ex) {
            // no preference
         }
      }
      return null;
   },

   setPreferenceString: function(name,value){
      var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.httprequester.");
      if (preferencesService) {
         preferencesService.setCharPref(name,value);
      }
   },
   getMaxHistory: function() { 
  	var max = this.getPreferenceInt("maxhistory")
	if ( max == null ) { 
		max = 25;
	}
	return max;   
   },
   
   getMaxUrlHistory: function() { 
  	var max = this.getPreferenceInt("url.maxhistory")
	if ( max == null ) { 
		max = 10;
	}
	return max;   
   },
   getMaxContentTypeHistory: function() { 
  	var max = this.getPreferenceInt("contenttype.maxhistory")
	if ( max == null ) { 
		max = 10;
	}
	return max;   
   },
   getMaxHeaderHistory: function() { 
  	var max = this.getPreferenceInt("header.maxhistory")
	if ( max == null ) { 
		max = 10;
	}
	return max;   
   },
   	findInTextBox : function() { 
   		// if the response-content is focused, we will perform a Find for the response content
   		if ( document.getElementById("response-content").getAttribute("focused") ) { 
			var nsIPromptService = Components.interfaces.nsIPromptService;
			var nsPrompt_CONTRACTID = "@mozilla.org/embedcomp/prompt-service;1";
			var gPromptService = Components.classes[nsPrompt_CONTRACTID].getService(nsIPromptService);
			var result = { value: this.lastSearchString };
			var dummy = { value: 0 };
		
			if (gPromptService.prompt(window,
	                            "Find text in response",
	                            "Enter text to search for:",
	                            result,
	                            null,
	                            dummy)) {
	        	this.lastSearchString = result.value;   
	        	
	        	this.doFindNext();
			}  
   		}
	},
	doFindNext : function() {
		// if the response-content is focused, we will perform a Find for the response content
   		if ( document.getElementById("response-content").getAttribute("focused") ) { 
			var text = document.getElementById("response-content").value;
	        	
	    	var start = document.getElementById("response-content").selectionStart;
	    	
	    	if ( start < text.length - 1 ) {
	    		start = start + 1;
	    	}
	    	var index = text.toUpperCase().indexOf( this.lastSearchString.toUpperCase(), start );
	    	if ( index == -1 ) { 
	    		// restart; look from the beginning 
	    		index = text.toUpperCase().indexOf( this.lastSearchString.toUpperCase() );
	    	}
	    	if ( index == -1 ) { 
	    		alert( "No match found.");
	    	}
	    	else { 
	    		document.getElementById("response-content").select();
				document.getElementById("response-content").setSelectionRange(index, (index + this.lastSearchString.length));
	    	}
   		}
		
	},
   
   init: function() {
	// show advanced section if preference is set
	if ( this.getPreferenceBool( "showAdvancedOptions" ) ) { 
		document.getElementById("advancedSettings1").setAttribute( "hidden", false );
		document.getElementById("advancedSettings2").setAttribute( "hidden", false );
		document.getElementById("advancedSettings3").setAttribute( "hidden", false );
	}
	  // There was a component that handled storing some values; this no longer works 
	  // in Firefox 4, so was removed.  The values are instead stored to the preferences.
	  var httprequesterService = new Object();
      //alert("Initializing with "+httprequesterService);
      //if (!httprequesterService.contentType) {
        httprequesterService.contentType = this.getPreferenceString("contentType");
      //}
      //if (!httprequesterService.contentType) {
         httprequesterService.contentType = "text/xml";
      //}
      //if (!httprequesterService.url) {
         httprequesterService.url = this.getPreferenceString("url");
      //}
      httprequesterService.file = "";
      
      this.elements["filename"] = document.getElementById("filename");
      this.elements["contentType"] = document.getElementById("ctype");
      this.elements["username"] = document.getElementById("username");
      this.elements["password"] = document.getElementById("password");
      this.elements["content"] = document.getElementById("content");
      this.elements["url"] = document.getElementById("url");
      this.elements["timeout-slider"] = document.getElementById("timeout-slider");
      this.elements["timeout"] = document.getElementById("timeout");
      
      this.elements["filename"].value = httprequesterService.file;
      this.elements["contentType"].value = httprequesterService.contentType;
      this.elements["url"].value = httprequesterService.url;
      if (httprequesterService.username) {
         this.elements["username"].value = httprequesterService.username;
      }
      if (httprequesterService.password) {
         this.elements["password"].value = httprequesterService.password;
      }
      var current = this;
      this.elements["timeout-slider"].onchange = function() {
         current.elements["timeout"].value = current.elements["timeout-slider"].value;
      }
      document.getElementById("base64-encode").onclick = function() {
         var value = current.elements["content"].value;
         if (value.length>0) {
            var encoder = new Base64();
            current.elements["content"].value = encoder.encode(value);
         }
      }
      document.getElementById("header-list").onkeypress = function(event) {
         if (event.keyCode==8 || event.keyCode==46){
            current.onDeleteHeader();
         }
      };
      document.getElementById("parameter-list").onkeypress = function(event) {
         if (event.keyCode==8 || event.keyCode==46){
            current.onDeleteParameter();
         }
      };
	  document.getElementById("transaction-list").onkeypress = function(event) {
         if (event.keyCode==8 || event.keyCode==46){
            current.onDeleteTransaction();
         }
      };
      document.getElementById("transaction-list").ondblclick = function(event) {
            current.viewRawRequest();
      };
	  
	  
	  // load history
	  //pref("extensions.httprequester.history", 25);
	   var history = this.getPreferenceComplex("history");
	   if (history != null && history.length > 0) {
	  	 this.transactions = JSON.parse(history);
		 
		 for (var i = this.transactions.length-1; i>=0; i--) {
		 	this.addTransactionToList(this.transactions[i]);
		 }
	   }
	   
	   // load urls
	   var urlHistory = this.getPreferenceComplex("url.history");
	   if (urlHistory != null && urlHistory.length > 0) {
	  	 	this.urlHistory = JSON.parse(urlHistory);
		}
		else {
			this.urlHistory = new Array();
		}
		this.updateMenuList( "url", this.urlHistory );
		
	   // load content type history
	   var contentTypeHistory = this.getPreferenceComplex("contentType.history");
	   if (contentTypeHistory != null && contentTypeHistory.length > 0) {
	  	 this.contentTypeHistory = JSON.parse(contentTypeHistory);
		}
		else {
			this.contentTypeHistory = new Array();
		}
		this.updateMenuList( "ctype", this.contentTypeHistory );
		
		// load headers
	   var headerHistory = this.getPreferenceComplex("header.history");
	   if (headerHistory != null && headerHistory.length > 0) {
	  	 this.headerNameHistory = JSON.parse(headerHistory);
		}
		else {
			this.headerNameHistory = new Array();
		}
		this.updateMenuList( "header-name", this.headerNameHistory );
		
		// set appropriate content UI controls based on radio button
		this.contentBodyRadioButtonChanged();
		
		// load custom methods
  		var sendCommands = this.getPreferenceString("http.methods.custom.write");
	    if (sendCommands != null && sendCommands.length > 0) {
	  	 	this.customWriteHttpMethods = JSON.parse(sendCommands);
		}
		else {
			this.customWriteHttpMethods = new Array();
		}
  		var readCommands = this.getPreferenceString("http.methods.custom.read");
	    if (readCommands != null && readCommands.length > 0) {
	  	 	this.customReadHttpMethods = JSON.parse(readCommands);
		}
		else {
			this.customReadHttpMethods = new Array();
		}
		
		// populate METHOD dropdown with custom methods
		var methodList = document.getElementById("method");
		for (var i = 0; i < this.customWriteHttpMethods.length; i++) {
			var newMethod = document.createElement("menuitem");
			newMethod.setAttribute("label", this.customWriteHttpMethods[i]);
			newMethod.setAttribute("value", this.customWriteHttpMethods[i]);
			methodList.firstChild.appendChild(newMethod);
		}
		for (var i = 0; i < this.customReadHttpMethods.length; i++) {
			var newMethod = document.createElement("menuitem");
			newMethod.setAttribute("label", this.customReadHttpMethods[i]);
			newMethod.setAttribute("value", this.customReadHttpMethods[i]);
			methodList.firstChild.appendChild(newMethod);
		}
   },
   saveSettings: function() { 
  	 var historyString = JSON.stringify(this.transactions);
   	 this.setPreferenceComplex( "history", historyString );
	 
	 var urlhistoryString = JSON.stringify(this.urlHistory);
   	 this.setPreferenceComplex( "url.history", urlhistoryString );
	 
	 var contentTypehistoryString = JSON.stringify(this.contentTypeHistory);
   	 this.setPreferenceComplex( "contentType.history", contentTypehistoryString );
	 
	 var headerHistoryString = JSON.stringify(this.headerNameHistory);
   	 this.setPreferenceComplex( "header.history", headerHistoryString);
   },
   
   saveValues: function() {
   	
   	
   	this.setPreferenceString("file",this.elements["filename"].value);
   	this.setPreferenceString("contentType",this.elements["contentType"].value);
   	this.setPreferenceString("url",this.elements["url"].value);
   	this.setPreferenceString("username",this.elements["username"].value);
   	this.setPreferenceString("password",this.elements["password"].value);
   },
   
   importValues: function() {
      this.elements["filename"].value =  this.getPreferenceString("file");
      this.elements["contentType"].value =this.getPreferenceString("contentType");
      this.elements["url"].value = this.getPreferenceString("url");
      this.elements["username"].value = this.getPreferenceString("username");
      this.elements["password"].value = this.getPreferenceString("password");
   },
   
   savePreferences: function() {
      this.setPreferenceString("contentType",this.elements["contentType"].value);
      this.setPreferenceString("url",this.elements["url"].value);
   },
   
/*
 * Open a "browse for folder" dialog to locate an extension directory
 * Add the the selected directory to the dropdown list and set it as
 * the current working directory.
 */
   browseForFile: function() {
      var nsIFilePicker = Components.interfaces.nsIFilePicker;
      var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
      fp.init(window, "Choose File to Upload", nsIFilePicker.modeOpen);
      if(fp.show() == nsIFilePicker.returnOK) {
         var filenm = this.elements["filename"];
         var item = filenm.value = fp.file.path;
         //httprequesterService.file = fp.file.path;
         try {
            this.elements["contentType"].value = mimeService.getTypeFromFile(fp.file);
         } catch (ex) {
            this.elements["contentType"].value = "application/binary";
         }
      }
   },
   showGoogleLogin: function() {
      var currentApp = this;
      var data = {
         username: this.elements["username"].value,
         password: this.elements["password"].value,
         service: currentApp.lastService,
         auth: null
      };
      window.openDialog(
         'chrome://httprequester/content/google-login.xul','google-login','modal,centerscreen,chrome,resizable',
         data
      );
      if (data.success) {
         this.googleAuth = data.auth;
         //this.requestHeaders["authorization"] = "GoogleLogin auth="+this.googleAuth;
		 this.addRequestHeader(authorization,"GoogleLogin auth="+this.googleAuth);
         document.getElementById('google-login').setAttribute("label","Google Auth'd");
      }
      this.servive = data.service;
   },
   
   
   doMethodRequest: function() {
      var method = document.getElementById("method").value;
      if (method=="GET") {
         this.getURL();
      } else if (method=="POST") {
         this.postURL();
      } else if (method=="PUT") {
         this.putURL();
      } else if (method=="DELETE") {
         this.deleteURL();
      } else if (method=="HEAD") {
         this.headURL();
      } else if (method=="OPTIONS") {
         this.optionsURL();
      }
      else {
      	// custom methods
      	for (var i = 0; i < this.customWriteHttpMethods.length; i++) {
			if (method == this.customWriteHttpMethods[i]) {
				this.sendCustomCommand(method)
				break;
			}
		}
		for (var i = 0; i < this.customReadHttpMethods.length; i++) {
			if (method == this.customReadHttpMethods[i]) {
				this.getCustomCommand(method)
				break;
			}
		}
      }
   },
   
   postURL: function() {
      this.handleSend("POST");
   },
   
   putURL: function() {
      this.handleSend("PUT");
   },
   
   getURL: function() {
      this.handleGet("GET");
   },
    getURLHotKey: function(event) {
		if (event.keyCode==13) {  // if return key is pressed in URL field, do a GET
			 this.handleGet("GET");
		}
   },
   
   deleteURL: function() {
      this.handleGet("DELETE");
   },
   
   headURL: function() {
      this.handleGet("HEAD");
   },
   
   optionsURL: function() {
      this.handleGet("OPTIONS");
   },
   sendCustomCommand: function(method) {
      this.handleSend(method);
   },
   getCustomCommand: function(method) {
      this.handleGet(method);
   },
   
   handleSend: function(method) {
      var fpath = this.elements["filename"].value;
      var content = this.elements["content"].value;
      var urlstr = this.elements["url"].value;
      var ctype = this.elements["contentType"].value;
      if (ctype.length==0) {
         this.elements["contentType"].value = "text/xml";
         ctype = "text/xml";
      }
      
      urlstr = this.addParametersToURI(urlstr);
      
      if (urlstr.length==0) {
         alert("A URL must be specified.");
         /*
      } else if (fpath.length==0 && content.length==0) {
         alert("Either a file or content must be specified.");
         */
      } else if (fpath.length!=0 && content.length!=0) {
         alert("You can't have both a file and content to send.");
      } else if (fpath.length!=0) {
         this.synopsis = method+" on "+urlstr;
         this.sendFileToURL(urlstr,method,fpath,ctype);
      } else {
         this.synopsis = method+" on "+urlstr;
         this.sendContentToURL(urlstr,method,content,ctype);
      }
   },
   handleGet: function(method) {
      var urlstr = this.elements["url"].value;
      if (urlstr.length==0) {
         alert("A URL must be specified.");
      } else {
      	 // add default protocol if not set
      	 if ( urlstr.indexOf( "://") == -1 ) { 
      	 	urlstr = "http://" + urlstr;
      	 }
      	 
      	 urlstr = this.addParametersToURI(urlstr);

         this.synopsis = method+" on "+urlstr;
         this.getContentFromURL(urlstr,method);
      }
   },
   
   pathToFile: function(path) {
      var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(path);
      return file;
   },
   
   addParametersToURI : function(urlstr) { 
   	     var needSeparator = false;
		 var parameters = this.getParametersFromUI();
         for (var name in parameters) {
            if (needSeparator) {
               urlstr += "&";
            } else {
               if (urlstr.indexOf('?')<0) {
                  urlstr += "?";
               }
               else {
               		urlstr += "&";
               }
            }
			var val = encodeURIComponent(parameters[name]);
			if ( val != null && val.length > 0 ) { 
          	  urlstr += name+"="+ val;
			 }
			 else {
				urlstr += name;
			}
            needSeparator = true;
         }
         return urlstr;
   },
   
   onResult: function(status,xml,text,headers,statusText, id) {
	  var responseDateStamp = new Date().getTime();
      this.inprogress = null;
      if (this.progressDialog) {
         this.progressDialog.close();
         this.progressDialog = null;
      }
      var title = this.synopsis;
	var response = new this.ResponseTransaction();
	response.title = title;
	response.status = status;
	response.statusText = statusText;
	response.content = text;
	response.responseHeaders = headers;
	
	// get transaction for this id to add the response
	for ( var i = 0; i < this.transactions.length; i++ ) {
		if ( this.transactions[i].timeStamp == id ) {
			// set response time stamp			
			response.responseTimeStamp = responseDateStamp;
			
			this.transactions[i].responseTransaction = response;
			// now update the list with the response
			this.editTransactionInList( this.transactions[i] );
			
			break;
		}
	}
	
   },
   
   sendFileToURL: function(urlstr,method,fpath,ctype) {
      try{
         //alert("Sending "+fpath+" to "+urlstr+" as "+ctype+" via "+method);
         if (this.inprogress) {
            var requestToCancel = this.inprogress;
            this.inprogress = null;
            requestToCancel.abort();
         }
         var currentApp = this;
         var timeout = parseInt(this.elements["timeout-slider"].value)*1000;
         var username = this.elements["username"].value;
         var password = this.elements["password"].value;
         var file = this.pathToFile(fpath);
         var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
         .createInstance(Components.interfaces.nsIFileInputStream);
         fstream.init(file, 1, 0, 0);
         
         var bufferedStream = Components.classes["@mozilla.org/network/buffered-input-stream;1"]
         .createInstance(Components.interfaces.nsIBufferedInputStream);
         bufferedStream.init(fstream, file.fileSize);
         var currentOpenFile = fstream;
		 
		 
		 
		 
		 // create a Request
		var dateStamp = new Date().getTime();
		var transaction = new this.Transaction();
		transaction.timeStamp = dateStamp;
		
		var request = new this.RequestTransaction();
		request.httpMethod = method;
		request.url = urlstr;
		request.contentType = ctype;
		request.filename = fpath;
		request.requestHeaders =  this.getRequestHeadersFromUI();
		request.timeout = timeout;
		request.username = username;
		request.password = password;
		this.requestAdded( transaction, request );
		 
         var req = HTTP(
            method,
            urlstr, 
            {
               timeout: timeout,
               contentType: ctype,
               body: bufferedStream,
               headers: request.requestHeaders,
               username: username,
               password: password,
               returnHeaders: true,
			   id : transaction.timeStamp,
               onSuccess: function(status,xml,text,headers,statusText, id) {
                  fstream.close();
                  currentApp.onResult(status,xml,text,headers,statusText, id);
               },
               onFailure: function(status,xml,text,headers,statusText, id) {
                  fstream.close();
                  currentApp.onResult(status,xml,text,headers,statusText, id);
               }
            }
         );
         this.inprogress = {
            abort: function() {
               req.abort();
               fstream.close();
            }
         }
         
      } catch (error) {
         alert("Cannot process request due to: "+error.message);
      }
      
   },

   
  sendContentToURL: function(urlstr,method,content,ctype) {
     //alert(urlstr+" "+method+" "+content+" "+ctype);
     try{
        if (this.inprogress) {
           var requestToCancel = this.inprogress;
           this.inprogress = null;
           requestToCancel.abort();
        }
        var currentApp = this;
        var timeout = parseInt(this.elements["timeout-slider"].value)*1000;
        var username = this.elements["username"].value;
        var password = this.elements["password"].value;
		
		
		// create a Request
		var dateStamp = new Date().getTime();
		var transaction = new this.Transaction();
		transaction.timeStamp = dateStamp;
		
		var request = new this.RequestTransaction();
		request.httpMethod = method;
		request.url = urlstr;
		request.contentType = ctype;
		request.content = content;
		request.requestHeaders =  this.getRequestHeadersFromUI();
		request.timeout = timeout;
		request.username = username;
		request.password = password;
		this.requestAdded( transaction, request );
		
		
        this.inprogress = HTTP(
           method,
           urlstr, 
           {
              timeout: timeout,
              contentType: ctype,
              body: content,
              headers: request.requestHeaders,
              username: username,
              password: password,
			  id : transaction.timeStamp,
              returnHeaders: true,
              onOpened: function(request) {
                 if (!currentApp.progressDialog) {
                     currentApp.progressDialog = window.openDialog(
                        'chrome://httprequester/content/progress.xul','progress'+(new Date()).getTime(),'centerscreen,chrome,resizable',
                        {
                           url: urlstr,
                           status: "Sending...",
                           app: currentApp
                        }
                     );
                     currentApp.progressDialog.focus();
                     currentApp.receivingCount = 0;
                 }
              },
              onHeaders: function(request) {
                 currentApp.progressDialog.document.getElementById('status').value = 'Headers loaded...';
              },
              onLoading: function(request) {
                 currentApp.receivingCount++;
                 currentApp.progressDialog.document.getElementById('status').value = '('+currentApp.receivingCount+') Receiving...';
              },
              onSuccess: function(status,xml,text,headers,statusText, id) {
                 currentApp.onResult(status,xml,text,headers,statusText, id);
              },
              onFailure: function(status,xml,text,headers,statusText, id) {
                 currentApp.onResult(status,xml,text,headers,statusText, id);
              }
           }
        );
     } catch (error) {
        alert("Cannot process request due to: "+error.message);
     }
  },
  selectListItem: function() {
  		var selectedTreeItemIndex = document.getElementById("transaction-list").currentIndex; 
		if ( selectedTreeItemIndex >= 0 ) {
			var treeChildren = document.getElementById("transactiontreechildren");
			if ( treeChildren != null ) {
				if ( selectedTreeItemIndex >= treeChildren.childNodes.length ) {
					selectedTreeItemIndex = treeChildren.childNodes.length - 1;
				} 
				var selectedTreeItem = treeChildren.childNodes[selectedTreeItemIndex];
				 var transId = selectedTreeItem.getAttribute( "transactionID" );
			  	// get transaction for this id
					for (var i = 0; i < this.transactions.length; i++) {
						if (this.transactions[i].timeStamp == transId) {
							// found it
							this.updateUIForTransaction( this.transactions[i] );
							break;
						}
					}
			}
		}
  },
  
  updateUIForTransaction : function( transaction ) {
	this.initRequest(transaction.requestTransaction);
	if (transaction.responseTransaction != null) {
		Response.init(transaction.responseTransaction);
	}
	else {
		Response.clearResponseview();
	}

  },
  initRequest : function( request ) {
	this.elements["url"].value = request.url ? request.url : "";
	this.elements["filename"].value = request.filename ? request.filename : "";
	this.elements["contentType"].value = request.contentType ? request.contentType : "";
	this.elements["username"].value = request.username ? request.username : "";
	this.elements["password"].value = request.password ? request.password : "";
	this.elements["content"].value = request.content ? request.content : "";
	this.elements["timeout"].value = request.timeout ? request.timeout : "";
	
	var methodlist = document.getElementById("method"); 
	var items = methodlist.firstChild.childNodes;
	var count =  methodlist.firstChild.childNodes.length;
	for (var i = 0; i < count; i++) {
		var methodItem = methodlist.firstChild.childNodes[i];
		if (methodItem.getAttribute('value') == request.httpMethod) {
			methodlist.selectedItem = methodItem;
			break;
		}
	}
	
//      document.getElementById("base64-encode").onclick = function() {
//         var value = current.elements["content"].value;
//         if (value.length>0) {
//            var encoder = new Base64();
//            current.elements["content"].value = encoder.encode(value);
//         }
	
	// update headers:
	 // remove all headers:
	 var treeChildren = document.getElementById("treechildren");
	 if ( treeChildren != null && treeChildren.childNodes.length > 0 ) {
		 while (treeChildren.hasChildNodes()) {
			 treeChildren.removeChild(treeChildren.firstChild);
		}
	 }
	 for (var name in request.requestHeaders) {
	 	var value = request.requestHeaders[name];
	 	this.addRequestHeader(name, value);
	 }
	 
	 // remove parameters
	treeChildren = document.getElementById("paramtreechildren");
	 if ( treeChildren != null && treeChildren.childNodes.length > 0 ) {
		 while (treeChildren.hasChildNodes()) {
			 treeChildren.removeChild(treeChildren.firstChild);
		}
	 }
	 for (var name in request.parameters) {
	 	var value = request.parameters[name];
	 	this.addParameter(name, value);
	 }
	

  },
  addTransactionToList: function( transaction ) { 
  	var item = null;
   	var treeChildren = document.getElementById("transactiontreechildren");
	var treeItems = treeChildren.childNodes;
	if ( treeItems != null && treeItems.length >= this.getMaxHistory() ) { 
		treeChildren.removeChild(treeItems[treeItems.length-1]);
	} 
	
	try { 
	  var request = transaction.requestTransaction;
	  var response = transaction.responseTransaction;
    
      var len = treeItems.length;
      var item = null;

		// adding new item
	   	if ( !item ) {
	  	 	item = document.createElement("treeitem");
	  	 	item.setAttribute( "transactionID", transaction.timeStamp );
	  	 	var newRow = document.createElement("treerow");
	  	 	item.appendChild(newRow);
	  	 	var nameCell = document.createElementNS(XUL_NS,"treecell");
	         nameCell.setAttribute("label",request.httpMethod + " " + request.url);
	         var valueCell = document.createElementNS(XUL_NS,"treecell");
			 if (response != null) {
			 	valueCell.setAttribute("label", response.status + " " + response.statusText);
			 }
			 else {
			 	valueCell.setAttribute("label","");
			 }
			 var dateCell = document.createElementNS(XUL_NS,"treecell");
	         dateCell.setAttribute("label",this.getDateString(transaction.timeStamp));
			 
			 // add Content length time:
			 var contentLengthCell = document.createElementNS(XUL_NS,"treecell");
			 var contentLength = 0;;
			 if (response != null && response.content != null ) { 
			 	// use Content-Length header if it was supplied by response
			 	if ( response.responseHeaders != null && response.responseHeaders["Content-Length"] != null  ) {
			 		contentLength = response.responseHeaders["Content-Length"].trim();
			 	} 
			 	else { 
			 		// otherwise use the length of the response body
			 		contentLength = response.content.length;
			 	}
			 }
	         contentLengthCell.setAttribute("label",contentLength);
			 
			 // add elapsed time:
			 var elapsedTimeCell = document.createElementNS(XUL_NS,"treecell");
			 var elapsedTime = "";
			 if (transaction.timeStamp != null && response != null &&  response.responseTimeStamp != null) {
			 	elapsedTime = (response.responseTimeStamp - transaction.timeStamp) + " ms";
			 }
	         elapsedTimeCell.setAttribute("label",elapsedTime);
	         
	         newRow.appendChild(nameCell);
	         newRow.appendChild(valueCell);
			 newRow.appendChild(dateCell);
			 newRow.appendChild(contentLengthCell);
			 newRow.appendChild(elapsedTimeCell);
	  	 	
	  	 	treeChildren.appendChild(item);
	  	 	 // insert item to the head of the list
			 if (len > 0) {
			 	treeChildren.insertBefore(item, treeChildren.firstChild);
			 }
			 else {
				 treeChildren.appendChild(item);
			 }
			 
		 	// make sure that newly selected row is shown in scroll pane
		  	var tree = document.getElementById("transaction-list");			
			var boxobject = tree.boxObject;
			boxobject.QueryInterface(Components.interfaces.nsITreeBoxObject);
			// make sure it shows up at the top if possible
			boxobject.scrollToRow(0);
			 
	   	}
   		
   	 } catch (ex) {
         alert(ex);
      }
  },
  getDateString : function( timeStamp ) { 
  	var date = new Date(timeStamp);
	
	var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

	var dateStr =  m_names[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
	
	
	// get time
	
	
	var a_p = "";
	var curr_hour = date.getHours();
	if (curr_hour < 12)
	   {
	   a_p = "AM";
	   }
	else
	   {
	   a_p = "PM";
	   }
	if (curr_hour == 0)
	   {
	   curr_hour = 12;
	   }
	if (curr_hour > 12)
	   {
	   curr_hour = curr_hour - 12;
	   }
	
	var curr_min = date.getMinutes();
	
	curr_min = curr_min + "";
	
	if (curr_min.length == 1)
	   {
	   curr_min = "0" + curr_min;
	   }
	   
	   var curr_sec = date.getSeconds();
	
	curr_sec = curr_sec + "";
	
	if (curr_sec.length == 1)
	   {
	   curr_sec = "0" + curr_sec;
	   }


	dateStr = dateStr + " - " + curr_hour + ":" + curr_min + ":" + curr_sec + " " + a_p;
	
	return dateStr;
  
  },
   editTransactionInList: function( transaction ) { 
	try {
	  var request = transaction.requestTransaction;
	  var response = transaction.responseTransaction;
	  
	  
	  	var item = null;
   	var treeChildren = document.getElementById("transactiontreechildren");
	var treeitems = treeChildren.childNodes;
 	var len = treeitems.length;	

 	  // search based on timestamp
      for (var i=0; i<len; i++) {
         item = treeitems[i];
        var transId = item.getAttribute( "transactionID" );
		if (transId != null) {
			if (transId == transaction.timeStamp) {
				// found the matching transaction
				break;
			}
			else {
				item = null;
			}
		}
      }
      if (!item) {
		item = item = treeitems[0];
	  }
	
	
		 var cells = item.getElementsByTagName('treecell');
         var nameCell = cells.item(0);
         var valueCell = cells.item(1);
		 var dateCell = cells.item(2);
		 var contentLengthCell = cells.item(3);
		 var elapsedTimeCell = cells.item(4);
		 
         nameCell.setAttribute("label",request.httpMethod + " " + request.url);
         valueCell.setAttribute("label",response.status + " " + response.statusText);
		 dateCell.setAttribute("label",this.getDateString(transaction.timeStamp));
		 
         // add Content length time:
		 var contentLength = 0;;
		 if (response != null && response.content != null ) { 
		 	// use Content-Length header if it was supplied by response
		 	if ( response.responseHeaders != null && response.responseHeaders["Content-Length"] != null  ) {
		 		contentLength = response.responseHeaders["Content-Length"].trim();
		 	} 
		 	else { 
		 		// otherwise use the length of the response body
		 		contentLength = response.content.length;
		 	}
		 }
         contentLengthCell.setAttribute("label",contentLength);
         
          // add elapsed time:
		 var elapsedTime = "";
		 if (transaction.timeStamp != null && transaction.responseTransaction != null &&  transaction.responseTransaction.responseTimeStamp != null) {
		 	elapsedTime = (response.responseTimeStamp - transaction.timeStamp) + " ms";
		 }
         elapsedTimeCell.setAttribute("label",elapsedTime);
         
		 
		 // now select this guy
		 var treeSelection = document.getElementById("transaction-list").view.selection;	
		try {
			treeSelection.select(i);
		
			// make sure that newly selected row is shown in scroll pane
		  	var tree = document.getElementById("transaction-list");			
			var boxobject = tree.boxObject;
			boxobject.QueryInterface(Components.interfaces.nsITreeBoxObject);
			// make sure it shows up at the top if possible
			boxobject.scrollToRow(i);
		}
		catch( e ) {
			alert(ex);
		}
		 
      } catch (ex) {
         alert(ex);
      }
  },
  
   cloneObject: function(source) {
    for (i in source) {
        if (typeof source[i] == 'source') {
            this[i] = new cloneObject(source[i]);
        }
        else{
            this[i] = source[i];
		}
	 }
},

	requestAdded : function(transaction, request) {
		transaction.requestTransaction = request;
		this.insertIntoArray( transaction, 0, this.transactions, this.getMaxHistory() );
		//alert( "transactons: " + JSON.stringify(this.transactions) );
		
		// clear the response view
		Response.clearResponseview();
		this.addTransactionToList(transaction);
		
		
		// update URL menu
		// if it exists, remove it; we'll re-add to the beginning
		for (var i = 0; i < this.urlHistory.length; i++) {
			if (request.url == this.urlHistory[i]) {
				this.removeElement( this.urlHistory, i );
				break;
			}
		}
		
		// add it to history
		this.insertIntoArray( request.url, 0, this.urlHistory, this.getMaxUrlHistory() );
		
		// update menu
		this.updateMenuList( "url", this.urlHistory );
		// end url
		
		// update content type
		if (request.contentType != null && request.contentType.length > 0) {
			for (var i = 0; i < this.contentTypeHistory.length; i++) {
				if (request.contentType == this.contentTypeHistory[i]) {
					this.removeElement(this.contentTypeHistory, i);
					break;
				}
			}
			
			// add it to history
			this.insertIntoArray(request.contentType, 0, this.contentTypeHistory, this.getMaxContentTypeHistory());
			
			// update menu
			this.updateMenuList("ctype", this.contentTypeHistory);
		}
		
		// update headers; go through each and add
		var updated = false;
		if ( request.requestHeaders != null ) { 
			for (var name in request.requestHeaders) {
				for (var i = 0; i < this.headerNameHistory.length; i++) {
					if (name == this.headerNameHistory[i]) {
						this.removeElement(this.headerNameHistory, i);
						break;
					}
				}
				// add it to history
				updated = true;
				this.insertIntoArray(name, 0, this.headerNameHistory, this.getMaxHeaderHistory());
			}
			
			if ( updated ) {
				// update menu
				this.updateMenuList("header-name", this.headerNameHistory);
			}
		}

},

  updateMenuList : function( menuListName, listArray ) { 
  		var urllist = document.getElementById(menuListName);
		while ( urllist.firstChild.hasChildNodes()) {
		      urllist.firstChild.removeChild( urllist.firstChild.firstChild);
		}	
		
		for (var i = 0; i < listArray.length; i++) {
			var newUrl = document.createElement("menuitem");
			newUrl.setAttribute("label", listArray[i]);
			urllist.firstChild.appendChild(newUrl);
		} 
  
  },
 
  getContentFromURL: function(urlstr,method) {
     try{
        if (this.inprogress) {
           var requestToCancel = this.inprogress;
           this.inprogress = null;
           requestToCancel.abort();
        }
        var currentApp = this;
        var timeout = parseInt(this.elements["timeout-slider"].value)*1000;
        var username = this.elements["username"].value;
        var password = this.elements["password"].value;
		
		
		// create a Request
		var dateStamp = new Date().getTime();
		var transaction = new this.Transaction();
		transaction.timeStamp = dateStamp;
		
		var request = new this.RequestTransaction();
		request.httpMethod = method;
		request.url = urlstr;
		
		request.requestHeaders = this.getRequestHeadersFromUI();	
		
		request.timeout = timeout;
		request.username = username;
		request.password = password;
		
		this.requestAdded( transaction, request );
		// end create

		
        this.inprogress = HTTP(
           method,
           urlstr, 
           {
              timeout: timeout,
              username: username,
              password: password,
              headers: request.requestHeaders,
              returnHeaders: true,
			  id : transaction.timeStamp,
              onOpened: function(request) {
                 if (!currentApp.progressDialog) {
                     currentApp.progressDialog = window.openDialog(
                        'chrome://httprequester/content/progress.xul','progress'+(new Date()).getTime(),'centerscreen,chrome,resizable',
                        {
                           url: urlstr,
                           status: "Sending...",
                           app: currentApp
                        }
                     );
                     currentApp.progressDialog.focus();
                     currentApp.receivingCount = 0;
                 }
              },
              onHeaders: function(request) {
                 currentApp.progressDialog.document.getElementById('status').value = 'Headers loaded...';
              },
              onLoading: function(request) {
                 currentApp.receivingCount++;
                 currentApp.progressDialog.document.getElementById('status').value = '('+currentApp.receivingCount+') Receiving...';
              },
              onSuccess: function(status,xml,text,headers,statusText, id) {
                 currentApp.onResult(status,xml,text,headers,statusText, id);
              },
              onFailure: function(status,xml,text,headers,statusText, id) {
                 currentApp.onResult(status,xml,text,headers,statusText, id);
              }
           }
        );
     } catch (error) {
        alert("Cannot process request due to: "+error.message);
     }
  },

  // from the array: transactions	
removeElement: function(transactions, index) {

    for (index = index; index<transactions.length;index++) {
        // assigns the value of elementnr+1 to elementnr, so you move all items by 1
        transactions[index] = transactions[index + 1];
    }
    transactions.length=transactions.length-1;
    
},

// position is the number where you want to add the new element (transaction) into 
// the array: transactions	
insertIntoArray: function( transaction, position, transactions, maxcount) {
	var origLength = transactions.length;
	if ( position > origLength ) {
		position = origLength;
	}
	
	transactions.length = transactions.length + 1;
	
	for ( var i = origLength	; i >=0; i-- ) {
		if ( i == position ) {
			transactions[i] = transaction;
			break;
		}
		else if ( i > position ) {
			transactions[i] = transactions[i-1];
		}
		else if ( i < position ) {
			break;
		}
	}
	
	if (transactions.length > maxcount) {
		transactions.length=maxcount;
	}
	
},



  copyToClipBoard: function() {
	 var transactionStr = this.getRequestAndResponseString();	  
	 this.copyText(transactionStr );
  },
  getSelectedTransactionId: function() { 
  	var transId = null;
  	var selectedTreeItemIndex = document.getElementById("transaction-list").currentIndex; 
	  if ( selectedTreeItemIndex >= 0 ) {
		var treeChildren = document.getElementById("transactiontreechildren");
		if ( treeChildren != null ) {
			if ( selectedTreeItemIndex >= treeChildren.childNodes.length ) {
				selectedTreeItemIndex = treeChildren.childNodes.length - 1;
			} 
			var selectedTreeItem = treeChildren.childNodes[selectedTreeItemIndex];
	 		 transId = selectedTreeItem.getAttribute( "transactionID" );
		}
	  }
	  return transId;
  },
   getRequestAndResponseString: function() {
	// https://developer.mozilla.org/en/Using_the_Clipboard
	  var transactionStr = "";
	 var transaction = null;	  
	 var transId = this.getSelectedTransactionId();
	 if ( transId != null ) {
 		 for (var i = 0; i < this.transactions.length; i++) {
			if (this.transactions[i].timeStamp == transId) {
				// found it
				transaction =  this.transactions[i];
				break;
			}
		}
	  }
	  
		// get transaction for this id
	  if (transaction != null) {
		
		var request = transaction.requestTransaction;
		var response = transaction.responseTransaction;
		
		//transactionStr += this.getDateString(transaction.timeStamp) + "\r\n";
		
		//transactionStr += "REQUEST ---> :" + "\r\n";
		transactionStr += request.httpMethod + " " + request.url + "\r\n";
		
		//transactionStr += "Request Headers:" + "\r\n";
		for (var name in request.requestHeaders) {
			//transactionStr += " ";
			transactionStr += name + ": " + request.requestHeaders[name] + "\r\n";
		}
		//transactionStr += "\r\n";
		
		if (request.contentType != null) {
			transactionStr += "Content-Type: " +  request.contentType + "\r\n";
		}
		if (request.filename != null) {
			transactionStr += "Filename: " +  request.filename + "\r\n";
		}
		if (request.username != null && request.username.length > 0 ) {
			transactionStr += "Username: " +  request.username + "\r\n";
		}
		
		if (request.content != null) {
			//transactionStr += "Request body:" + "\r\n";
			transactionStr += request.content;
		}
		transactionStr += "\r\n";
		transactionStr += "\r\n";
		
		if (response != null) {
			//transactionStr += "<--- RESPONSE:" + "\r\n";
			transactionStr += " -- response --" + "\r\n";
			transactionStr += response.status + " " + response.statusText + "\r\n";
			//transactionStr += "Response Headers:" + "\r\n";
			
			for (var name in response.responseHeaders) {
				//transactionStr += " ";
				transactionStr += name + ": " + response.responseHeaders[name] + "\r\n";
			}
			//transactionStr += "\r\n";
			//transactionStr += "Response body:" + "\r\n";
			if (response.content != null) {
				transactionStr += response.content;
			}
			transactionStr += "\r\n";
		}
	  }
	  return transactionStr;
  },
   getRequestString: function() {
	// https://developer.mozilla.org/en/Using_the_Clipboard
	 var transactionStr = "";
	 var transaction = null;	  
	 // get transaction for this id
	 var transId = this.getSelectedTransactionId();
	 if ( transId != null ) {
 		 for (var i = 0; i < this.transactions.length; i++) {
			if (this.transactions[i].timeStamp == transId) {
				// found it
				transaction =  this.transactions[i];
				break;
			}
		}
	  }
		
	  
	  if (transaction != null) {
		
		var request = transaction.requestTransaction;
		var response = transaction.responseTransaction;
		
		//transactionStr += this.getDateString(transaction.timeStamp) + "\r\n";
		
		//transactionStr += "REQUEST ---> :" + "\r\n";
		transactionStr += request.httpMethod + " " + request.url + "\r\n";
		
		//transactionStr += "Request Headers:" + "\r\n";
		for (var name in request.requestHeaders) {
			//transactionStr += " ";
			transactionStr += name + ": " + request.requestHeaders[name] + "\r\n";
		}
		//transactionStr += "\r\n";
		
		if (request.contentType != null) {
			transactionStr += "Content-Type: " +  request.contentType + "\r\n";
		}
		if (request.filename != null) {
			transactionStr += "Filename: " +  request.filename + "\r\n";
		}
		if (request.username != null && request.username.length > 0 ) {
			transactionStr += "Username: " +  request.username + "\r\n";
		}
		
		if (request.content != null) {
			//transactionStr += "Request body:" + "\r\n";
			transactionStr += request.content;
		}

	  }
	  return transactionStr;
  },
  
  editRawRequest: function() {
	var requestStr = this.getRequestString();

	var newOptions = {
		request: requestStr,
		updatedRequest: ""
	};
 	window.openDialog(
	      'chrome://httprequester/content/request-entry.xul',
		  'httprequester-request-entry'+(new Date()).getTime(),
		  "chrome,resizable,modal",
		  newOptions
	   );
	
	if (newOptions.updatedRequest != null && newOptions.updatedRequest.length > 0) {
		this.executeRawRequest(newOptions.updatedRequest);
	}
	
	
},

 saveStoredRequest: function() {
 	try {
	 	var transaction = null;	  
        // get transaction for this id
		 var transId = this.getSelectedTransactionId();
		
		// get transaction for this id
		for (var i = 0; i < this.transactions.length; i++) {
			if (this.transactions[i].timeStamp == transId) {
				// found it
				transaction =  this.transactions[i];
				var result = window.prompt("Add name for the stored request:\n" + transaction.requestTransaction.url);
				if ( result != null ) {
					var history = App.getPreferenceComplex("history.savedRequests");
					 var storedTransactions =  new Array();

					  if (history != null && history.length > 0) {
  						 storedTransactions = JSON.parse(history);
					  }
					 
					transaction.name = result;
					this.insertIntoArray( transaction, 0, storedTransactions, 100 );
					var storedHistoryString = JSON.stringify(storedTransactions);
					this.setPreferenceComplex( "history.savedRequests", storedHistoryString );
				}
				break;
			}
		}
		  
      } catch (ex) {
         alert(ex);
      }
},

loadStoredRequest: function() {
	var newOptions = {
		selectedTransaction: null,
		shouldExecute: false
	};
 	window.openDialog(
	      'chrome://httprequester/content/loadRequest.xul',
		  'httprequester-request-entry'+(new Date()).getTime(),
		  "chrome,resizable,modal",
		  newOptions
	   );
	
	if (newOptions.selectedTransaction != null ) {
		var storedTrans = JSON.parse(newOptions.selectedTransaction);
		if ( newOptions.shouldExecute == true ) {
			// user has chosen to execute the new request
			// fill the UI with the new request
			this.updateUIForTransaction(storedTrans);
			
			// execute request based on UI values
			this.doMethodRequest();
		}
		else { 
			// simply load old stored request into list
			this.insertIntoArray( storedTrans, 0, this.transactions, this.getMaxHistory() );
			this.addTransactionToList(storedTrans);
			
			 // select new entry in list
			var treeSelection = document.getElementById("transaction-list").view.selection;	
			try {
				treeSelection.select(0);
			}
			catch( e ) {
				alert(ex);
			}
		}
	}
},

contentBodyRadioButtonChanged: function() {
    var group = document.getElementById("contentBodyGroup");    
    
    if ( group.selectedIndex == 0 ) {
    	document.getElementById("filename").setAttribute("disabled", "true");
    	document.getElementById("browse-file").setAttribute("disabled", "true");
    	
    	document.getElementById("content").removeAttribute("disabled" );
    }
    else {
    	document.getElementById("filename").removeAttribute("disabled" );
    	document.getElementById("browse-file").removeAttribute("disabled" );
    	
    	document.getElementById("content").setAttribute("disabled", "true");
    }
},

  viewRawRequest: function() {
	var transaction = this.getRequestAndResponseString();	  

	var newOptions = {
		request: transaction,
		updatedRequest: ""
	};
 	window.openDialog(
	      'chrome://httprequester/content/request-entry.xul',
		  'httprequester-request-entry'+(new Date()).getTime(),
		  "chrome,resizable,modal",
		  newOptions
	   );
	
	if (newOptions.updatedRequest != null && newOptions.updatedRequest.length > 0) {
		this.executeRawRequest(newOptions.updatedRequest);
	}
	
	
},
  pasteRawRequest: function() {
	var requestStr = this.copyTextfromClipboard();
	var newOptions = {
		request: requestStr,
		updatedRequest: ""
	};
 	window.openDialog(
	      'chrome://httprequester/content/request-entry.xul',
		  'httprequester-request-entry'+(new Date()).getTime(),
		  "chrome,resizable,modal",
		  newOptions
	   );
	
	if (newOptions.updatedRequest != null && newOptions.updatedRequest.length > 0) {
		this.executeRawRequest(newOptions.updatedRequest);
	}
},
trim: function(s) {
	if ( s != null && s.length > 0 ) { 
		// Remove leading spaces and carriage returns
		while ((s.substring(0,1) == ' ') ) {
		 	s = s.substring(1,s.length); 
		 }
		
		// Remove trailing spaces and carriage returns
		while ((s.substring(s.length-1,s.length) == ' ') ) { 
			s = s.substring(0,s.length-1); 
		}
	}

	return s;
},
getMethod: function (readIn ) { 
	var method = null;
	if (readIn.indexOf("GET") == 0) {
		method = "GET";
	}
	else if (readIn.indexOf("POST") == 0) {
		method = "POST";
	}
	else if (readIn.indexOf("PUT") == 0) {
		method = "PUT";
	}
	else if (readIn.indexOf("DELETE") == 0) {
		method = "DELETE";
	}
	else if (readIn.indexOf("HEAD") == 0) {
		method = "HEAD";
	}
	else if (readIn.indexOf("OPTIONS") == 0) {
		method = "OPTIONS";
	}
	else {
		method = readIn;
	}
	return method;
},
executeRawRequest: function( requestStr ) {
	// create a Request
	var dateStamp = new Date().getTime();
	var transaction = new this.Transaction();
	transaction.timeStamp = dateStamp;
	
	var request = new this.RequestTransaction();
//		request.timeout = timeout;
//		request.username = username;
//		request.password = password;

	var text = requestStr;
	this.clearRequestView();
	Response.clearResponseview();
	if (text != null) {
		
		// if the request string actually contains the response as well
		var responseStartIndex = text.lastIndexOf( "\n\n -- response --" );
		if ( responseStartIndex != -1 ) { 
			text = text.substring(0, responseStartIndex);
		}
		
		var uri = null;
		var textLines = this.splitOnAllNewlines(text);
		var index = 0;
		var readIn = textLines[index];
		var method = this.getMethod(readIn);
		if (method == null) {
			// first line may be URI
			if (readIn.indexOf("http") == 0) {
				uri = this.trim(readIn);
			}
			while (index < textLines.length && method == null) {
				index = index + 1;
				readIn = textLines[index];
				method = this.getMethod(readIn);
			}
		}
		
		if (uri == null) {
			var endIndex = readIn.lastIndexOf("HTTP");
			if (endIndex == -1) {
				endIndex = readIn.length;
			}
			var beginIndex = method.length;
			uri = this.trim(readIn.substring(beginIndex, endIndex));
		}
		
		if (uri != null && uri.indexOf("http") != 0) {
			// uri is not of type:
			// 		GET http://www.w3.org/pub/WWW/TheProject.html HTTP/1.1
			// but of:
			//		GET /pub/WWW/TheProject.html HTTP/1.1
			//      Host: www.w3.org
			index = index + 1;
			readIn = textLines[index];
			if (readIn.indexOf("Host:") == 0) {
				var host = this.trim(readIn.substring("Host:".length));
				
				var defaultProtocol = this.getPreferenceString("default.protocol");
				if ( defaultProtocol == null || defaultProtocol.length == 0 ) {
					defaultProtocol = "https";
				}
				uri = defaultProtocol + "://" + host + uri;
			}
			else {
				// Host was not the next line - something not right; roll back to previous line and try to continue
				index--;
			}
		}
		
		var requestHeadersFromUI = {};
	   
		index = index + 1;
		var inBody = false;
		var content = "";
		while (index < textLines.length) {
			readIn = textLines[index];
			if (!inBody) {
				var colonIndex = readIn.indexOf(": ");   
				// looking for headers by checking for a word followed by a colon then a space:
				// example:  
				//  	Accept: none
				//		Keep-Alive: 115
				if (colonIndex != -1) {
					var spaceCheck = readIn.indexOf(" ");
					if (spaceCheck == -1 || spaceCheck > colonIndex) {
						// add header
						var name = readIn.substring(0,colonIndex);
						var value = readIn.substring( colonIndex + ": ".length );
						if ("Content-Type"==name) {
							request.contentType = value;
						}
						else {
							requestHeadersFromUI[name] = value;
						}
					}
					else {
						inBody = true;
					}
				}
				else {
					inBody = true;
				}
			}
			if (inBody ) { 
				// add to text body
				content = content + readIn;
				if ( index + 1 < textLines.length ) {
					content += "\r\n";
				}
			}
			index++;
		}
		request.url = uri;
		request.httpMethod = method;
		request.content = content;
	 	request.requestHeaders = requestHeadersFromUI;   
		transaction.requestTransaction = request;
		
		// fill the UI with the new request
		this.updateUIForTransaction(transaction);
		
		// execute the new request based on UI values
		this.doMethodRequest();
	
	}
},

  
  copyTextfromClipboard : function ()  {            
   // =========================================================================
      var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
      if (!clip) return null;
   
      var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
      if (!trans) return null;
      
      trans.addDataFlavor("text/unicode");     

      clip.getData(trans, clip.kGlobalClipboard);  
         
      var str       = new Object();  
      var strLength = new Object();  
      
      try {   // 'try' to prevent error with empty or non-text clipboard content
         trans.getTransferData("text/unicode", str, strLength);  
      
         if (str) str       = str.value.QueryInterface(Components.interfaces.nsISupportsString);  
         if (str) pastetext = str.data.substring(0, strLength.value / 2);  
      
         if (pastetext != "") return pastetext;
      } catch (ex) {};
      return null; 
   },

  
  copyText: function( copytext) { 
  	  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
      if (!str) 
          return false;
      
      str.data = copytext;
      
      var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
      if (!trans) 
          return false;
      
      trans.addDataFlavor("text/unicode");
      trans.setTransferData("text/unicode", str, copytext.length * 2);
      
      var clipid = Components.interfaces.nsIClipboard;
      var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
      if (!clip) 
          return false;
      
      clip.setData(trans, null, clipid.kGlobalClipboard);
  },

  clearHistory: function() { 
   // clear list
  this.transactions = new Array();
   
   // clear list
	 var treeChildren = document.getElementById("transactiontreechildren");
	 if ( treeChildren != null && treeChildren.childNodes.length > 0 ) {
		 while (treeChildren.hasChildNodes()) {
			 treeChildren.removeChild(treeChildren.firstChild);
		}
	 }
  },

  makeParameterPost: function() {
     this.elements["contentType"].value = "application/x-www-form-urlencoded";
     var body = "";
	 var parameters = this.getParametersFromUI();
	 
	 // now remove the parameters from the UI; don't want them to get added to the 
	 // request URI on submit
	 var treeChildren = document.getElementById("paramtreechildren");
	 if ( treeChildren != null && treeChildren.childNodes.length > 0 ) {
		 while (treeChildren.hasChildNodes()) {
			 treeChildren.removeChild(treeChildren.firstChild);
		}
	 }
	 
     for (var name in parameters) {
        if (body.length>0) {
           body += "&";
        }
		
		var val = encodeURIComponent(parameters[name]);
		if ( val != null && val.length > 0 ) { 
      	   body += name+"="+ val;
		 }
		 else {
			 body += name;
		}
     }
     this.elements["content"].value = body;
     
     
     
     
  },
  clearRequest : function() {
	this.clearRequestView();
	Response.clearResponseview();
	
},
splitOnAllNewlines : function(input) {
	// just use common newline to read in lines - check for strings that end in \r (to handle windows \r\n)
	var newline = "\n";
	var returnLine = "\r";
	
	var remindersArray = input.split(newline);	
	var returnArray = new Array();	
	var returnArrayIndex = 0;
	for ( var index = 0; index < remindersArray.length; index++ ) {
		var readIn = remindersArray[index];	
		/* --------
		if (readIn.length > 0 &&  readIn.lastIndexOf(returnLine) == readIn.length -1 ) {
			readIn = readIn.substring(0, readIn.length -1 );
		} ---- */
		while (readIn.length > 0 &&  readIn.lastIndexOf(returnLine) == readIn.length -1 ) {
			readIn = readIn.substring(0, readIn.length -1 );
		}
		
		returnArray[returnArrayIndex] = readIn;
		returnArrayIndex++;
	}	
	return returnArray;
},
clearRequestView : function() {
	this.elements["url"].value =  "";
	this.elements["filename"].value =  "";
	this.elements["contentType"].value =  "";
	this.elements["username"].value =  "";
	this.elements["password"].value =  "";
	this.elements["content"].value =  "";
	this.elements["timeout"].value =  "";
	
	var methodlist = document.getElementById("method"); 
	var items = methodlist.firstChild.childNodes;
	var count =  methodlist.firstChild.childNodes.length;
	
//      document.getElementById("base64-encode").onclick = function() {
//         var value = current.elements["content"].value;
//         if (value.length>0) {
//            var encoder = new Base64();
//            current.elements["content"].value = encoder.encode(value);
//         }
	
	// update headers:
	// remove all headers:
	 var treeChildren = document.getElementById("treechildren");
	 if ( treeChildren != null && treeChildren.childNodes.length > 0 ) {
		 while (treeChildren.hasChildNodes()) {
			 treeChildren.removeChild(treeChildren.firstChild);
		}
	 }
	 
	 // remove parameters
	 treeChildren = document.getElementById("paramtreechildren");
	 if ( treeChildren != null && treeChildren.childNodes.length > 0 ) {
		 while (treeChildren.hasChildNodes()) {
			 treeChildren.removeChild(treeChildren.firstChild);
		}
	 }

	},
   onAddChangeHeader: function() {
      var name = document.getElementById("header-name").value;
      if (!name) {
         return;
      }
      var value = document.getElementById("header-value").value;
      //this.requestHeaders[name] = value;
      this.addRequestHeader(name,value);
   },
   getAllSelectedIndices : function( treechildren, tree) {
	var treeChildren = document.getElementById(treechildren);
	var indices = new Array();
	
	var start = new Object();
	var end = new Object();
	var numRanges =  document.getElementById(tree).view.selection.getRangeCount();
	
	for (var t = 0; t < numRanges; t++){
	  document.getElementById(tree).view.selection.getRangeAt(t,start,end);
	  for (var v = start.value; v <= end.value; v++){
	    	indices[indices.length] = v;
	  }
	}

	return indices;
}, 
selectHeader :function (event) {
	// when a header is selected in the list, we will update the name/value text fields as well
	// so they can easily be edited
	var selectedTreeItemIndex = document.getElementById("header-list").currentIndex; 
	if ( selectedTreeItemIndex >= 0 ) {
		var treeChildren = document.getElementById("treechildren");
		if ( treeChildren != null ) {
			if ( selectedTreeItemIndex >= treeChildren.childNodes.length ) {
				selectedTreeItemIndex = treeChildren.childNodes.length - 1;
			} 
			var selectedTreeItem = treeChildren.childNodes[selectedTreeItemIndex];
			if ( selectedTreeItem != null ) {
				var nameCell = selectedTreeItem.getElementsByTagName('treecell').item(0);
				var valueCell = selectedTreeItem.getElementsByTagName('treecell').item(1);
				var headername = nameCell.getAttribute('label');
				var	headervalue = valueCell.getAttribute('label');
				
				document.getElementById("header-name").value = headername;
    			document.getElementById("header-value").value = headervalue;
			}
		}
	}
	
},
   addRequestHeader: function(name,value) {
   	var item = null;
   	var treeChildren = document.getElementById("treechildren");
	var treeitems = treeChildren.childNodes;
	
	try { 
		for (var i=0; i < treeitems.length; i++) {
			item = treeitems[i];
			var nameCell = item.getElementsByTagName('treecell').item(0);
	         if (nameCell.getAttribute('label')==name) {
	            break;
	         }
	         item = null;
		}
		
		// adding new item
	   	if ( !item ) {
	   		var treeChildren = document.getElementById("treechildren"); 
	  	 	var newItem = document.createElement("treeitem");
			var newRow = document.createElement("treerow");
			var nameLabel = document.createElement("treecell");
			var valLabel = document.createElement("treecell");
			newItem.appendChild(newRow);
			newRow.appendChild(nameLabel);
			newRow.appendChild(valLabel);
	   		nameLabel.setAttribute("label", name);
	   		valLabel.setAttribute("label", value);
	   		treeChildren.appendChild(newItem);
	   	}
	   	else { 
	   		// updating existing item
	   		 var cells = item.getElementsByTagName('treecell');
	         var nameCell = cells.item(0);
	         var valueCell = cells.item(1);
	         nameCell.setAttribute("label",name);
	         valueCell.setAttribute("label",value);
	   	}
   		
   	 } catch (ex) {
         alert(ex);
      }
   	
   },
   onDeleteHeader: function() {
    var treeChildren = document.getElementById("treechildren");
	var indices = this.getAllSelectedIndices("treechildren", "header-list" );
	for ( var i = indices.length-1; i >= 0; i-- ) {
		var index = indices[i];
    	var selectedTreeItem = treeChildren.childNodes[index];
		if (selectedTreeItem != null) {
			treeChildren.removeChild(selectedTreeItem);
		}
	 }
   },
  
   getRequestHeadersFromUI : function() {
	  var requestHeadersFromUI = {};
	  
	 var item = null;
     var treeChildren = document.getElementById("treechildren");
	 var treeitems = treeChildren.childNodes;
	
	 try { 
		for (var i=0; i < treeitems.length; i++) {
			item = treeitems[i];
			 var cells = item.getElementsByTagName('treecell');
	         var nameCell = cells.item(0);
	         var name = nameCell.getAttribute('label');
			 var valueCell = cells.item(1);
	         var value = valueCell.getAttribute('label');
	         requestHeadersFromUI[name] = value;
		 }
      } catch (ex) {
         alert(ex);
      }
	  return requestHeadersFromUI;
	}, 
   
   
   onAddChangeParameter: function() {
      var name = document.getElementById("parameter-name").value;
      if (!name) {
         return;
      }
      var value = document.getElementById("parameter-value").value;
      //this.parameters[name] = value;
      this.addParameter(name,value);
   },
   addParameter: function(name,value) {
    var item = null;
   	var treeChildren = document.getElementById("paramtreechildren");
	var treeitems = treeChildren.childNodes;
	
	try { 
		for (var i=0; i < treeitems.length; i++) {
			item = treeitems[i];
			var nameCell = item.getElementsByTagName('treecell').item(0);
	         if (nameCell.getAttribute('label')==name) {
	            break;
	         }
	         item = null;
		}
		
		// adding new item
	   	if ( !item ) {
	   		var treeChildren = document.getElementById("paramtreechildren"); 
	  	 	var newItem = document.createElement("treeitem");
			var newRow = document.createElement("treerow");
			var nameLabel = document.createElement("treecell");
			var valLabel = document.createElement("treecell");
			newItem.appendChild(newRow);
			newRow.appendChild(nameLabel);
			newRow.appendChild(valLabel);
	   		nameLabel.setAttribute("label", name);
	   		valLabel.setAttribute("label", value);
	   		treeChildren.appendChild(newItem);
	   	}
	   	else { 
	   		// updating existing item
	   		 var cells = item.getElementsByTagName('treecell');
	         var nameCell = cells.item(0);
	         var valueCell = cells.item(1);
	         nameCell.setAttribute("label",name);
	         valueCell.setAttribute("label",value);
	   	}
   		
   	 } catch (ex) {
         alert(ex);
      }
   },
   getParametersFromUI : function() { 
	 var parametersFromUI = {};
	  
	 var item = null;
     var treeChildren = document.getElementById("paramtreechildren");
	 var treeitems = treeChildren.childNodes;
	
	 try { 
		for (var i=0; i < treeitems.length; i++) {
			item = treeitems[i];
			 var cells = item.getElementsByTagName('treecell');
	         var nameCell = cells.item(0);
	         var name = nameCell.getAttribute('label');
			 var valueCell = cells.item(1);
	         var value = valueCell.getAttribute('label');
	         parametersFromUI[name] = value;
		 }
      } catch (ex) {
         alert(ex);
      }
	  return parametersFromUI;
	}, 
	
	onDeleteTransaction: function() {
      try {
		var transaction = null;	  
	        
		  var selectedTreeItemIndex = document.getElementById("transaction-list").currentIndex; 
		  if ( selectedTreeItemIndex >= 0 ) {
			var treeChildren = document.getElementById("transactiontreechildren");
			if ( treeChildren != null ) {
				if ( selectedTreeItemIndex >= treeChildren.childNodes.length ) {
					selectedTreeItemIndex = treeChildren.childNodes.length - 1;
				} 
				var selectedTreeItem = treeChildren.childNodes[selectedTreeItemIndex];
		 		var transId = selectedTreeItem.getAttribute( "transactionID" );
		 		// get transaction for this id
				for (var i = 0; i < this.transactions.length; i++) {
					if (this.transactions[i].timeStamp == transId) {
						// found it
						transaction =  this.transactions[i];
						this.removeElement(this.transactions, i);
						
						treeChildren.removeChild(selectedTreeItem);
						
						this.clearRequest();
						break;
					}
				}
			}
		  }
      } catch (ex) {
         alert(ex);
      }
   },
   onDeleteParameter: function() {
	var treeChildren = document.getElementById("paramtreechildren");
	var indices = this.getAllSelectedIndices("paramtreechildren", "parameter-list" );
	for ( var i = indices.length-1; i >= 0; i-- ) {
		var index = indices[i];
    	var selectedTreeItem = treeChildren.childNodes[index];
		if (selectedTreeItem != null) {
			treeChildren.removeChild(selectedTreeItem);
		}
	 }
   }
}

