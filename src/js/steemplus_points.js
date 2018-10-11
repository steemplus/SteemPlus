var token_steemplus_point = null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var myUsernameSPP = null;
var myAccountSPP = null;
var usernameSPP = null;
var retrySteemplusPoint = 0;

var sbdPerSteem = null;
var totalVestsSPP = null;
var totalSteemSPP = null;

var isSteemit = null;
var isBusy = null;

var wayList = [
    {id: "0", title: "Boost a post with Minnowbooster using SteemPlus",description:"Use the \'Boost\' Button on the bottom of the article to buy votes on MinnowBooster.", description_post: "@steem-plus/steemplus-2-19-updated-boost-button-collaboration-announcement-earn-more-with-steemplus-points", "url": "src/img/howtoearnspp/minnowbooster.png" , formula: "The amount of SBD sent to MinnowBooster (example : You get 1 SPP for 1 SBD or 1 SBD worth of Steem)"},
    {id: "1", title: "Boost a post with PostPromoter using SteemPlus",description:"Use the \'Boost\' Button on the bottom of the article to buy votes on PostPromoter.", description_post: "@steem-plus/steemplus-2-19-updated-boost-button-collaboration-announcement-earn-more-with-steemplus-points", "url": "src/img/howtoearnspp/postpromoter.png", formula: "The amount of SBD sent to PostPromoter (example : You get 1 SPP for 1 SBD or 1 SBD worth of Steem)"},
    {id: "2", title: "Create a new post with Beneficiaries using SteemPlus",description:"Use the \'Add Beneficiaries\' button on the post creation page. (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-1-7-share-your-rewards-with-your-friends-beneficiaries-ideal-for-the-steemfest", "url": "src/img/howtoearnspp/beneficiaries.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "3", title: "Create a post with Donation for SteemPlus",description:"Use the \'Post and Support\' button on the post creation page. (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-2-18-2-post-and-support", "url": "src/img/howtoearnspp/donation.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "4", title: "Create a new DTube post using SteemPlus",description:"Post to DTube by putting dtube followed by a space in the tag bar, then following the instructions in the DTube popup (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-221-earn-more-by-posting-to-dtube-via-steemplus", "url": "src/img/howtoearnspp/dtube.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "5", title: "Create a new Utopian post using SteemPlus",description: "Post to Utopian by typing utopian-io followed by a space in the tag bar, then following the instructions in the Utopian popup (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-220-utopian--steemplus-partnership--bigger-upvotes", "url": "src/img/howtoearnspp/utopian.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "6", title: "Buy Steem Monsters packs using SteemPlus",description: "Earn SteemPlus Points (SPP) for each SteemMonsters pack you buy from SteemPlus. <br> If you don\'t have an account on SteemMonsters yet, follow <a href='https://steemmonsters.com/?ref=steemplus-pay' target='_blank'>this link</a> to do so, you will automatically get SPP for all your future purchases.", description_post: "@steem-plus/steemplus-31--buy-your-steem-monsters-packs-from-steemplus-and-earn-steemplus-points-spp", "url": "src/img/howtoearnspp/steemmonsters.png", formula: "You will get 10 times more SPP than the SPP you spend (spend 20 SBD buying cards, earn 200 SPP)"},
    {id: "7", title: "Buy SteemPlus Points",description: "Send STEEM or SBD to @steemplus-pay.", description_post: "@steem-plus/steemplus-32--buy-spp", "url": "src/img/howtoearnspp/buySpp.png", formula: "Send 1 SBD get 100 SPP."},
    {id: "8", title: "Delegate Steem Power to SteemPlus",description: "Delegate Steem Power to @steem-plus and get SPP", description_post: "@steem-plus/", "url": "src/img/howtoearnspp/delegation.png", formula: "Get 1 SPP per week per SBD worth of Steem Power (SPP per week = AmountSP * STEEMPrice/SBDPrice )"}
]

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'steemplus_points' && request.order === 'start' && token_steemplus_point == null) {
        token_steemplus_point = request.token;
        myUsernameSPP = request.data.account.name;
        myAccountSPP = request.data.account;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        sbdPerSteem = request.data.market.SBDperSteem;
        totalVestsSPP = request.data.global.totalVests;
        totalSteemSPP = request.data.global.totalSteem;
        retrySteemplusPoint = 0;
        canStartSteemplusPoint();
    } else if (request.to === 'steemplus_points' && request.order === 'click' && token_steemplus_point == request.token) {
        myUsernameSPP = request.data.account.name;
        myAccountSPP = request.data.account;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        sbdPerSteem = request.data.market.SBDperSteem;
        totalVestsSPP = request.data.global.totalVests;
        totalSteemSPP = request.data.global.totalSteem;
        retrySteemplusPoint = 0;
        canStartSteemplusPoint();
    }
});

