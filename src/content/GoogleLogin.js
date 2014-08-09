var XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
var GoogleLogin = {
   data: null,
   init: function(data) {
      this.data = data;
      document.getElementById('username').value = data.username;
      document.getElementById('password').value = data.password;
      document.getElementById('service').value = data.service;
   },
   authenticate: function() {
      //document.getElementById('failure').value = "";
      var current = this;
      var service = document.getElementById('service').value;
      if (!service || service.length==0) {
         this.showError("The service is missing (e.g. blogger).");
         return;
      }
      var username = document.getElementById('username').value;
      if (!username || username.length==0) {
         this.showError("The username is missing.");
         return;
      }
      var password = document.getElementById('password').value;
      if (!password) {
         password = "";
      }
      var loginBody = "service="+service+"&Email="+username+"&Passwd="+password;
      HTTP("POST","https://www.google.com/accounts/ClientLogin",{
         timeout: 30*1000,
         contentType: "application/x-www-form-urlencoded",
         onSuccess: function(status,doc,text) {
            var regex = /Auth=.+/;
            var match = regex.exec(text);
            var auth=match[0].substring(5);
            current.onSuccess(auth);
         },
         onFailure: function(status,doc,text) {
            current.data.success = false;
            if (text.length>30) {
               text = text.substring(0,30)+"...";
            }
            current.showError("Authnetication failed: ("+status+") "+text);
         },
         body: loginBody
      });
   },
   showError: function(msg) {
      document.getElementById('failure').value = msg;
   },
   onSuccess: function(auth) {
      this.data.auth = auth;
      this.data.success = true;
      this.data.username = document.getElementById('username').value;
      this.data.password = document.getElementById('password').value;
      this.data.service = document.getElementById('service').value;
      setTimeout(function(){ window.close(); },200);
   },
   cancel: function() {
      this.data.success = false;
      this.data.username = document.getElementById('username').value;
      this.data.password = document.getElementById('password').value;
      this.data.service = document.getElementById('service').value;
      window.close();
   }
   
   
   
}