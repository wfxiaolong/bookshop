

define(['ionic','asyncLoader','ngCordova'],function (ionic,asyncLoader) {
    var app = angular.module('app', ['ui.router','ionic','ngCordova']);

    asyncLoader.configure(app);

    return app;
});