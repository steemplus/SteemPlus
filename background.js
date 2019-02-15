chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("bgs: forwarded " + request.data + " to the tab " + request.to);
    if (request.command !== undefined){
      if(request.command!=="getVideoDuration")
        websiteSwitch(request.command);
    }
    else {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, request, function(response) {});
        });
    }
});

chrome.commands.onCommand.addListener(function(command) {
    console.log(command);
    websiteSwitch(command);
});

chrome.runtime.onMessageExternal.addListener(function(resp, sender, sendResponse) {
  let response=JSON.parse(resp);
  response.keychain=true;
  chrome.tabs.query({
      active: true,
      currentWindow: true
  }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, response);
  });
});

function arrayBufferToBase64(buffer) {
  var reader = new FileReader();
 reader.readAsDataURL(buffer);
 reader.onloadend = function() {
     base64data = reader.result;
     console.log(base64data);
     return base64data;
 }
}

function websiteSwitch(command) {
    chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
    }, function(tabs) {
        var url = tabs[0].url;
        var web = '';
        if (url.includes('busy.org')) web = 'busy.org';
        if (url.includes('utopian.io')) web = 'utopian.io';
        if (url.includes('steemit.com')) web = 'steemit.com';
        if (url.includes('steemd.com')) web = 'steemd.com';

        if (command === 'steemify') {
            if (web == 'busy.org' || web == 'utopian.io' || web == 'steemd.com') {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    var code = url.replace(web, 'steemit.com');
                    chrome.tabs.update(tabs[0].id, {
                        url: code
                    });
                });
            }
        }
        if (command === 'utopify') {
            if (web == 'busy.org' || web == 'steemit.com' || web == 'steemd.com') {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    var code = url.replace(web, 'utopian.io');
                    chrome.tabs.update(tabs[0].id, {
                        url: code
                    });
                });
            }
        }
        if (command === 'busyfy') {
            if (web == 'steemit.com' || web == 'utopian.io' || web == 'steemd.com') {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    var code = url.replace(web, 'busy.org');
                    chrome.tabs.update(tabs[0].id, {
                        url: code
                    });
                });
            }
        }
        if (command === 'steemdify') {
            if (web == 'busy.org' || web == 'utopian.io' || web == 'steemit.com') {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    var code = url.replace(web, 'steemd.com');
                    chrome.tabs.update(tabs[0].id, {
                        url: code
                    });
                });
            }
        }
    });
}

function autoVote() {
    // Send message to autoVote script
    console.log('Launch auto vote from background');

    setTimeout(function(){
        chrome.storage.local.get(['auto_vote_configs', 'sessionToken', 'tokenExpire'], function(items){
            console.log("Send Message to script");   
            chrome.tabs.query({active: true}, function(tabs){ 
                chrome.tabs.sendMessage(tabs[0].id, {
                    to: 'auto_vote',
                    order: 'start',
                    items: items
                }); 
            });
        });
    }, 5000);
    
}

autoVote();


