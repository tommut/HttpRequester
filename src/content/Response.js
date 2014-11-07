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
      this.setResponseContent(data.content, data.responseHeaders['Content-Type'], data.url);

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
            padding += '    '; // use 4 spaces for tab padding
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
            // ignore first line if it is a standalone <!xml> directive
            if ( i == 0 && ln.indexOf( "<!" ) == 0 || ln.indexOf( "<?" ) == 0 ) {
                formatted = ln + '\n';
                continue;
            }

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

    getFileExtensionFromRequestUri: function (requestUrl) {
        var fileExtension = null;
        var checkFileExtension = App.getPreferenceBool("checkFileExtensionForRenderType");
        if (checkFileExtension && requestUrl != null) {
            var index = requestUrl.lastIndexOf("/");
            if (index > -1) {
                var lastRequestSegment = requesturl.substring(index);
                index = lastRequestSegment.lastIndexOf(".");
                if (index > -1 && index < lastRequestSegment.length - 1) {
                    fileExtension = lastRequestSegment.substring(index + 1);
                }
            }
        }
    },
    getFileExtensionFromContentType: function (contentType) {
// determine file extension from content type
        var fileExtension = null;
        //alert( "Content type: " + contentType )
        if (contentType && contentType.search('json') > -1) {
            fileExtension = "json";
        }
        else if (contentType && contentType.search('xml') > -1) {
            fileExtension = "xml";
        }
        else if (contentType && contentType.search('html') > -1) {
            fileExtension = "html";
        }
        else {
            fileExtension = "txt";
        }
        //alert( "RETURNING THIS: " + fileExtension );
        return fileExtension;
    },

    saveResponseToFile: function (fileExtension, formattedContent) {
        // write out to file
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);

        var xFile = Components.classes["@mozilla.org/file/directory_service;1"]
            .getService(Components.interfaces.nsIProperties)
            .get("ProfD", Components.interfaces.nsIFile);
        xFile.append("httpRequester");
        xFile.append("httprequester.response." + fileExtension);
        var defaultFilePath = xFile.path;
        file.initWithPath(defaultFilePath);
        if (file.exists() === false) {
            file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
        }
        this.writeStringToFile(formattedContent, file);

        return defaultFilePath;
    },

    log : function( msg ) {
        var cs1 = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        cs1.logStringMessage("httprequester: " + msg);
        console.error(msg)
    },


    setResponseContent: function(content, contentType, requestUrl) {
        var renderWithBrowser = App.getPreferenceBool("renderResponseBrowser");
        if ( renderWithBrowser ) {
            // if pref is set to checkFileExtension (user may want to turn this off if requests end
            // in .something and want to use the content type always instead), then look for a file
            // extension.  If there is one, just write the file out to that.
            var fileExtension = this.getFileExtensionFromRequestUri(requestUrl);
            if ( fileExtension == null ) {
                fileExtension = this.getFileExtensionFromContentType(contentType);
            }

            // if there's no actual content, default to txt
            if ( content == null || content.length == 0 ) {
                fileExtension = "txt";
            }

            var filePath = this.saveResponseToFile(fileExtension, content);

            // need to first change the url (we user a dummy url); otherwise, if navigating
            // between two XML or HTML files, the URL would be the same and changing it would
            // do nothing
            document.getElementById("browserIframe").setAttribute("src","file://tmp" );
            document.getElementById("browserIframe").setAttribute("src","file://" + filePath);

            // we do the process again, as it seems on Windows when just setting the src the first
            // time it would sometimes renders as text (all the text from all xml elements) and not
            // as XML.  Clearing the src and resetting it a second time seems to always work.
            document.getElementById("browserIframe").setAttribute("src","file://tmp" );
            document.getElementById("browserIframe").setAttribute("src","file://" + filePath);
//            this.log("request: " + requestUrl + "\nIframe: " + document.getElementById("browserIframe").getAttribute("src")  + " \nfilepath: " + filePath);
        }
        else {
            // output as Text
            formattedContent = content;
            if (formattedContent != null && formattedContent.length > 0) {
                var prettyPrint = App.getPreferenceBool("prettyPrintResponse");
                if (prettyPrint) {
                    // if pretty print is on, format the response before displaying in
                    // response content field
                    if (contentType && contentType.search(/.*\/.*json/i) > -1) {
                        formattedContent = JSON.stringify(JSON.parse(content), null, 4);
                    }
                    else if (contentType && contentType.search(/.*\/.*xml/i) > -1) {
                        // the formatXml method does a better job but does not perform as well as formatXmlFast
                        var fastPrettyPrint = App.getPreferenceBool("useFastXMLPrettyPrint");
                        if ( fastPrettyPrint ) {
                            formattedContent = this.formatXmlFast(content);
                        }
                        else {
                            formattedContent = this.formatXml(content);
                        }
                    }
                    // not currently pretty formatting HTML.  Not sure if it makes sense to do so.
//                else if (contentType && contentType.search('text/html') > -1) {
//                    // the formatXml method does a better job but does not perform as well
//                    //formattedContent = this.formatXml(content);
//                    formattedContent = this.formatXmlFast(content);
//                }
                }
            }

            // update the response content text field
            document.getElementById("response-content").value = formattedContent ? formattedContent : "";
        }
     },

    writeStringToFile : function(outputStr, file){
    var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Components.interfaces.nsIFileOutputStream);
    outputStream.init(file, 0x04 | 0x08 | 0x20, 420, 0);

    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = "UTF-8";

    var chunk = null;
    try {
        chunk = converter.ConvertFromUnicode(outputStr);
    }
    catch (e) {
        chunk = outputStr;
    }
    outputStream.write(chunk, chunk.length);

    var fin = converter.Finish();
    if (fin.length > 0)
        outputStream.write(fin, fin.length);
    outputStream.close();

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