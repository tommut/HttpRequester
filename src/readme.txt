HttpRequester is a modified version of the excellent Poster add-on available for Mozilla Firefox.  
HttpRequester is distributed under the the BSD License: http://www.opensource.org/licenses/bsd-license.php

2.0 (10/7/2014):
 Added option to display response in an embedded browser.
  This works well in conjunction with XML Pretty Viewer and JSON View addons.  The embedded browser will utilize the nicely formatted displays that those addons provide.
 Added option to pretty-print JSON and XML responses.
 Added resizable sections to allow individually resizing the request and response areas, as well as the Response Headers and History.
 Added Authentication button to allow for entering username/password for Basic Authentication. his will ensure that the appropriate Authorization header is sent with the request.
 You can also set the timeout value to determine how long to wait before the request times out  (Default: 30 seconds)
 Added PATCH to the list of HTTP methods
 Added tooltip text for request URL list item
 Fixed: extra newlines were being being printed for View Raw Transaction causing it to appear double-spaced
 Fixed: better styling for section headers

1.0.5 (02/02/2014):
 Replaced status-bar (addons bar) icon with a toolbar icon. Toolbar icons can be placed anywhere by right-clicking and selecting "Customize..."


1.0.4: (01/23/2012):
1) Via user request: added ability to add custom methods to the list of 
available HTTP methods.  Useful for adding things like PATCH (now an Proposed Standard -- RFC 5789).
To add new Methods: enter "about:config" in your URL bar.  Then filter on:
extensions.httprequester.http.methods.custom.write
Double-click the value to modify it.  You can change it to a list of comma-separated values like:
["PROPFIND", "PATCH"] 
You can also add read-only custom methods too (these methods will not send any entity body) via extensions.httprequester.http.methods.custom.read

When you bring up HTTP Requester it will show those values in the HTTP method dropdown for use.


1.0.3.1: (09/20/2011):
1) Fixed: Parameters added to the parameter list were only being added to the request URI for GET requests, and not for POST/PUT/DELETE.
2) Fixed: Parameters added to the request URI were not added correctly if the URI already had existing URI query.
3) Fixed: When clicking Parameter Body to move add parameters to the body content, the parameters were still being added to the URI as well.
4) When viewing raw request, response is now separated with a "-- response --" delimiter to aid in readability.
5) Fixed: when executing raw request, was including the response content as part of the PUT/POST body 

1.0.3: (06/05/2011):
1) Added a "Find..." function in the Content Response area and in the Raw Transaction view window.  Press the Find 
button or hit CTRL-f to search for text anywhere in the request/response.  CTRL-g will do a Find Next to locate the 
next instance of the text that was last searched for.

1.0.2: (06/02/2011):
1) Added a column in the transaction history to show Content Length.  The value used is the Content-Length response header 
if available, and the size of the response body otherwise

1.0.1: (05/20/2011):
1) Added a "View raw transaction" link in the Response area to quickly let you view the entire raw request and response.  
This is the same behavior as double-clicking a transaction in the transaction history list.
2) Cleaned up Content area (made selecting a File to upload a radio button control)
3) The response content now properly shows with a scrollbar if there are lots of response headers

1.0: (05/19/2011):
1) The transaction list control has been updated; each column is now resizable and re-orderable and can be hidden via the column picker.  
The ordering and width of each column are now persisted.  Additionally, if a value is too large for a column it will be truncated
and a tooltip will display the full value.
2) The headers and parameters list controls have been similarly updated.


0.5: (03/07/2011): 
1) Updated to work with Firefox 4  
2) Default to "http://" if no protocol is entered

0.4: (02/03/2011)
1) You can now save and load stored requests.   
To save a request, click on a request in the history list and click Save Request.  You can optionally give the request a name.
To load a request, click on Load Request - that will bring up a list of all saved requests.  You can select any request to load it into your history to view it, or you can click the Execute button to execute it immediately.
2) Added explicit Delete Request button to remove selected transaction from history list.  (You can also hit the Delete key)

