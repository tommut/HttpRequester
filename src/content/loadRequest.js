var LoadRequest = {
	savedHistoryTransactions : null,
	
	load: function() {
		var history = App.getPreferenceComplex("history.savedRequests");
	   if (history != null && history.length > 0) {
	  		savedHistoryTransactions = JSON.parse(history);
		 
			var  saved_requests_listbox= document.getElementById("saved_requests_listbox");
			// clear existing list items
			while (saved_requests_listbox.hasChildNodes()) {
				saved_requests_listbox.removeChild(saved_requests_listbox.firstChild);
		 	}
			 
			for (var i = 0; i <  savedHistoryTransactions.length; i++) {
			 	var newItem = document.createElement("listitem");
			 	var dateStr = App.getDateString(savedHistoryTransactions[i].timeStamp);
				newItem.setAttribute( "label", savedHistoryTransactions[i].name + ": " + savedHistoryTransactions[i].requestTransaction.url + "    (" + dateStr + ")");
				saved_requests_listbox.appendChild(newItem);
	 		}
	 	}
   },
   
   selectSavedTransaction: function(shouldExecuteRequest) { 
   		var  saved_requests_listbox= document.getElementById("saved_requests_listbox");
   		var index = saved_requests_listbox.selectedIndex;;
		window.arguments[0].selectedTransaction = JSON.stringify(savedHistoryTransactions[index]);
		window.arguments[0].shouldExecute = shouldExecuteRequest;
		window.close();		
   },
   
   remove: function() { 
   		var  saved_requests_listbox= document.getElementById("saved_requests_listbox");
   		var index = saved_requests_listbox.selectedIndex;;
		var item = saved_requests_listbox.getItemAtIndex(index);
		App.removeElement(savedHistoryTransactions, index);
		saved_requests_listbox.removeItemAt(saved_requests_listbox.getIndexOfItem(item));

		// write out updated pref store
		var storedHistoryString = JSON.stringify(savedHistoryTransactions);
		App.setPreferenceComplex( "history.savedRequests", storedHistoryString );
   }
   
}