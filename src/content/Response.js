var Response = {
   init: function(data) {

	// create a new response object
	
	// add it to the Transactions array
	
	// update the transactions list with last entry (and remove oldest entry)
	
	// select latest entry in the list; should populate request/response sections based on that.
      var titleE = document.getElementById("title");
	  while (titleE.hasChildNodes()) {
	     titleE.removeChild(titleE.firstChild);
	  }	
      titleE.appendChild(document.createTextNode(data.title));
      this.setResponseStatus(data.status+" "+data.statusText);
      this.setResponseContent(data.content);
	  
	  var grid = document.getElementById("headers");
	  while (grid.hasChildNodes()) {
	     grid.removeChild(grid.firstChild);
	  }		  
      for (var name in data.responseHeaders) {
         this.addResponseHeader(name,data.responseHeaders[name]); 
      }
   },
   setResponseStatus: function(status) {
      document.getElementById("code").value =status ? status : ""; 
   },
   setResponseContent: function(content) {
      document.getElementById("response-content").value = content ? content : "";
   },
   addResponseHeader: function(name,value) {
      var grid = document.getElementById("headers");
      var row = grid.ownerDocument.createElement("row");
      grid.appendChild(row);
      var nameLabel = row.ownerDocument.createElement("label");
      nameLabel.setAttribute("value",name);
      row.appendChild(nameLabel);
      var valueLabel = row.ownerDocument.createElement("textbox");
      valueLabel.setAttribute("value",value);
      row.appendChild(valueLabel);
   },
   clearResponseview: function() {
	 var titleE = document.getElementById("title");
	  while (titleE.hasChildNodes()) {
	     titleE.removeChild(titleE.firstChild);
	  }	
      this.setResponseStatus(null);
      this.setResponseContent(null);
	  
	  var grid = document.getElementById("headers");
	  while (grid.hasChildNodes()) {
	     grid.removeChild(grid.firstChild);
	  }		  
	}
   
}