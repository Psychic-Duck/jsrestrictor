//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Matyáš Szabó
//
//  Derived from Formlock
//  Copyright (C) 2016  Oleksii Starov
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

/**\file formlock.js
 * Background script for form locking
 * This script is a modified version of background.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

var lock_domains = [];
//var lockTab = null;
var blocked = [];
var backup = {}

/**
 * Blocks request to third party domains except for the lock domains
 * \todo change global blocking to per tab/frame based!
 */
browser.webRequest.onBeforeRequest.addListener(
	function(details) {
		var f_cancel = false;
		if (lock_domains.length > 0) {
			f_cancel = true;
			var current_domain = get_root_domain(get_hostname(details.url));
			if (lock_domains.indexOf(current_domain) !== -1) {
				f_cancel = false;
			}
		
			if (f_cancel) {
				blocked.push(details.url);
			}
		}
		return {cancel: f_cancel};
	},
	{urls: ["<all_urls>"]},
	["blocking"] 
);

var tabID = 0;
var unlockUrl = "";
var unlockMsg = "";

/**
 * CLEARING STORAGES OF POTENTIAL LEAKS
 * This function is a modified version of the original function from Formlock.
 * ^Remove was changed to delete as few data from other domains as possible
 * ^Added data restoration message for the locked domain
 */
var started = null;
function clear_new_data() {   
	if (started !== null) {
		browser.browsingData.remove({
			"since": started,
			"origins": [`${unlockUrl}`]
		  }, {
			"cacheStorage": true,
			"cookies": true,
			"fileSystems": true,
			"indexedDB": true,
			"localStorage": true,
			"serviceWorkers": true,
			"webSQL": true
		  }, () => {
			//clearing items which cannot be cleared with origins argument
			browser.browsingData.remove({
				"since": started
			}, {
				"passwords": true,
				"appcache": true,
				"cache": true,
				"downloads": true,
				"formData": true,
				"history": true,
				"pluginData": true
			}, () => {
					browser.tabs.update(tabID, {url: unlockUrl}, (tab) => {
						browser.tabs.sendMessage(tab.id, {"msg": "RestoreStorage", "data": backup}, (payload) =>{
							started = null;
							alert(unlockMsg); 
						});
					});
					
			});
		  });
	}
}

/**
 * (1) Process the menu clicks
 * This function is a modified version of the original function from Formlock.
 * ^Backup of storage and cookies from locked page was added
 * \todo close new opened tabs? or tabs of the same domain? 
 */
var click_handler = function(info, tab) {
	var url = info.frameUrl ? info.frameUrl : info.pageUrl;
	
	// Explain the form risks option
	if (info.menu_item_id === "explainRisks") {   
		browser.tabs.sendMessage(tab.id, {"msg": "FLGetClickedForm", "url": url}, function(payload) {
			if (payload !== null) {
				var violation = "";

				var global_url = get_root_domain(get_hostname(tab.url));
				var current_url = get_root_domain(payload.domain);

				if (global_url !== current_url) violation += "> Third-party: " + current_url + "\n"; 
				if (payload.method === "get") violation += "> Submit with GET\n";

				if (violation === "") violation = "Looks safe.";
				
				alert(violation);
			}
		});
	}
	
	// Set the lock for one domain allowed
	if (info.menuItemId === "lock") {	
		if (lock_domains.length > 0) {
			//Restore saved data
			// Remove LOCK
			var msg = "Unlocked. Third-party requests blocked " + blocked.length + ":\n";
			for (b in blocked) {
				msg += get_hostname(blocked[b]) + "\n";
			}
			unlockMsg = msg;
			browser.browserAction.setTitle({title: "FormLock"});
			browser.contextMenus.update("lock", {"title": "Set LOCK"});
			lock_domains = [];
			blocked = [];				
			var old_url = tab.url.split("?")[0]; 
			unlockUrl = old_url;
			
			browser.tabs.executeScript(tab.id, {code: `window.location.href=${old_url};`}, function(tab) {
				tabID = tab.id;
				clear_new_data(); 
			});
		}
		else {
			browser.tabs.sendMessage(tab.id, {"msg": "BackupStorage", "url": url}, function(payload) {
				backup = payload.backup;
			});
			// Set LOCK
			browser.tabs.sendMessage(tab.id, {"msg": "FLGetClickedForm", "url": url}, function(payload) {
				if (payload !== null) {					
					started = (new Date()).getTime();
					// Page url and the form url
					var first = get_root_domain(get_hostname(tab.url));
					var second = get_root_domain(payload.domain);
					lock_domains.push(first);
					if (first !== second) {
						lock_domains.push(second);
					}
					browser.browserAction.setTitle({title: lock_domains.join("\n")})
					alert("Locked. Requests are allowed to only:\n" + lock_domains.join("\n"));  
					browser.contextMenus.update("lock", {"title": "Remove LOCK"});  
				}
			});
		}   
	}
}; 

// (2) Register the menu items
browser.contextMenus.create({"title": "Form locking", "contexts": ["all"], "id": "Formstery"});
browser.contextMenus.create({"title": "Submit method: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitMethod"});
browser.contextMenus.create({"title": "Submits to: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitTo"});
browser.contextMenus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
browser.contextMenus.create({"title": "Explain sharing risks.", "contexts": ["all"], "parentId": "Formstery", "id": "explainRisks", "onclick": click_handler});
browser.contextMenus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
browser.contextMenus.create({"title": "Set LOCK", "contexts": ["all"], "parentId": "Formstery", "id": "lock", "onclick": click_handler}); 

/**
 * UPDATES THE CONTEXT MENU WITH CURRENT FORM'S INFO
 * \todo consider reliability and usability of this approach!
 */
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.req === "FLClickedForm") {	  
		browser.contextMenus.update("submitMethod", {"title": "Submit method: " + request.method});
		browser.contextMenus.update("submitTo", {"title": "Submits to: " + get_root_domain(request.domain)});
	}
});

/** 
 * INTERCEPTS PAGE SCRIPTS ON A NEW URL LOADED
 * This function is a modified version of the original function from Formlock.
 * ^A check was added so that the scripts aren't injected into forbidden pages which would cause errors
 */
browser.webNavigation.onCompleted.addListener(function(o) {
	//Prevent needless injection attempts into irrelevant pages
	if(o.url.indexOf("chrome\:\/\/") != -1 || o.url === "about:blank"){
		return;
	}
	
	// (1) Monitoring mouse events
	browser.tabs.executeScript(o.tabId, {file: "utils.js", allFrames: true}, function(tab) {
		// UTILS ->
		browser.tabs.executeScript(o.tabId, {
				allFrames: true,
				file: "mouse_track.js"
		});
		// <- UTILS
	});
	
	// (2) Highlighting risky forms
	browser.tabs.executeScript(o.tabId, {file: "utils.js", allFrames: true}, function(tab) {
		// UTILS ->
		browser.tabs.get(o.tabId, function(tab) { 
			// Passing the tab URL
			browser.tabs.executeScript(o.tabId, { 
				allFrames: true,
				code: "var taburl = \"" + tab.url + "\";"
			}, 
			function() {
				// Main code
				browser.tabs.executeScript(o.tabId, {
					allFrames: true,
					file: "form_check.js"
				});
			});
		}); 
		// <- UTILS
	});
});
