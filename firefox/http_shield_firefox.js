//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Pavel Pohner, Martin Bednář
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

/** \file
 *
 * \brief This file contains Firefox specific functions for Network Boundary Shield.
 *
 * \ingroup NBS
 *
 * This file contains webRequest API listeners. These listeners handle HTTP requests in the "before send headers" phase
 * and handle messages (on message event).
 *
 * NBS for Firefox uses the DNS web extension API to resolve domain names. As the domain names are
 * cached and needs to be resolved without NBS, the performance impact should be negligible.
 */

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
browser.runtime.onMessage.addListener(messageListener);
/// \endcond

/**
 * The event listener, hooked up to webRequest onBeforeSendHeaders event.
 * Receives detail of HTTP request in requestDetail.
 * Catches the request, analyzes its origin and target URLs and blocks it/permits it based
 * on their IP adresses. Requests coming from public IP ranges targeting the private IPs are
 * blocked by default. Others are permitted by default.
 *
 * \param requestDetail Details of HTTP request.
 */
async function beforeSendHeadersListener(requestDetail)
{
	//If either of information is undefined, permit it
	//originUrl happens to be undefined for the first request of the page loading the document itself
	if (requestDetail.originUrl === undefined || requestDetail.url === undefined || requestDetail.originUrl === "null" || requestDetail.url === "null")
	{
		return {cancel:false};
	}
	var sourceUrl = new URL(requestDetail.originUrl);
	var fullSourceDomain = sourceUrl.hostname;
	//Removing www. from hostname, so the hostnames are uniform
	sourceUrl.hostname = wwwRemove(sourceUrl.hostname);
	var targetUrl = new URL(requestDetail.url);
	var fullTargetDomain = targetUrl.hostname;
	//Removing www. from hostname, so the hostnames are uniform
	targetUrl.hostname = wwwRemove(targetUrl.hostname);

	var targetIP;
	var sourceIP;
	var isSourcePrivate = false;
	var isDestinationPrivate = false;
	var destinationResolution = "";
	var sourceResolution = "";

	//Host found among user's trusted hosts, allow it right away
	if (checkWhitelist(sourceUrl.hostname))
	{
		return {cancel:false};
	}

	//Checking type of SOURCE URL
	if (isIPV4(sourceUrl.hostname)) //SOURCE is IPV4 adddr
	{
		//Checking privacy of IPv4
		if (isIPV4Private(sourceUrl.hostname))
		{
			//Source is IPv4 private
			isSourcePrivate = true;
		}
	}
	else if(isIPV6(sourceUrl.hostname)) //SOURCE is IPV6
	{
		//Checking privacy of IPv6
		if (isIPV6Private(sourceUrl.hostname))
		{
			//Source is IPv6 private
			isSourcePrivate = true;
		}
	}
	else //SOURCE is hostname
	{
		//Resoluting DNS query for source domain
		sourceResolution = browser.dns.resolve(fullSourceDomain).then((val) =>
		{
			//Assigning source IPs
			sourceIP = val;
			//More IPs could have been found, for each of them
			for (let ip of sourceIP.addresses)
			{
				//Check whether it's IPv4
				if (isIPV4(ip))
				{
					if (isIPV4Private(ip))
					{
						//Source is IPv4 private
						isSourcePrivate = true;
					}
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//Source is IPv6 private
						isSourcePrivate = true;
					}
				}
			}
		});
	}

	//Analyzing targetUrl
	//Check IPv4/IPv6 and privacy
	if (isIPV4(targetUrl.hostname))
	{
		if (isIPV4Private(targetUrl.hostname))
		{
			isDestinationPrivate = true;

		}
	}
	else if(isIPV6(targetUrl.hostname))
	{
		if (isIPV6Private(targetUrl.hostname))
		{
			isDestinationPrivate = true;
		}
	}
	else //Target is hostname
	{
		//Resoluting DNS query for destination domain
		destinationResolution = browser.dns.resolve(fullTargetDomain).then((val) =>
		{
			//Assigning source IPs
			targetIP = val;
			//More IPs could have been found, for each of them
			for (let ip of targetIP.addresses)
			{
				//Check whether it's IPv4
				if (isIPV4(ip))
				{
					if (isIPV4Private(ip))
					{
						//Destination is IPv4 private
						isDestinationPrivate = true;
					}
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//Destination is IPv6 private
						isDestinationPrivate = true;
					}
				}
			}
		});
	}
	//Wait till all DNS resolutions are done, because its neccessary for upcoming actions
	await Promise.all([sourceResolution, destinationResolution]);

	//Blocking direction Public -> Private
	if (!isSourcePrivate && isDestinationPrivate)
	{
		notifyBlockedRequest(sourceUrl.hostname, targetUrl.hostname, requestDetail.type);
		return {cancel:true}
	}
	else //Permitting others
	{
		return {cancel: false};
	}
}

/**
 * The event listener, hooked up to webExtensions onMessage event.
 * The listener sends message response which contains information if the current site is whitelisted or not.
 * 
 * \param message Receives full message.
 * \param sender Sender of the message.
 * \param sendResponse Function for sending response.
 *
 */
function messageListener(message, sender, sendResponse)
{
	//Message came from popup,js, asking whether is this site whitelisted
	if (message.message === "is current site whitelisted?")
	{
		//Read the current hostname
		var currentHost = message.site;
		//Response with appropriate message
		if (checkWhitelist(currentHost))
		{
			return Promise.resolve("current site is whitelisted");
		}
		else
		{
			return Promise.resolve("current site is not whitelisted");
		}
	}
}
