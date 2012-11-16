var RequestEntry = {
	lastSearchString : "",

	loadRequest: function(){
		var requestStr = window.arguments[0].request;
		if (requestStr != null && requestStr.length > 0) {
			document.getElementById("content").value = requestStr;
		}
	},
	pasteFromClipboard: function() { 
		var text = App.copyTextfromClipboard();
		document.getElementById("content").value = text;
	},
	findInTextBox : function() { 
		var nsIPromptService = Components.interfaces.nsIPromptService;
		var nsPrompt_CONTRACTID = "@mozilla.org/embedcomp/prompt-service;1";
		var gPromptService = Components.classes[nsPrompt_CONTRACTID].getService(nsIPromptService);
		var result = { value: this.lastSearchString };
		var dummy = { value: 0 };
	
		if (gPromptService.prompt(window,
                            "Find text in transaction",
                            "Enter text to search for:",
                            result,
                            null,
                            dummy)) {
        	this.lastSearchString = result.value;   
        	
        	this.doFindNext();
		}  
	},
	doFindNext : function() {
		var text = document.getElementById("content").value;
        	
    	var start = document.getElementById("content").selectionStart;
    	
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
    		document.getElementById("content").select();
			document.getElementById("content").setSelectionRange(index, (index + this.lastSearchString.length));
    	}
		
	},
	doRequest: function(){
		window.arguments[0].updatedRequest = document.getElementById("content").value;
		window.close();
	}
	
}
   

