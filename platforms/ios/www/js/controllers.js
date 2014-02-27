angular.module('starter.controllers', ['ionic'])

    .controller('AppCtrl', function ($scope) {
        // Main app controller, empty for the example
    })

// A simple controller that fetches a list of data
    .controller('AppTabCtrl', ['$scope', 'TabStateService', function ($scope) {
        $scope.$on('tab.shown', function () {
        });
        $scope.$on('tab.hidden', function () {

        });
    }])
    .controller('CordovaTabCtrl', ['$scope', 'TabStateService', function ($scope, TabStateService) {
        $scope.$on('tab.shown', function () {
        });
        $scope.$on('tab.hidden', function () {

        });
    }])
    .controller('AboutTabCtrl', ['$scope', 'TabStateService', function ($scope, TabStateService) {
        $scope.$on('tab.shown', function () {
        });
        $scope.$on('tab.hidden', function () {
        });
    }]);