function canStartSteemplusPoint()
{
    if(retrySteemplusPoint >= 20) return;
    if(regexWalletSteemit.test(window.location.href))
    {
        if($('.Trans').length > 0)
          downloadDataSteemplusPoints(window.SteemPlus.Utils.getPageAccountName());
        else
            setTimeout(function(){
                retrySteemplusPoint++;
                canStartSteemplusPoint();
            },100);
    }
    else if(regexWalletBusy.test(window.location.href))
    {
        if($('.UserWalletSummary').length > 0)
        {
            if(window.location.href.includes('/wallet'))
                downloadDataSteemplusPoints(myUsernameSPP);
            else {
                usernameSPP = window.location.href.split('@')[1].split('/')[0];
                downloadDataSteemplusPoints(usernameSPP);
            }
        }
        else
            setTimeout(function(){
                retrySteemplusPoint++;
                canStartSteemplusPoint();
            });
    }
    else
        console.log('no url');
}

function downloadDataSteemplusPoints(usernameSPP)
{
    $.ajax({
        type: "GET",
        beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: `https://steemplus-api.herokuapp.com/api/get-steemplus-points/${usernameSPP}`,
        success: function(response) {
            displaySteemplusPoints(response[0]);
        },
        error: function(msg) {
            resolve(msg);
        }
    });
}

