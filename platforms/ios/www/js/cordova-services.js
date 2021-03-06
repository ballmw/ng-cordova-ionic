angular.module('cordova.services', [])
    .run(function(){
        console.log("Run Cordova Services");

        //if(console.useLogger){
        //    console.useLogger()
        //}
    })
    .service("AccelerometerService", function () {
        //http://cordova.apache.org/docs/en/3.3.0/cordova_accelerometer_accelerometer.md.html#Accelerometer
        return navigator.accelerometer;
    })
    .service("CameraService", ['$q', '$log', function ($q, $log) {
        //http://cordova.apache.org/docs/en/3.3.0/cordova_camera_camera.md.html#Camera
        var service = {

            camera: navigator.camera,
            take: function (cameraOptions) {
                $log.debug('CameraService: taking picture');
                var deferred = $q.defer();
                navigator.camera.getPicture(
                    function (imageURI) {
                        $log.debug('CameraService: took picture :' + imageURI);
                        deferred.resolve(imageURI);
                    },
                    function (message) {
                        $log.debug('CameraService: failed to take picture :' + message);
                        deferred.reject(message);
                    },
                    cameraOptions
                );
                return deferred.promise;
            }
        }
        return service;
    }])
    .service("CaptureService", ['DeviceService', function (DeviceService) {
        return {
            getCapture: function () {
                return navigator.device.capture;
            }
        };
    }])
    .service("CompassService", ['$q', '$log', function ($q, $log) {
        //http://cordova.apache.org/docs/en/3.3.0/cordova_compass_compass.md.html#Compass
        var service = {
            promiseCurrentHeading: function (compassOptions) {
                console.log('CompassService: current Heading');
                $log.debug('CompassService: current Heading');
                console.log('CompassService: after current Heading');
                var deferred = $q.defer();
                navigator.compass.getCurrentHeading(
                    function onSuccess(heading) {
                        deferred.resolve(heading);
                    },
                    function onError(error) {
                        deferred.resolve(error);
                    },
                    compassOptions);
                return deferred.promise;
            },
            compass: navigator.compass
        }
        return service;
    }])
    .service("ContactsService", function () {
        return navigator.contacts;
    })
    .service("DeviceService", function () {
        return {
            getDevice: function () {
                return window.device
            }
        }
    })
    .service("EventsService", ['$log', function ($log) {
        var bind = function (eventName, callback) {
            $log.debug('EventsService: binding event:' + eventName)
            window.addEventListener(eventName, callback, false);
        };

        var bindWrapper = function (callback) {
            bind(arguments.callee.name, callback);
        }

        var unbind = function (eventName, callback) {
            $log.debug('EventsService: unbinding event:' + eventName)
            window.removeEventListener(eventName, callback, false);
        };

        var unbindWrapper = function (callback) {
            bind(arguments.callee.name, callback);
        }

        var service = {
            bind: {
                deviceready: bindWrapper,
                pause: bindWrapper,
                resume: bindWrapper,
                online: bindWrapper,
                offline: bindWrapper,
                backbutton: bindWrapper,
                batterycritical: bindWrapper,
                batterylow: bindWrapper,
                batterystatus: bindWrapper,
                menubutton: bindWrapper,
                searchbutton: bindWrapper,
                startcallbutton: bindWrapper,
                endcallbutton: bindWrapper,
                volumedownbutton: bindWrapper,
                volumeupbutton: bindWrapper
            },
            unbind: {
                deviceready: unbindWrapper,
                pause: unbindWrapper,
                resume: unbindWrapper,
                online: unbindWrapper,
                offline: unbindWrapper,
                backbutton: unbindWrapper,
                batterycritical: unbindWrapper,
                batterylow: unbindWrapper,
                batterystatus: unbindWrapper,
                menubutton: unbindWrapper,
                searchbutton: unbindWrapper,
                startcallbutton: unbindWrapper,
                endcallbutton: unbindWrapper,
                volumedownbutton: unbindWrapper,
                volumeupbutton: unbindWrapper
            }};

        return service;
    }])
    .service("FileService", function () {
        return {};
    })
    .service("GeolocationService", ['$q', '$log', function ($q, $log) {

        var service = {
            promiseCurrentPosition: function (geolocationOptions) {
                var deferred = $q.defer();
                $log.debug("GeolocationService: promiseCurrentPosition" );
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        $log.debug("GeolocationService: success" );
                        deferred.resolve(position);
                    },
                    function (error) {
                        $log.debug("GeolocationService: error" );
                        deferred.reject(error);
                    },
                    geolocationOptions
                );

                $log.debug("GeolocationService: return promise" );
                return deferred.promise;
            },
            geolocation: navigator.geolocation
        }

        return service;
    }])
    .service("GlobalizationService", function () {
        return {};
    })
    .service("InAppBrowserService", function () {
        return {};
    })
    .service("MediaService", function () {
        return {};
    })
    .service("NotificationService", function () {
        return navigator.notification;
    })
    .service("StorageService", function () {
        return {};
    });
