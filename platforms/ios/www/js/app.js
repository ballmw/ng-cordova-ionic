// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array or 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngAnimate', 'cordova.services', 'starter.services', 'starter.controllers', 'cordova.controllers'])

    .config(function ($compileProvider) {
        // Needed for routing to work
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    })

    .config(function ($logProvider) {
        $logProvider.debugEnabled(true);
    })

    .config(function ($stateProvider, $urlRouterProvider) {


        $stateProvider
            .state('tabbed', {
                url: "",
                abstract: true,
                views: {
                    'body@': {
                        templateUrl: 'templates/tabbed-app.html',
                        controller: 'AppCtrl'
                    }
                }
            })
            .state('plain', {
                url: "",
                abstract: true,
                views: {
                    'body@': {
                        templateUrl: 'templates/plain-app.html',
                        controller: 'AppCtrl'
                    }
                }
            })
            .state('tabbed.home', {
                url: '/home',
                views: {
                    'content@': {
                        templateUrl: 'templates/home.html',
                        controller: 'AppTabCtrl'
                    }}
            })
            .state('tabbed.about', {
                url: '/about',
                views: {
                    'content@': {
                        templateUrl: 'templates/about.html',
                        controller: 'AboutTabCtrl'
                    }}
            })
            .state('tabbed.cordova', {
                url: '/cordova',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova.html',
                        controller: 'CordovaTabCtrl'
                    }}
            })


            .state('accelerometer', {
                url: '/cordova/accelerometer',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/accelerometer.html',
                        controller: 'AccelerometerCtrl'
                    }}
            })
            .state('camera', {
                url: '/cordova/camera',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/camera.html',
                        controller: 'CameraCtrl'
                    }}
            })
            .state('capture', {
                url: '/cordova/capture',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/capture.html',
                        controller: 'CaptureCtrl'
                    }}
            })
            .state('compass', {
                url: '/cordova/compass',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/compass.html',
                        controller: 'CompassCtrl'
                    }}
            })
            .state('contacts', {
                url: '/cordova/contacts',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/contacts.html',
                        controller: 'ContactsCtrl'
                    }}
            })
            .state('device', {
                url: '/cordova/device',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/device.html',
                        controller: 'DeviceCtrl'
                    }}
            })
            .state('events', {
                url: '/cordova/events',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/events.html',
                        controller: 'EventsCtrl'
                    }}
            })
            .state('file', {
                url: '/cordova/file',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/file.html',
                        controller: 'FileCtrl'
                    }}
            })
            .state('geolocation', {
                url: '/cordova/geolocation',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/geolocation.html',
                        controller: 'GeolocationCtrl'
                    }}
            })
            .state('globalization', {
                url: '/cordova/globalization',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/globalization.html',
                        controller: 'GlobalizationCtrl'
                    }}
            })
            .state('inappbrowser', {
                url: '/cordova/inappbrowser',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/inappbrowser.html',
                        controller: 'InAppBrowserCtrl'
                    }}
            })
            .state('media', {
                url: '/cordova/media',
                parent: 'plain',
                templateUrl: 'templates/cordova/media.html',
                controller: 'MediaCtrl'
            })
            .state('notification', {
                url: '/cordova/notification',
                parent: 'plain',
                views: {
                    'content@': {
                        templateUrl: 'templates/cordova/notification.html',
                        controller: 'NotificationCtrl'
                    }}
            })
        ;

        $urlRouterProvider.otherwise("/cordova");
    })
;



