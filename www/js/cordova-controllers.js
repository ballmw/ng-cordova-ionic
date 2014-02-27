angular.module('cordova.controllers', ['ionic'])
    .controller('AccelerometerCtrl', ['$scope', 'AccelerometerService', function ($scope, AccelerometerService) {

    }])
    .controller('CameraCtrl', ['$scope', 'CameraService', '$log', '$timeout', function ($scope, CameraService, $log, $timeout) {
        $scope.images = [];
        var success = function (imageURI)
        {
            var images = [];
            images.push(imageURI);
            images = images.concat($scope.images);
            $scope.images = [];
            $timeout(function(){
                $scope.showSlider = true;
                $scope.images = $scope.images.concat(images);
            }, 100, true);

        };
        $scope.takePicture = function () {
            $log.debug('CameraCtrl: taking picture');
            $scope.showSlider = false;
            CameraService.take({ quality: 10,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: true })
                .then(success, function onFail(message) {

                });
        };

        $scope.rollPicture = function () {
            $log.debug('CameraCtrl: picture from roll');
            $scope.showSlider = false;
            CameraService.take({ quality: 10,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: true })
                .then(success, function onFail(message) {

                });
        };

    }])
    .controller('CaptureCtrl', ['$scope', 'CaptureService', function ($scope, CaptureService) {
        $scope.message = "";

        $scope.captureAudio = function () {
            CaptureService.getCapture().captureAudio({ limit: 3, duration: 10 }).then(function (mediaFiles) {
                $scope.message = "captured audio";
            }, function (error) {
                $scope.message = error;
            });
        }

        $scope.captureVideo = function () {
            CaptureService.getCapture().captureVideo({ limit: 3, duration: 10 }).then(function (mediaFiles) {
                $scope.message = "captured video";
            }, function (error) {
                $scope.message = error;
            });
        }

        $scope.captureImage = function () {
            CaptureService.getCapture().captureImage({ limit: 1 }).then(function (mediaFiles) {
                $scope.message = "captured image";
            }, function (error) {
                $scope.message = error;
            });
        }
    }])
    .controller('CompassCtrl', ['$scope', 'CompassService', function ($scope, CompassService) {
        $scope.heading = {};
        $scope.message = null;
        $scope.getCurrentHeading = function () {
            $scope.message = "Get Heading";
            CompassService.promiseCurrentHeading().then(
                function (heading) {
                    $scope.message = "Got Heading";
                    $scope.heading = heading;
                }, function (error) {
                    $scope.message = error;
                }
            )
        };

        $scope.watchHeading = function () {
            $scope.message = "Watch Heading";
            $scope.watching = CompassService.compass.watchHeading(function (heading) {
                    $scope.$apply(function () {
                        $scope.heading = heading;
                    });
                },
                function (error) {
                    $scope.$apply(function () {

                        $scope.heading = {};
                        $scope.message = error;
                    });
                }, {frequency: 500}
            )
        };

        $scope.stopWatchingHeading = function () {
            if ($scope.watching) {
                CompassService.compass.clearWatch($scope.watching);
                $scope.watching = null;
            }
        }

    }])
    .controller('ContactsCtrl', ['$scope', 'AccelerometerService', function ($scope, ContactsService) {
    }])
    .controller('DeviceCtrl', ['$scope', 'DeviceService', '$log', function ($scope, DeviceService, $log) {
        $log.debug('DeviceCtrl started');
        $scope.device = DeviceService.getDevice();
        $log.log($scope.device);
    }])
    .controller('EventsCtrl', ['$scope', 'EventsService', function ($scope, EventsService) {
    }])
    .controller('FileCtrl', ['$scope', 'FileService', function ($scope, FileService) {
    }])
    .controller('GeolocationCtrl', ['$scope', 'GeolocationService', function ($scope, GeolocationService) {
        $scope.heading = {};
        $scope.message = null;
        $scope.getCurrentPosition = function () {
            $scope.message = "Get Position";
            GeolocationService.promiseCurrentPosition().then(
                function (position) {
                    $scope.position = position;
                }, function (error) {
                    $sccope.message = error;
                }
            )
        };

        $scope.watchPosition = function () {
            $scope.message = "Watch Position";
            $scope.watching = GeolocationService.geolocation.watchPosition(function (position) {
                    $scope.$apply(function () {
                        $scope.position = position;
                    });

                },
                function (error) {
                    $scope.$apply(function () {
                        $scope.position = {};
                        $scope.message = error;
                    });
                }, { maximumAge: 1000, timeout: 5000, enableHighAccuracy: true }
            )
        };

        $scope.stopWatchingPosition = function () {
            if ($scope.watching) {
                GeolocationService.geolocation.clearWatch($scope.watching);
                $scope.watching = null;
            }
        }
    }])
    .controller('GlobalizationCtrl', ['$scope', 'GlobalizationService', function ($scope, GlobalizationService) {
    }])
    .controller('InAppBrowserCtrl', ['$scope', 'InAppBrowserService', function ($scope, InAppBrowserService) {
    }])
    .controller('NotificationCtrl', ['$scope', 'NotificationService', function ($scope, NotificationService) {
        $scope.message = "";

        $scope.alert = function () {
            var message = 'alert message';
            var alertCallback = function () {
                $scope.message = 'alert closed'
            };
            NotificationService.alert(message, alertCallback);//, [title], [buttonName])
        }
        $scope.confirm = function () {
            var message = 'confirm message';
            var confirmCallback = function () {
                $scope.message = 'callback confirmed';
            };
            NotificationService.confirm(message, confirmCallback);//, [title], [buttonLabels])
        }
        $scope.prompt = function () {
            var message = "prompt message";
            var promptCallback = function () {
                $scope.message = 'prompt closed'
            };
            NotificationService.prompt(message, promptCallback);//, [title], [buttonLabels], [defaultText])
        }
        $scope.beep = function () {
            var times = 2;
            NotificationService.beep(times);
        }
        $scope.vibrate = function () {
            var milliseconds = 500;
            NotificationService.vibrate(milliseconds);
        }
    }])
    .controller('EventsCtrl', ['$scope', 'EventsService', function ($scope, EventsService) {
    }])
;