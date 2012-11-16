if(!httprequester) var httprequester={};

httprequester.showHttpRequester = function() {
   var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
   var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
   var topWindow = windowManagerInterface.getMostRecentWindow("window:httprequester");
   if (topWindow) {
   		try { 
    		 topWindow.focus();
   		}
   		catch ( e ) {   			
   		}
   }
   else {
	   window.openDialog(
	      'chrome://httprequester/content/httprequester-window.xul','httprequester-'+(new Date()).getTime(),'chrome,centerscreen,resizable,dialog=no'
	   );
   	}
   
   
   
   
   
   
   
   
   
   
   
}