0.3:  (01/19/2011)
1) History list now shows elapsed time for all requests
2) Double-clicking a row in the history will show you a raw text version of the request and response
3) You can now edit raw requests by clicking the Edit Raw Request button; this is useful for making quick tweaks to a previous request, such as adding or changing a header
4) Paste Request button.  You can now copy existing requests from the clipboard (such as a request captured from Live HTTP Headers) by clicking the
Paste Request button, and then executing the request. 

0.2: (08/01/2010)
1) Reuse HttpRequester window if already open
2) Use HttpRequester icon to identify HttpRequester window

0.1 adds many improvements (07/27/2010)
1) requests/responses transactions now take place in a single window.  A separate window is not opened for each response.
2) history of transactions is now recorded (and kept across sessions); can view past requests; re-execute them
3) HttpRequester opens in a proper window instead of a dialog; can be minimized, maximized
4) remembers recent URLs, header names, and content types (across sessions)
5) can copy a request/response to clipboard for pasting into bug report, etc
6) The UI has been minimialized and cleaned up a bit
7) Can hit <Esc> key to close window

Preferences:  via about:config
extensions.httprequester.maxhistory - maximum number of requests to keep
extensions.httprequester.url.maxhistory - maximum number of URLs to keep
extensions.httprequester.contenttype.maxhistory - maximum number of content types to keep
extensions.httprequester.header.maxhistory - maximum number of header names to keep

extensions.httprequester.history 
extensions.httprequester.url.history 
extensions.httprequester.contentType.history
extensions.httprequester.header.history

extensions.httprequester.showAdvancedOptions  - set this to true to cause some of the other buttons to appear  (Google login, Save/Store/Import default URL/content type, timeout slider)

If you have any questions/comments/suggestions, shoot me a note.
-Tom Mutdosch


--
<b>Usage overview</b>
<ul>
<li>Requests/responses transactions take place in a single application window.  
<li>A history of transactions is recorded (and kept across sessions).  You can view past requests, and re-execute them.  Selecting a transaction in the History list will show the full request/response.  
<li>For each transaction in the list, the request and response are shown, as well as the Elapsed Time and Content-Length  (The value used is the Content-Length response header if available, and the size of the response body otherwise.)
<li>Each column in the history list is resizable and re-orderable and can be hidden via the column picker. The ordering and width of each column are persisted.  
<li>Double-clicking a row in the history will show you a raw text version of the request and response
<li> You can edit raw requests by double-clicking a row in the history list, or clicking the Edit Raw Request button.  This is useful for easily viewing the request all at once, or for making quick tweaks to a previous request, such as adding or changing headers.  This is the same behavior as double-clicking a transaction in the transaction history list.
<li>You can press the Delete Request button to remove a selected transaction from history list.  (You can also hit the Delete key)
<li>Recent URLs, header names, and content types are remembered across sessions, and can easily be selected from drop-down lists.
<li>You can copy a request/response to clipboard for pasting into bug report, etc.  You can also copy existing requests from the clipboard by clicking the Paste Request button, and then executing the request. 
<li>Press the <Esc> key to close the HttpRequester window
<li>Save and load stored requests:  To save a request, click on a request in the history list and click Save Request.  You can optionally give the request a name.
<li>To load a request, click on Load Request - that will bring up a list of all saved requests.  You can select any request to load it into your history to view it, or you can click the Execute button to execute it immediately.
</ul>
<b>Advanced Preferences</b> (via about:config):
<code>extensions.httprequester.maxhistory - maximum number of requests to keep
extensions.httprequester.url.maxhistory - maximum number of URLs to keep
extensions.httprequester.contenttype.maxhistory - maximum number of content types to keep
extensions.httprequester.header.maxhistory - maximum number of header names to keep
extensions.httprequester.showAdvancedOptions  - set this to true to cause some of the other buttons to appear  (Google login, Save/Store/Import default URL/content type, timeout slider)
</code>

If you have any questions/comments/suggestions, shoot me a note.