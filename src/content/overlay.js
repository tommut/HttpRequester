if (!httprequester) var httprequester = {};

httprequester.showHttpRequester = function () {
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
    var topWindow = windowManagerInterface.getMostRecentWindow("window:httprequester");
    if (topWindow) {
        try {
            topWindow.focus();
        } catch (e) {}
    } else {
        window.openDialog(
            'chrome://httprequester/content/httprequester-window.xul', 
            'httprequester-' + (new Date()).getTime(),
            'chrome,centerscreen,resizable,dialog=no'
        );
    }
};

httprequester.initialize = function () {
    // run this later and let the window load.
    window.setTimeout(function () {
        httprequester.start();
    }, 100);
}

httprequester.start = function () {
    var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces
        .nsIPrefService).getBranch("extensions.httprequester.");
    if (preferencesService) {
        var firstrun = true;
        try {
            firstrun = preferencesService.getBoolPref("firstrun");
        } catch (e) {
            firstrun = true;
        }
        var curVersion = "2.0";


        if (firstrun) {
            preferencesService.setBoolPref("firstrun", false);
            preferencesService.setCharPref("installedVersion", curVersion);
            /* Code related to firstrun */

            httprequester.installButton("nav-bar", "http-requester-button");
            // The "addon-bar" is available since Firefox 4
            //httprequester.installButton("addon-bar", "my-extension-addon-bar-button");

        } else {
            try {
                var installedVersion = preferencesService.getCharPref("installedVersion");
                if (curVersion > installedVersion) {
                    preferencesService("installedVersion", curVersion);
                    /* Code related to upgrade */
                }
            } catch (ex) {
                /* Code related to a reinstall */
            }
        }
    }
};


/**
 * Installs the toolbar button with the given ID into the given
 * toolbar, if it is not already present in the document.
 *
 * @param {string} toolbarId The ID of the toolbar to install to.
 * @param {string} id The ID of the button to install.
 * @param {string} afterId The ID of the element to insert after. @optional
 */
httprequester.installButton = function (toolbarId, id, afterId) {
    if (!document.getElementById(id)) {
        var toolbar = document.getElementById(toolbarId);

        // If no afterId is given, then append the item to the toolbar
        var before = null;
        if (afterId) {
            let elem = document.getElementById(afterId);
            if (elem && elem.parentNode == toolbar)
                before = elem.nextElementSibling;
        }

        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");

        if (toolbarId == "addon-bar")
            toolbar.collapsed = false;
    }
}