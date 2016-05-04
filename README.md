# Integration Test Harness

For best results, serve the `web` folder in a web server. Or, just open `web/index.html` in a browser.

For integrations it might be best to look in the `web/integrations` folder. Here you will find a JavaScript and CSS file that are included in the harness but are currently empty. You can put your JS and CSS in these files.

# Game integration

For this integration we have added some CSS and JS to the `web/integrations` folder. Open the harness in a browser.

You can click on the roulette button (in any breakpoint) to create the game overlay (with very basic styling) that can be closed or minimized.

The pub/sub is available in window.WH.messageBus. The sportsbook stub included in this harness listens to the agreed events but does not currently take any action.

# API for Game/Sportsbook communication

All communication between Sportsbook and Game (either direction) will use the pub/sub mechanism provided by Sportsbook.

The API of the pub/sub is as follows:

```javascript
/**
 * Subscribe to a topic.
 *
 * @param {String} topic The name of the topic to subscribe to.
 * @param {Function(topic: String, ...)} callback The function that will be invoked when a topic is published.
 *                                                The optional parameters are specific to each topic.
 *
 * @returns {String} A subscription ID (unique to the pub/sub instance). Can be used to unsubscribe().
*/
function subscribe (topic, callback)
 
/**
 * Unsubscribe from a topic.
 *
 * @param {String} id Subscription ID previously obtained from subscribe().
 *
 * @returns {void}
 */
function unsubscribe (id)
 
/**
 * Publish to a topic.
 *
 * Each current subscriber of the topic will be invoked immediately.
 *
 * Optional parameters may be passed; the detail of these is specific to each topic.
 *
 * @param {String} topic The name of the topic to publish to.
 *
 * @returns {void}
 */
function publish (topic, ...)
 
/**
 * Publish to a topic in a 'sticky' way such that future subscribers will be invoked with the last published values.
 *
 * Each current subscriber of the topic will be invoked immediately; future subscribers will be invoked with the last published
 * values upon subscription.
 *
 * Optional parameters may be passed; the detail of these is specific to each topic.
 *
 * @param {String} topic The name of the topic to publish to.
 *
 * @returns {void}
 */
function publishSticky (topic, ...)
```

The pub/sub will be available in the scope of the Game as object `window.WH.messageBus`.

Example:

```javascript
// Subscribe to topic with no payload
 
window.WH.messageBus.subscribe('closeGame', function () {
    // code to close the game
});
 
// Subscribe to topic with payload
 
window.WH.messageBus.subscribe('gameUpdateBalance', function (topic, data) {
    // code to update the balance with data.balance
});
 
// Publish to topic with no payload
 
window.WH.messageBus.publish('closeGame');
 
// Publish to topic with payload
 
window.WH.messageBus.publish('gameUpdateBalance', {
    balance: '10.50'
});
```

The following topics should be published by Game and subscribed by Sportsbook.

`gameUpdateBalance` - Game will publish this topic when there is a in-game transaction which potentially changes the user balance. Sportsbook will update the user balance showed in the header area.

```javascript
{
 "balance": 0.00
}
```

`gameIsClosing` – Game will publish this topic when the game is exiting (if there is an in game exit button), and Sportsbook should dismiss the iFrame. At this point, clicking on a Roulette icon would require the game to reload in fullscreen. No payload.

`gameAuthStatus` - Game will publish this topic to notify Sportsbook about the user's authentication status.

```javascript
{
    "authenticated": false
}
```

`gameBalanceError` - Game will publish this topic if there is a problem with the user's balance.

```javascript
{
   "code": "999",
   "message": "Insufficient Funds"
}
```

`gameShowDeposit` - Game will publish this topic in order to trigger the quick deposit dialog. No payload.

`gameGetDeviceInfo` - Game will publish this topic in order to request device info from Sportsbook. No payload. See topic `deviceInfo`.

Game will subscribe to the following topics which will be published by Sportsbook:

`launchGame` - Published when Game needs to launch. Because multiple integrations/games may be listening to this topic, the short name of the game will be passed. The launch URL of the game will also be passed.
```javascript
{
    "game": "roulette", // to identify which game should launch
    "url": "https://gaming.williamhill-pp2.com/launch/vegas2/roulettemobile"
}
```

`maximizeGame` – Published when game needs to maximize. This would get the game to change modes back to the fullscreen game. No payload.

`minimizeGame` – Published when Game needs to minimize. This would get the game to change modes so that it can work in the minimal mode. No payload.

`closeGame` - Published when Game needs to close. No payload.

`deviceInfo` - Published in response to `gameGetDeviceInfo`. Contains information about the platform. Inside the Sportsbook App (iOS), `native` will be true and `web` will be false. See below for description.

```javascript
{
  "native": false, // true in Sportsbook App (iOS), false everywhere else (desktop, mobile safari...)
  "web": true,     // false in Sportsbook App (iOS), true everywhere else
  "desktop": true, // true only on desktop browsers
  "mobile": false, // true only on mobile devices
  "tablet": false  // true only on table devices
}
```