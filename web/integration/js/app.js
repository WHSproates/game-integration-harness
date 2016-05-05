
var GameState = Object.freeze({
    DEFAULT: 0,
    OPENING: 1,
    RESTORING: 2,
    OPEN: 3,
    MINIMIZING: 4,
    MINIMIZED: 5,
    CLOSING: 6,
    CLOSED: 7
});

var RouletteView = function RouletteView () {

    this.created = false;
    this.messageBus = null;
};

RouletteView.prototype = {

    template: '<div id="roulette-overlay">' +
              '  <div id="roulette-frame-wrapper">' +
              '    <iframe id="roulette-iframe" sandbox="allow-scripts allow-same-origin allow-forms" ' +
              '            src="https://gaming.williamhill-pp2.com/launch/vegas2/roulettemobile"></iframe>' +
              '  </div>' +
              '  <div class="roulette-controls">' +
              '    <div class="roulette-control">' +
              '      <button id="roulette-minimize">-</button>' +
              '    </div>' +
              '    <div class="roulette-control">' +
              '      <button id="roulette-close">x</button>' +
              '    </div>' +
              '  </div>' +
              '</div>',

    create: function create (messageBus) {

        if (this.created) {
            return;
        }

        this.messageBus = messageBus;

        this.element = $(this.template);
        $('body').append(this.element);

        this.bind();
        this.show();
    },

    bind: function () {

        var self = this;

        this.element.find('#roulette-close').on('click', function () {

            self.messageBus.publish('roulette.minimize');
        });

        this.element.find('#roulette-minimize').on('click', function () {

            self.messageBus.publish('roulette.minimize');
        });
    },

    show: function show () {

        this.element.show();
    },

    hide: function hide () {

        this.element.hide();
    },

    destroy: function destroy () {

        this.element.remove();
        this.element = null;
        this.messageBus = null;
    }
};

var Roulette = function Roulette () {

    this.messageBus = null;
    this.gameState = GameState.DEFAULT;
};

Roulette.prototype = {

    open: function open () {

        if (this.gameState === GameState.MINIMIZED) {

            this.restoreAction();

        } else if (this.gameState === GameState.OPEN) {

            console.log('Game already open');

        } else if (this.gameState === GameState.OPENING) {

            console.log('Game already opening');

        } else if (this.gameState === GameState.MINIMIZING) {

            console.log('Game is currently minimizing');

        } else if (this.gameState === GameState.RESTORING) {

            console.log('Game is already restoring');

        } else if (this.gameState === GameState.DEFAULT || this.gameState === GameState.CLOSED) {

            this.openAction();

        } else {

            console.log('Invalid game state');
        }
    },

    openAction: function openAction () {

        this.gameState = GameState.OPENING;
        this.view = new RouletteView();
        this.view.create(this.messageBus);
        this.messageBus.publish('maximizeGame');
        this.gameState = GameState.OPEN;
    },

    restoreAction: function restoreAction () {

        this.gameState = GameState.RESTORING;
        this.view.show();
        this.messageBus.publish('maximizeGame');
        this.gameState = GameState.OPEN;
    },

    closeAction: function closeAction () {

        this.gameState = GameState.CLOSING;
        this.view.hide();
        this.view.destroy();
        this.view = null;
        this.messageBus.publish('closeGame');
        this.gameState = GameState.CLOSED;
    },

    minimizeAction: function minimizeAction () {

        this.gameState = GameState.MINIMIZING;
        this.view.hide();
        this.messageBus.publish('minimizeGame');
        this.gameState = GameState.MINIMIZED;
    },

    deviceAction: function deviceAction () {

        // In the real version this will use actual device info

        this.messageBus.publish('deviceInfo', {
            native: false,
            web: true,
            desktop: true,
            mobile: false,
            tablet: false
        });
    },

    listen: function listen (messageBus) {

        var self = this;
        this.messageBus = messageBus;

        messageBus.subscribe('gameUpdateBalance', function (topic, data) {

            console.log('Received topic gameUpdateBalance');
        });

        messageBus.subscribe('gameIsClosing', function (topic) {

            console.log('Received topic gameIsClosing');
        });

        messageBus.subscribe('gameAuthStatus', function (topic, data) {

            console.log('Received topic gameAuthStatus');
        });

        messageBus.subscribe('gameBalanceError', function (topic, data) {

            console.log('Received topic gameBalanceError');
        });

        messageBus.subscribe('gameShowDeposit', function () {

            console.log('Received topic gameShowDeposit');
        });

        messageBus.subscribe('gameGetDeviceInfo', function () {

            self.deviceAction();
        });

        messageBus.subscribe('roulette.close', function () {

            self.closeAction();
        });

        messageBus.subscribe('roulette.minimize', function () {

            self.minimizeAction();
        });
    },

    bindTo: function bindTo (selector) {

        var self = this;

        $('body').on('click', selector, function (event) {

            return self.handleLaunchClick(event);
        });
    },

    handleLaunchClick: function handleLaunchClick (event) {

        this.open();

        event.preventDefault();
        return false;
    }
};

$(document).ready(function () {

    var roulette = new Roulette();
    roulette.listen(window.WH.messageBus);
    roulette.bindTo('a.x-sell-roulette');
});
