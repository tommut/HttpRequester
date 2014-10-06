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
      this.setResponseContent(data.content, data.responseHeaders['Content-Type']);
	  
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

   formatXmlFast : function(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.toString().replace(reg, '$1\r\n$2$3');
    var pad = 0;
    var nodes = xml.split('\r\n');
    for(var n in nodes) {
        var node = nodes[n];
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }
        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += ' ';
        }
        formatted += padding + node + '\r\n';
        pad += indent;
    }
        return formatted;
    //return formatted.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g, '&nbsp;');
   },

   formatXml : function (xml) {
        var reg = /(>)(<)(\/*)/g;
        var wsexp = / *(.*) +\n/g;
        var contexp = /(<.+>)(.+\n)/g;
        xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
        var pad = 0;
        var formatted = '';
        var lines = xml.split('\n');
        var indent = 0;
        var lastType = 'other';
        // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
        var transitions = {
            'single->single': 0,
            'single->closing': -1,
            'single->opening': 0,
            'single->other': 0,
            'closing->single': 0,
            'closing->closing': -1,
            'closing->opening': 0,
            'closing->other': 0,
            'opening->single': 1,
            'opening->closing': 0,
            'opening->opening': 1,
            'opening->other': 1,
            'other->single': 0,
            'other->closing': -1,
            'other->opening': 0,
            'other->other': 0
        };

        for (var i = 0; i < lines.length; i++) {
            var ln = lines[i];
            var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
            var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
            var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
            var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
            var fromTo = lastType + '->' + type;
            lastType = type;
            var padding = '';

            indent += transitions[fromTo];
            for (var j = 0; j < indent; j++) {
                padding += '\t';
            }
            if (fromTo == 'opening->closing')
                formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
            else
                formatted += padding + ln + '\n';
        }

        return formatted;
    },

    setResponseContent: function(content, contentType) {
        formattedContent = content;

        var prettyPrint = App.getPreferenceBool("prettyPrintResponse");
        if (prettyPrint) {
            // if pretty print is on, format the response before displaying in
            // response content field
            if (contentType && contentType.search('application/json') > -1) {
                formattedContent = JSON.stringify(JSON.parse(content), null, 4);
            }
            else if (contentType && contentType.search('application/xml') > -1) {
                formattedContent = this.formatXml(content);
            }
            else if (contentType && contentType.search('text/html') > -1) {
                // the formatXml method does a better job but does not perform as well
                //formattedContent = this.formatXml(content);
                formattedContent = this.formatXmlFast(content);
            }
        }
        document.getElementById("response-content").value = formattedContent ? formattedContent : "";
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