function displaySteemplusPoints(userDetails)
{
    if(isSteemit)
    {
        let divSPP = $(`
            <div class="UserWallet__balance row zebra">
                <div class="column small-12 medium-8">
                    SteemPlus Points
                    <div class="FormattedHTMLMessage secondary">
                        SPP allow you to receive a share of @steem-plus vote and are redeemable for premium features.
                    </div>
                </div>
                <div class="column small-12 medium-4 nbPointsDiv">
                    <li class="DropdownMenu Wallet_dropdown dropdownSPPLink">
                        <a>
                            <span>${(userDetails !== undefined ? userDetails.nbPoints.toFixed(2) : 0)} SPP
                                <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span>
                            </span>
                        </a>
                        <ul class="VerticalMenu menu vertical VerticalMenu dropdownSPP">
                            <li class="howToEarn"><a>How to earn SPP ?</a></li>
                            <li class="sppHistory"><a>SteemPlus Points History</a></li>
                            <li class="buySPP"><a>Buy SteemPlus Points</a></li>
                            <li class="sppDelegation"><a>Delegate to SteemPlus</a></li>
                        </ul>
                    </li>
                </div>
            </div>
            `);
        if(myUsernameSPP !== window.SteemPlus.Utils.getPageAccountName()){
            divSPP.find('.buySPP').remove();
            divSPP.find('.howToEarn').remove();
            divSPP.find('.sppDelegation').remove();
        }

        $('.UserWallet__balance').eq($('UserWallet__balance ').length-1).before(divSPP);
        $('.dropdownSPPLink').click(function(){
            if($(this).hasClass('show'))
                $(this).removeClass('show');
            else
                $(this).addClass('show');
        });
        $('.sppDelegation').click(async function(){
            let maxAmountAvailableDelegationSPP = await getMaxSP();

            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
                <div class="reveal-overlay fade in" style="display: block;"></div>
                <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                    <button class="close-button" type="button">
                        <span aria-hidden="true" class="">×</span>
                    </button>
                    <div id="modalTitle" class="row">
                        <h3 class="column">Delegate Steem Power to SteemPlus</h3>
                    </div>
                    <div class="row">
                        <label class="disclaimerDelegateSpp">Delegate Steem Power to @steem-plus and get SPP.</label>
                    </div>

                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">To</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <span class="input-group-label label_buy_spp">@</span>
                                <input id="delegatedUser" type="text" name="delegatedUser" value="steem-plus" disabled>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">From</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <span class="input-group-label label_buy_spp">@</span>
                                <input id="delegatingUser" type="text" name="delegatingUser" value="${myUsernameSPP}" disabled>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">Amount</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 5px;">
                                <input id="amountDelegationSPP" type="number" placeholder="Amount" name="amountDelegationSPP" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="" min="0" max="${maxAmountAvailableDelegationSPP}" step="1">
                                <span class="input-group-label label_buy_spp" style="padding-left: 0px; padding-right: 0px;">
                                    <select name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;" disabled>
                                        <option value="SPP" selected="">SP</option>
                                    </select>
                                </span>
                            </div>
                            <div class="amountDelegationSpan" style="color: rgb(51, 51, 51);">
                                <small>Max Available: <a id="maxAvailableLink"><span class="maxAmountAvailableDelegationSPP"></span> SP</a></small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <button class="button-steemit" id="delegationSPPButton">Delegate</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);

            modal.find('#maxAvailableLink').click(function(){
                modal.find('#amountDelegationSPP').val(maxAmountAvailableDelegationSPP);
            });
            
            modal.find('.maxAmountAvailableDelegationSPP').text(maxAmountAvailableDelegationSPP);

            modal.find('#delegationSPPButton').on('click', function(){
                const amountDelegation = modal.find('#amountDelegationSPP').val();

                if(amountDelegation > maxAmountAvailableDelegationSPP){
                    alert(`The amount you want to delegate is too high. The maximum you can delegate is ${maxAmountAvailableDelegationSPP} SP`);
                    return;
                }

                var delegatedVestsSPP = amountDelegation * totalVestsSPP / totalSteemSPP;
                delegatedVestsSPP=delegatedVestsSPP.toFixed(6);
                var urlDelegationSPP = 'https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + myUsernameSPP + '&delegatee=steem-plus&vesting_shares='+delegatedVestsSPP+'%20VESTS';
                window.open(url, '_blank');
            });

            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
        $('.buySPP').click(function(){
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
                <div class="reveal-overlay fade in" style="display: block;"></div>
                <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                    <button class="close-button" type="button">
                        <span aria-hidden="true" class="">×</span>
                    </button>
                    <div id="modalTitle" class="row">
                        <h3 class="column">Buy SteemPlus Points</h3>
                    </div>
                    <div class="row">
                        <label class="disclaimerBuySpp">Your new SteemPlus Points can take up to 10 minutes to appear in your balance.</label>
                    </div>

                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">To</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <span class="input-group-label label_buy_spp">@</span>
                                <select id="selectReceiverSPP" style="min-width: 5rem; height: inherit; background-color: transparent;" autofocus="" disabled>
                                    <option value="steemplus-pay" selected="">steemplus-pay</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <br>
                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">Send</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 5px;">
                                <input id="sent_amount" type="number" placeholder="Amount" name="sent_amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="" min="0" step="0.001">
                                <span class="input-group-label label_buy_spp" style="padding-left: 0px; padding-right: 0px;">
                                    <select id="sent_currency" name="sent_currency" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">
                                        <option value="SBD" selected="">SBD</option>
                                        <option value="STEEM">STEEM</option>
                                    </select>
                                </span>
                            </div>
                            <div class="amount-error" style="color: rgb(51, 51, 51);">
                                <small>Min: 0.010 SBD</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">Receive</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 5px;">
                                <input id="receive_amount" type="number" placeholder="Amount" name="receive_amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="" min="1" step="1">
                                <span class="input-group-label label_buy_spp" style="padding-left: 0px; padding-right: 0px;">
                                    <select name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;" disabled>
                                        <option value="SPP" selected="">SPP</option>
                                    </select>
                                </span>
                            </div>
                            <div class="amount-error" style="color: rgb(51, 51, 51);">
                                <small>Min: 1 SPP</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <button class="button-steemit" id="buySPPButton">Buy SPP</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);

            modal.find('#buySPPButton').on('click', function(){
                let amountReceived = modal.find('#receive_amount').val();
                let amountSent = modal.find('#sent_amount').val();
                let sentCurrency = modal.find('#sent_currency').val();
                let selectReceiverSPP = modal.find('#selectReceiverSPP').val();

                if(amountReceived < 1){
                    alert(`You can't buy less than 1 SPP`);
                    modal.find('#receive_amount').val(1);
                    refreshSentInput();
                    return;
                }

                var memoBuySPP = `buySPP : Bought ${amountReceived} SPP for ${amountSent} ${sentCurrency}`;
                var urlBuySPP = 'https://steemconnect.com/sign/transfer?from=' + myUsernameSPP + '&to=' + selectReceiverSPP + '&amount=' + amountSent + '%20' + sentCurrency + '&memo=' + memoBuySPP;
                var win = window.open(urlBuySPP, '_blank');
                if (win) {
                    //Browser has allowed it to be opened
                    win.focus();
                } else {
                    //Browser has blocked it
                    alert('Please allow popups for this website');
                }
            });
            modal.find('#receive_amount').on('input', function(){
                sentIsLastInput = false;
                refreshSentInput(modal);
            });
            modal.find('#sent_amount').on('input', function(){
                sentIsLastInput = true;
                refreshReceivedInput(modal);
            });
            modal.find('#sent_currency').on('input', function(){
                if(sentIsLastInput)
                    refreshReceivedInput(modal);
                else
                    refreshSentInput(modal);
            });

            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
        $('.howToEarn').click(function()
        {
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
              <div class="reveal-overlay fade in" style="display: block;"></div>
                <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                    <button class="close-button" type="button">
                        <span aria-hidden="true" class="">×</span>
                    </button>
                    <div id="modalTitle" class="row">
                        <h3 class="column">How to earn SteemPlus Points?</h3>
                    </div>
                    <ol>
                    </ol>
                    <div class="howToEarnSlider">
                        <ul>
                        </ul>
                    </div>
                </div>
            </div>`);

            wayList.forEach((way) => {
                modal.find('.howToEarnSlider > ul').append(`<li>
                    <div class="slide-text">
                        <p class="caption-how-to-earn">${way.title}</p>
                        <p>
                            <label class="title-how-to-earn">How to get it ?</label>
                            <p>${way.description}</p>
                            <a href="/${way.description_post}" target="_blank"><label class="description-how-to-earn description-link">Read this post for more information.</label></a><br>
                            <label class="title-how-to-earn">How much ?</label>
                            <label class="description-how-to-earn">${way.formula}</label>
                        </p>
                    </div>
                    <img src="${chrome.extension.getURL(way.url)}" alt="${way.title}">
                </li>`);
                modal.find('ol').append(`<li class="indexHowToEarnItem"><a name="${way.id}">${way.title}</a></li>`);
            });

            var howToEarnSlider = modal.find('.howToEarnSlider').unslider({
                keys: true,
                arrows: false
            });

            modal.find('.indexHowToEarnItem > a').click(function()
            {
                howToEarnData = howToEarnSlider.data('unslider');
                howToEarnData.animate(parseInt(`${$(this).attr('name')}`), 'next');
            });


            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
        $('.sppHistory').click(function()
        {
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
          <div class="reveal-overlay fade in" style="display: block;"></div>
            <div class="reveal fade in sppHistoryModal" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                <button class="close-button" type="button">
                    <span aria-hidden="true" class="">×</span>
                </button>
                <div id="modalTitle" class="row">
                    <h3 class="column">SteemPlus Points History</h3>
                </div>
                <p>SPP earned from posts will be collected after payout.<br>SPP earned from transactions might take up to 20 minutes to be collected.</p>
                <h4 class="column">Total SteemPlus Points : ${(userDetails === undefined || userDetails.nbPoints === 0 ? 0 : userDetails.nbPoints.toFixed(2))} SPP</h4>
                <div class="sppHistoryDetail">
                </div>
            </div>
          </div>`);

            if(userDetails === undefined || userDetails.nbPoints === 0)
                modal.find('.sppHistoryDetail').append('<h4>No detail available</h4>');
            else
            {
                modal.find('.sppHistoryDetail').append(`<table class="sppHistoryTable">
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Number of point</th>
                        <th>Permlink</th>
                    </tr>
                </table>`);
                var ptsDetails = userDetails.pointsDetails;
                ptsDetails.sort(function(a, b) {return new Date(b.timestamp) - new Date(a.timestamp);});
                ptsDetails.forEach((pointsDetail) => {
                    console.log(pointsDetail);
                    modal.find('.sppHistoryTable').append(`
                    <tr>
                        <td><span title="${new Date(pointsDetail.timestamp)}"><span>${moment(new Date(pointsDetail.timestamp)).fromNow()}</span></span></td>
                        <td>${pointsDetail.typeTransaction.name}</td>
                        <td>${pointsDetail.nbPoints.toFixed(2)}</td>
                        ${(pointsDetail.url === undefined ? `<td><a target="_blank" href="${pointsDetail.permlink}">${pointsDetail.permlink}</a></td>` : `<td><a target="_blank" href="${pointsDetail.url}">${pointsDetail.title}</a></td>`)}
                    </tr>`);
                });
            }

            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
    }

    else if(isBusy)
    {
        let divSPP = $(`
            <div class="UserWalletSummary__item">
                <i class="iconfont icon-Dollar UserWalletSummary__icon"></i>
                <div class="UserWalletSummary__label">
                    <span>SteemPlus Points</span>
                </div>
                <div class="UserWalletSummary__value">
                    <span><span>${(userDetails !== undefined ? userDetails.nbPoints.toFixed(2) : 0)}</span> SPP</span>
                </div>
            </div>`);

        // $('.icon-people_fill').parent().after(divSPP);


    }
}

function refreshSentInput(modal)
{
    let amountReceived = modal.find('#receive_amount').val();
    let sentCurrency = modal.find('#sent_currency').val();
    if(sentCurrency === 'SBD')
        modal.find('#sent_amount').val((amountReceived/100).toFixed(2));
    else
        modal.find('#sent_amount').val((amountReceived/100/sbdPerSteem).toFixed(2));
}

function refreshReceivedInput(modal)
{
    let sentAmount = modal.find('#sent_amount').val();
    let sentCurrency = modal.find('#sent_currency').val();
    if(sentCurrency === 'SBD')
        modal.find('#receive_amount').val((sentAmount*100).toFixed(2));
    else
        modal.find('#receive_amount').val((sentAmount*100*sbdPerSteem).toFixed(2));
}

// Function used to get the maximum SP user can delegate
async function getMaxSP(){
    let myOutgoingDelegations = await steem.api.getVestingDelegationsAsync(myAccountSPP.name, null, 10);
    let tmp = 0;
    for (myOutgoingDelegation of myOutgoingDelegations) {
      var valueDelegation = Math.round(parseFloat(steem.formatter.vestToSteem(myOutgoingDelegation.vesting_shares, totalVestsSPP, totalSteemSPP)) * 100) / 100;
      if(valueDelegation>0)
        tmp += valueDelegation;
    }
    let myTotalOutgoingDelegation = tmp;
    var myVests = parseFloat(steem.formatter.vestToSteem(myAccountSPP.vesting_shares.replace(' VESTS',''), totalVestsSPP, totalSteemSPP) * 100) / 100;
    var maxSP = myVests - myTotalOutgoingDelegation - 5.000;
    return (maxSP > 0 ? maxSP.toFixed(3) : 0);
}
