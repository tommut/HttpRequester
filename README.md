HttpRequester
=============
HttpRequester is a tool for Firefox for easily making HTTP requests (GET/PUT/POST/DELETE), viewing the responses, and keeping a history of transactions.

This tool is useful when doing web or REST development, or when you need to make HTTP requests that are not easily done via the browser (PUT/POST/DELETE).

This is based off of Alex Milowski's excellent Poster addon, with a large focus on keeping a history of transactions, allowing you to go back and review, re-execute, load, and save HTTP requests. 

Developed by Tom Mutdosch

Distributed under the BSD License
http://www.opensource.org/licenses/bsd-license.php

<b>Overview</b>
<ul>
<li>View responses in an embedded browser, or in plain text (with an option to pretty-format XML/JSON).  
<li>A history of transactions is recorded (and kept across sessions).  You can view past requests, and re-execute them.  Selecting a transaction in the History list will show the full request/response.  
<li>For each transaction in the list, the request and response are shown, as well as the Elapsed Time and Content-Length  (The value used is the Content-Length response header if available, and the size of the response body otherwise.)
<li>Each column in the history list is resizable and re-orderable and can be hidden via the column picker. The ordering and width of each column are persisted.  
<li>Double-clicking a row in the history will show you a raw text version of the request and response
<li> You can edit raw requests by double-clicking a row in the history list, or clicking the Edit Raw Request button.  This is useful for easily viewing the request all at once, or for making quick tweaks to a previous request, such as adding or changing headers.  This is 
the same behavior as double-clicking a transaction in the transaction history list.
<li>Recent URLs, header names, and content types are remembered across sessions, and can easily be selected from drop-down lists.
</ul>
<b>Usage</b>
<ul>
<li>HttpRequester can be opened via the Toolbar button (the green/red arrow icon), or opened via the Tools menu.  Alternatively the shortcut CTRL-ALT-P will bring up HttpRequester.
<li>You can press the Delete Request button to remove a selected transaction from history list.  (You can also hit the Delete key)
<li>You can copy a request/response to clipboard for pasting into bug report, etc.  You can also copy existing requests from the clipboard by clicking the Paste Request button, and then executing the request. Select multiple requests at once by holding down CTRL while selecting another request from the list.
<li>Press the <Esc> key to close the HttpRequester window
<li>Save and load stored requests:  To save a request, click on a request in the history list and click Save Request.  You can optionally give the request a name.
<li>To load a request, click on Load Request - that will bring up a list of all saved requests.  You can select any request to load it into your history to view it, or you can click the Execute button to execute it immediately.


</ul>
<b>Advanced Preferences:</b> (via about:config):
<b> Increasing number of items in history</b>
<code>extensions.httprequester.maxhistory - maximum number of requests to keep
extensions.httprequester.url.maxhistory - maximum number of URLs to keep
extensions.httprequester.contenttype.maxhistory - maximum number of content types to keep
extensions.httprequester.header.maxhistory - maximum number of header names to keep
</code>
<li> You can add custom methods to the list of available HTTP methods.
To add new Methods: enter "about:config" in your URL bar. Then filter on:
extensions.httprequester.http.methods.custom.write

Double-click the value to modify it. You can change it to a list of comma-separated values like: ["PROPFIND", "PATCH"]
You can also add read-only custom methods too (these methods will not send any entity body) via extensions.httprequester.http.methods.custom.read<br/>

If you have any questions/comments/suggestions, shoot me a note.

