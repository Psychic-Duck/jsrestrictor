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

/**\file mouse_track.js
 * Mouse tracking for form selection and locking
 * This script is a modified version of mouse_track.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

if ((typeof browser) === "undefined") {
	var browser = chrome;
}

var clicked_element1 = null;
var clicked_element2 = null;

/**
 * Saves data from storages and cookies in key-value pairs into a JSON object
 * \todo consider saving databases etc.
 * @returns object containing JSON with storages and cookies
 */
function backup_data(){
	let cookies = {};
	let local = {};
	let session = {};
	const local_keys = Object.keys(localStorage);
	for (let key of local_keys) {
    	local[key] = `${localStorage.getItem(key)}`;
	}
	const session_Keys = Object.keys(sessionStorage);
	for (let key of session_Keys){
		session[key] = `${sessionStorage.getItem(key)}`
	}
	let all_cookies = document.cookie.split(';');
	for (let pair in all_cookies){
		let key_val = all_cookies[pair].split("=");
		cookies[key_val[0]] = key_val[1];
	}
	return ({local, session, cookies});
}

/**
 * Restores values saved on start of lock
 * \todo add restoration of indexdb etc.
 * @param data JSON with data to be restored, includes storages and cookies
 */
function restore_data(data){
	//Restoration of pre-lock items
	for (let key in data.local){
		localStorage.setItem(key, data.local[key]);
	}
	for (let key in data.session){
		sessionStorage.setItem(key, data.session[key]);
	}
	for (let key in data.cookies){
		document.cookie = `${key}=${data.cookies[key]};`;
	}
}
// listens to mouse clicks for form selection
document.addEventListener("mousedown", function(event) {
	// Right click
	if (event.button == 2) { 
		// Keep two copies
		clicked_element1 = event.target;
		clicked_element2 = event.target;
		
		var p = clicked_element1;
		while (p && p.tagName != "FORM") {	 
			p = p.parentElement;
		}
		
		// Active notification to prepare menu
		if (p != null) {
			var domain = get_hostname(p.getAttribute('action'));
			browser.runtime.sendMessage({req: "FLClickedForm", method: p.method, domain: domain});
		}
		else {
			browser.runtime.sendMessage({req: "FLClickedForm"});
		}
		
		clicked_element1 = null;
	}
}, true);

/**
 * Listens to messages from click_handler in formlock.js and responds either with
 * submit method and domain of form to be locked or with stored data to be backed
 * up
 */
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) { 
	// Retrive the clicked form for locking
	if (request.msg == "FLGetClickedForm" && document.URL == request.url) {
		var p = clicked_element2;
		
		while (p && p.tagName != "FORM") {	 
			p = p.parentElement;
		}
		
		if (p != null) {
			var domain = get_hostname(p.getAttribute('action')); 
			sendResponse({method: p.method, domain: domain});
		}
		
		clicked_element2 = null;
	}
	// Backup data before locking the form
	else if (request.msg == "BackupStorage" && document.URL == request.url) {
		let data = backup_data();
		sendResponse({backup: data});
	}
	else if (request.msg == "RestoreStorage") {
		restore_data(request.data);
	}
});

//Alerts user to any changes in browser's storage
browser.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
		  var storageChange = changes[key];
		  alert('Storage key "%s" in namespace "%s" changed. ' +
					  'Old value was "%s", new value is "%s".',
					  key,
					  namespace,
					  storageChange.oldValue,
					  storageChange.newValue);
		}
});
