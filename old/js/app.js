// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array or 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngRoute', 'ngAnimate', 'cordova.services', 'starter.services', 'starter.controllers', 'cordova.controllers'])

    .config(function ($compileProvider) {
        // Needed for routing to work
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    })

    .config(function($logProvider){
        $logProvider.debugEnabled(true);
    })
    .config(function ($routeProvider, $locationProvider) {

        // Set up the initial routes that our app will respond to.
        // These are then tied up to our nav router which animates and
        // updates a navigation bar
        $routeProvider.when('/home', {
            templateUrl: 'templates/app.html',
            controller: 'AppCtrl'
        }).when('/home/accelerometer', {
                templateUrl: 'templates/cordova/accelerometer.html',
                controller: 'AccelerometerCtrl'
            }).when('/home/camera', {
                templateUrl: 'templates/cordova/camera.html',
                controller: 'CameraCtrl'
            }).when('/home/capture', {
                templateUrl: 'templates/cordova/capture.html',
                controller: 'CaptureCtrl'
            }).when('/home/compass', {
                templateUrl: 'templates/cordova/compass.html',
                controller: 'CompassCtrl'
            }).when('/home/contacts', {
                templateUrl: 'templates/cordova/contacts.html',
                controller: 'ContactsCtrl'
            }).when('/home/device', {
                templateUrl: 'templates/cordova/device.html',
                controller: 'DeviceCtrl'
            }).when('/home/events', {
                templateUrl: 'templates/cordova/events.html',
                controller: 'EventsCtrl'
            }).when('/home/file', {
                templateUrl: 'templates/cordova/file.html',
                controller: 'FileCtrl'
            }).when('/home/geolocation', {
                templateUrl: 'templates/cordova/geolocation.html',
                controller: 'GeolocationCtrl'
            }).when('/home/globalization', {
                templateUrl: 'templates/cordova/globalization.html',
                controller: 'GlobalizationCtrl'
            }).when('/home/inappbrowser', {
                templateUrl: 'templates/cordova/inappbrowser.html',
                controller: 'InAppBrowserCtrl'
            }).when('/home/media', {
                templateUrl: 'templates/cordova/media.html',
                controller: 'MediaCtrl'
            }).when('/home/notification', {
                templateUrl: 'templates/cordova/notification.html',
                controller: 'NotificationCtrl'
            });

        $routeProvider.otherwise({
            redirectTo: '/home'
        });

    });

