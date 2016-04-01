# Integration Test Harness

For best results, serve the `web` folder in a web server. Or, just open `web/index.html` in a browser.

For integrations it might be best to look in the `web/integrations` folder. Here you will find a JavaScript and CSS file that are included in the harness but are currently empty. You can put your JS and CSS in these files.

# Game integration

For this integration we have added some CSS and JS to the `web/integrations` folder. Open the harness in a browser.

You can click on the roulette button (in any breakpoint) to create the game overlay (with very basic styling) that can be closed or minimized.

The pub/sub is available in window.WH.messageBus. The sportsbook stub included in this harness listens to the agreed events but does not currently take any action.
