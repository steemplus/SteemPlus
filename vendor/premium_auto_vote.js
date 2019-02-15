let api=null;

steem.api.setOptions({
    url: 'https://api.steemit.com'
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'auto_vote' && request.order === 'start') {
        const items = request.items;
        var steemConnect = (items.sessionToken === undefined || items.tokenExpire === undefined) ? {
            connect: false
        } : {
            connect: true,
            sessionToken: items.sessionToken,
            tokenExpire: items.tokenExpire
        }
        const tokenBg = window.SteemPlus.Utils.makeToken();
        console.log('Connecting...');
        if (steemConnect.connect === true && steemConnect.tokenExpire > Date.now()) {
            api=sc2.Initialize({
                baseURL:'https://steemconnect.com',
                app: 'steem-plus',
                callbackURL: 'https://steemit.com/@steem-plus',
                accessToken: steemConnect.sessionToken,
                scope: ['vote', 'comment', 'comment_options', 'custom_json']
            });
            api.me().then(async function(me) {
                // If user is connected to SteemConnect we can continue
                launchAutoVote(items, me.name);
            });
        }
        else
        {
            // Nothing to do because connection to SteemConnect is necessary.
            console.log("Not connected to SteemConnect");
        }
    }
    
});

async function launchAutoVote(items, connectedUsername) {
    console.log("Steemplus launch auto vote");
    activePremiumFeaturesSubscriptions = await window.SteemPlus.api.getActivePremiumFeatureSubscriptions(connectedUsername);
    // If nothing to vote for return
    if(items.auto_vote_configs[connectedUsername] == undefined) return;
    
    const autoVotes = items.auto_vote_configs[connectedUsername].auto_vote_list == undefined ? [] : items.auto_vote_configs[connectedUsername].auto_vote_list;
    const voteAfter = items.auto_vote_configs[connectedUsername].vote_after == undefined ? '' : items.auto_vote_configs[connectedUsername].vote_after;
    const voteAfterUnit = items.auto_vote_configs[connectedUsername].vote_after_unit == undefined ? '' : items.auto_vote_configs[connectedUsername].vote_after_unit;
    
    // If has feature vote
    if(autoVotes.length > 0 && window.SteemPlus.Utils.hasPremiumFeature("Auto Vote", activePremiumFeaturesSubscriptions)) 
        startAutoVote(autoVotes, voteAfter, voteAfterUnit, connectedUsername);
}

function startAutoVote(autoVotes, voteAfter, voteAfterUnit, connectedUsername) {
    for(let i = 0; i < autoVotes.length; i++){
        (function(indexPost) {
            steem.api.getDiscussionsByAuthorBeforeDate(autoVotes[indexPost].username, null, new Date().toISOString().split('.')[0], 100, function(err, results) {
                
                results.sort(function(a, b) {
                    return new Date(b.created) - new Date(a.created);
                });

                if(err) console.log(err);
                toastr.options = {
                  "closeButton": false,
                  "debug": false,
                  "newestOnTop": false,
                  "progressBar": true,
                  "positionClass": "toast-bottom-center",
                  "preventDuplicates": false,
                  "onclick": null,
                  "showDuration": "300",
                  "hideDuration": "1000",
                  "timeOut": "20000",
                  "extendedTimeOut": "1000",
                  "showEasing": "swing",
                  "hideEasing": "linear",
                  "showMethod": "fadeIn",
                  "hideMethod": "fadeOut"
                };

                for(result of results)
                {
                    console.log(result);
                    const author = autoVotes[indexPost].username;
                    const percent = autoVotes[indexPost].percent;
                    const title = result.title;
                    const url = result.url;
                    const permlink = result.permlink;
                    const createdDate = result.created;
                    let manualClose = false;

                    let desiredVoteDate = null;
                    switch(voteAfterUnit) {
                        case 'day':
                            desiredVoteDate = window.SteemPlus.Utils.addDays(createdDate, voteAfter);
                            break;
                        case 'hour':
                            // code block
                            desiredVoteDate = window.SteemPlus.Utils.addHours(createdDate, voteAfter);
                            break;
                        case 'min':
                            desiredVoteDate = window.SteemPlus.Utils.addMinutes(createdDate, voteAfter);
                            // code block
                            break;
                        default:
                            desiredVoteDate = createdDate;
                            // code block
                    }
                    let currentDate = new Date();
                    if(desiredVoteDate > currentDate)
                    {
                        let timeout = window.SteemPlus.Utils.diffDates(currentDate, desiredVoteDate);
                        if(timeout > 300000) break;
                        console.log(`Vote for ${title} created on ${createdDate} will vote on ${desiredVoteDate}. Need to wait ${timeout} ms`);
                        setTimeout(function() {
                            toastr.options.onHidden = function() { 
                                if(!manualClose) 
                                    autoVotePost(author, permlink, percent, connectedUsername);
                            }

                            toastr.info(`
                                You are about to give a ${percent}% for '${title}' written by @${author}. <br>
                                <button class="btn btn-primary" id="auto-vote-confirm">Confirm</button>
                                <button class="btn btn-primary" id="auto-vote-read">Read</button>
                                <button class="btn btn-primary" id="auto-vote-cancel">Cancel</button>
                                `,
                                "SteemPlus - Auto Vote"
                            );

                            $('#auto-vote-confirm').click(() => {
                                manualClose = true;
                                autoVotePost(author, permlink, percent, connectedUsername);
                            });
                            $('#auto-vote-read').click(() => {
                                manualClose = true;
                                const win = window.open(`https://steemit.com/${url}`, '_blank');
                                if (win) {
                                    //Browser has allowed it to be opened
                                    win.focus();
                                } else {
                                    //Browser has blocked it
                                    alert('Please allow popups for this website');
                                }
                            });
                            $('#auto-vote-cancel').click(() => {
                                manualClose = true;
                            });
                        }, timeout);
                    }
                    else {
                        console.log(`Vote date already passed. No need to check other posts from ${author}`);
                        break;
                    }
                }
            });
        })(i);
    }
}

function autoVotePost(author, permlink, percent, connectedUsername) {
    console.log(`${connectedUsername} will be voting ${author} ${permlink} ${percent}%`);
    api.vote(
        connectedUsername, // Voter
        author, // Author
        permlink, // Permlink
        parseInt(percent) * 100, // Weight (10000 = 100%)
        function(err, result) {
            if (err !== undefined && err !== null && err.cause !== undefined && err.cause.toString().includes('Voting weight is too small, please accumulate more voting power or steem power.'))
                alert('Voting weight is too small, please accumulate more voting power or steem power.');
            if(err) console.log(err)
            else console.log(result);
        }
    );
}