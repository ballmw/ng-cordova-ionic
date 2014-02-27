/*!
 * Copyright 2013 Drifty Co.
 * http://drifty.com/
 *
 * Ionic, v0.9.17
 * A powerful HTML5 mobile app framework.
 * http://ionicframework.com/
 *
 * By @maxlynch, @helloimben, @adamdbradley <3
 *
 * Licensed under the MIT license. Please see LICENSE for more information.
 *
 */;
/**
 * Create a wrapping module to ease having to include too many
 * modules.
 */
angular.module('ionic.service', [
  'ionic.service.platform',
  'ionic.service.actionSheet',
  'ionic.service.gesture',
  'ionic.service.loading',
  'ionic.service.modal',
  'ionic.service.popup',
  'ionic.service.templateLoad'
]);

angular.module('ionic.ui', [
                            'ionic.ui.content',
                            'ionic.ui.scroll',
                            'ionic.ui.tabs',
                            'ionic.ui.navRouter',
                            'ionic.ui.header',
                            'ionic.ui.sideMenu',
                            'ionic.ui.slideBox',
                            'ionic.ui.list',
                            'ionic.ui.checkbox',
                            'ionic.ui.toggle',
                            'ionic.ui.radio'
                           ]);

angular.module('ionic', [
    'ionic.service',
    'ionic.ui',
    
    // Angular deps
    'ngAnimate',
    'ngRoute',
    'ngTouch',
    'ngSanitize'
]);
;
angular.module('ionic.service.actionSheet', ['ionic.service.templateLoad', 'ionic.ui.actionSheet', 'ngAnimate'])

.factory('ActionSheet', ['$rootScope', '$document', '$compile', '$animate', '$timeout', 'TemplateLoader',
    function($rootScope, $document, $compile, $animate, $timeout, TemplateLoader) {

  return {
    /**
     * Load an action sheet with the given template string.
     *
     * A new isolated scope will be created for the 
     * action sheet and the new element will be appended into the body.
     *
     * @param {object} opts the options for this ActionSheet (see docs)
     */
    show: function(opts) {
      var scope = $rootScope.$new(true);

      angular.extend(scope, opts);


      // Compile the template
      var element = $compile('<action-sheet buttons="buttons"></action-sheet>')(scope);

      // Grab the sheet element for animation
      var sheetEl = angular.element(element[0].querySelector('.action-sheet'));

      var hideSheet = function(didCancel) {
        $animate.leave(sheetEl, function() {
          if(didCancel) {
            opts.cancel();
          }
        });
        
        $animate.removeClass(element, 'active', function() {
          scope.$destroy();
        });
      };

      scope.cancel = function() {
        hideSheet(true);
      };

      scope.buttonClicked = function(index) {
        // Check if the button click event returned true, which means
        // we can close the action sheet
        if((opts.buttonClicked && opts.buttonClicked(index)) === true) {
          hideSheet(false);
        }
      };

      scope.destructiveButtonClicked = function() {
        // Check if the destructive button click event returned true, which means
        // we can close the action sheet
        if((opts.destructiveButtonClicked && opts.destructiveButtonClicked()) === true) {
          hideSheet(false);
        }
      };

      $document[0].body.appendChild(element[0]);

      var sheet = new ionic.views.ActionSheet({el: element[0] });
      scope.sheet = sheet;

      $animate.addClass(element, 'active');
      $animate.enter(sheetEl, element, null, function() {
      });

      return sheet;
    }
  };

}]);
;
angular.module('ionic.service.gesture', [])

.factory('Gesture', [function() {
  return {
    on: function(eventType, cb, $element) {
      return window.ionic.onGesture(eventType, cb, $element[0]);
    },
    off: function(gesture, eventType, cb) {
      return window.ionic.offGesture(gesture, eventType, cb);
    }
  };
}]);
;
angular.module('ionic.service.loading', ['ionic.ui.loading'])

.factory('Loading', ['$rootScope', '$document', '$compile', function($rootScope, $document, $compile) {
  return {
    /**
     * Load an action sheet with the given template string.
     *
     * A new isolated scope will be created for the 
     * action sheet and the new element will be appended into the body.
     *
     * @param {object} opts the options for this ActionSheet (see docs)
     */
    show: function(opts) {
      var defaults = {
        content: '',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 2000
      };

      opts = angular.extend(defaults, opts);

      var scope = $rootScope.$new(true);
      angular.extend(scope, opts);

      // Make sure there is only one loading element on the page at one point in time
      var existing = angular.element($document[0].querySelector('.loading-backdrop'));
      if(existing.length) {
        scope = existing.scope();
        if(scope.loading) {
          scope.loading.show();
          return scope.loading;
        }
      }

      // Compile the template
      var element = $compile('<loading>' + opts.content + '</loading>')(scope);

      $document[0].body.appendChild(element[0]);

      var loading = new ionic.views.Loading({
        el: element[0],
        maxWidth: opts.maxWidth,
        showDelay: opts.showDelay
      });

      loading.show();

      scope.loading = loading;

      return loading;
    }
  };
}]);
;
angular.module('ionic.service.modal', ['ionic.service.templateLoad', 'ngAnimate'])


.factory('Modal', ['$rootScope', '$document', '$compile', '$animate', '$q', 'TemplateLoader', function($rootScope, $document, $compile, $animate, $q, TemplateLoader) {
  var ModalView = ionic.views.Modal.inherit({
    initialize: function(opts) {
      ionic.views.Modal.prototype.initialize.call(this, opts);
      this.animation = opts.animation || 'slide-in-up';
    },
    // Show the modal
    show: function() {
      var _this = this;
      var element = angular.element(this.el);
      if(!element.parent().length) {
        angular.element($document[0].body).append(element);
        ionic.views.Modal.prototype.show.call(_this);
      }
      $animate.addClass(element, this.animation, function() {
      });
    },
    // Hide the modal
    hide: function() {
      var element = angular.element(this.el);
      $animate.removeClass(element, this.animation);

      ionic.views.Modal.prototype.hide.call(this);
    },

    // Remove and destroy the modal scope
    remove: function() {
      var element = angular.element(this.el);
      $animate.leave(angular.element(this.el), function() {
        scope.$destroy();
      });
    }
  });

  var createModal = function(templateString, options) {
    // Create a new scope for the modal
    var scope = options.scope && options.scope.$new() || $rootScope.$new(true);

    // Compile the template
    var element = $compile(templateString)(scope);

    options.el = element[0];
    var modal = new ModalView(options);

    modal.scope = scope;

    // If this wasn't a defined scope, we can assign 'modal' to the isolated scope
    // we created
    if(!options.scope) {
      scope.modal = modal;
    }

    return modal;
  };

  return {
    /**
     * Load a modal with the given template string.
     *
     * A new isolated scope will be created for the 
     * modal and the new element will be appended into the body.
     */
    fromTemplate: function(templateString, options) {
      var modal = createModal(templateString, options || {});
      return modal;
    },
    fromTemplateUrl: function(url, cb, options) {
      TemplateLoader.load(url).then(function(templateString) {
        var modal = createModal(templateString, options || {});
        cb(modal);
      });
    },
  };
}]);
;
(function() {
'use strict';

angular.module('ionic.service.platform', [])

/**
 * The platformProvider makes it easy to set and detect which platform
 * the app is currently running on. It has some auto detection built in
 * for PhoneGap and Cordova. This provider also takes care of
 * initializing some defaults that depend on the platform, such as the
 * height of header bars on iOS 7.
 */
.provider('Platform', function() {
  var platform = 'web';
  var isPlatformReady = false;

  if(window.cordova || window.PhoneGap || window.phonegap) {
    platform = 'cordova';
  }

  var isReady = function() {
    if(platform == 'cordova') {
      return window.device || window.Cordova;
    }
    return true;
  };

  // We need to do some stuff as soon as we know the platform,
  // like adjust header margins for iOS 7, etc.
  setTimeout(function afterReadyWait() {
    if(isReady()) {
      ionic.Platform.detect();
    } else {
      setTimeout(afterReadyWait, 50);
    }
  }, 10);




  return {
    setPlatform: function(p) {
      platform = p;
    },
    $get: ['$q', '$timeout', function($q, $timeout) {
      return {
        /**
         * Some platforms have hardware back buttons, so this is one way to bind to it.
         *
         * @param {function} cb the callback to trigger when this event occurs
         */
        onHardwareBackButton: function(cb) {
          this.ready(function() {
            document.addEventListener('backbutton', cb, false);
          });
        },

        /**
         * Remove an event listener for the backbutton.
         *
         * @param {function} fn the listener function that was originally bound.
         */
        offHardwareBackButton: function(fn) {
          this.ready(function() {
            document.removeEventListener('backbutton', fn);
          });
        },

        /**
         * Trigger a callback once the device is ready, or immediately if the device is already
         * ready.
         */
        ready: function(cb) {
          var self = this;
          var q = $q.defer();

          $timeout(function readyWait() {
            if(isReady()) {
              isPlatformReady = true;
              q.resolve();
              cb();
            } else {
              $timeout(readyWait, 50);
            }
          }, 50);

          return q.promise;
        }
      };
    }]
  };
});

})(ionic);
;
angular.module('ionic.service.popup', ['ionic.service.templateLoad'])


.factory('Popup', ['$rootScope', '$document', '$compile', 'TemplateLoader', function($rootScope, $document, $compile, TemplateLoader) {

  var getPopup = function() {
    // Make sure there is only one loading element on the page at one point in time
    var existing = angular.element($document[0].querySelector('.popup'));
    if(existing.length) {
      var scope = existing.scope();
      if(scope.popup) {
        return scope;
      }
    }
  };

  return {
    alert: function(message, $scope) {

      // If there is an existing popup, just show that one
      var existing = getPopup();
      if(existing) {
        return existing.popup.alert(message);
      }

      var defaults = {
        title: message,
        animation: 'fade-in',
      };

      opts = angular.extend(defaults, opts);

      var scope = $scope && $scope.$new() || $rootScope.$new(true);
      angular.extend(scope, opts);

      // Compile the template
      var element = $compile('<popup>' + opts.content + '</popup>')(scope);
      $document[0].body.appendChild(element[0]);

      var popup = new ionic.views.Popup({el: element[0] });
      popup.alert(message);

      scope.popup = popup;

      return popup;
    },
    confirm: function(cb) {
    },
    prompt: function(cb) {
    },
    show: function(data) {
      // data.title
      // data.template
      // data.buttons
    }
  };
}]);
;
angular.module('ionic.service.templateLoad', [])

.factory('TemplateLoader', ['$q', '$http', '$templateCache', function($q, $http, $templateCache) {
  return {
    load: function(url) {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: url,
        cache: $templateCache
      }).success(function(html) {
        deferred.resolve(html && html.trim());
      }).error(function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }
  };
}]);
;
(function() {
'use strict';

angular.module('ionic.ui.actionSheet', [])

.directive('actionSheet', ['$document', function($document) {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    link: function($scope, $element){
      var keyUp = function(e) {
        if(e.which == 27) {
          $scope.cancel();
          $scope.$apply();
        }
      };

      var backdropClick = function(e) {
        if(e.target == $element[0]) {
          $scope.cancel();
          $scope.$apply();
        }
      };
      $scope.$on('$destroy', function() {
        $element.remove();
        $document.unbind('keyup', keyUp);
      });

      $document.bind('keyup', keyUp);
      $element.bind('click', backdropClick);
    },
    template: '<div class="action-sheet-backdrop">' +
                '<div class="action-sheet action-sheet-up">' +
                  '<div class="action-sheet-group">' +
                    '<div class="action-sheet-title" ng-if="titleText">{{titleText}}</div>' +
                    '<button class="button" ng-click="buttonClicked($index)" ng-repeat="button in buttons">{{button.text}}</button>' +
                  '</div>' +
                  '<div class="action-sheet-group" ng-if="destructiveText">' +
                    '<button class="button destructive" ng-click="destructiveButtonClicked()">{{destructiveText}}</button>' +
                  '</div>' +
                  '<div class="action-sheet-group" ng-if="cancelText">' +
                    '<button class="button" ng-click="cancel()">{{cancelText}}</button>' +
                  '</div>' +
                '</div>' +
              '</div>'
  };
}]);

})();
;
(function(ionic) {
'use strict';

angular.module('ionic.ui.header', ['ngAnimate'])


.directive('headerBar', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<header class="bar bar-header">\
                <div class="buttons">\
                  <button ng-repeat="button in leftButtons" class="button no-animation" ng-class="button.type" ng-click="button.tap($event, $index)" ng-bind-html="button.content">\
                  </button>\
                </div>\
                <h1 class="title" ng-bind-html="title"></h1>\
                <div class="buttons">\
                  <button ng-repeat="button in rightButtons" class="button no-animation" ng-class="button.type" ng-click="button.tap($event, $index)" ng-bind-html="button.content">\
                  </button>\
                </div>\
              </header>',

    scope: {
      leftButtons: '=',
      rightButtons: '=',
      title: '=',
      type: '@',
      alignTitle: '@'
    },

    link: function($scope, $element, $attr) {
      var hb = new ionic.views.HeaderBar({
        el: $element[0],
        alignTitle: $scope.alignTitle || 'center'
      });

      $element.addClass($scope.type);

      $scope.headerBarView = hb;

      $scope.$watch('leftButtons', function(val) {
        // Resize the title since the buttons have changed
        hb.align();
      });

      $scope.$watch('rightButtons', function(val) {
        console.log('Right buttons changed');
        // Resize the title since the buttons have changed
        hb.align();
      });

      $scope.$watch('title', function(val) {
        // Resize the title since the title has changed
        hb.align();
      });
    }
  };
})

.directive('footerBar', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<footer class="bar bar-footer" ng-transclude>\
              </footer>',

    scope: {
      type: '@',
    },

    link: function($scope, $element, $attr) {
      $element.addClass($scope.type);
    }
  };
});

})(ionic);
;
(function() {
'use strict';

angular.module('ionic.ui.checkbox', [])


.directive('checkbox', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {},
    transclude: true,
    template: '<li class="item item-checkbox">\
                <label class="checkbox">\
                  <input type="checkbox">\
                </label>\
                <div class="item-content" ng-transclude>\
                </div>\
              </li>',

    link: function($scope, $element, $attr, ngModel) {
      var checkbox;

      if(!ngModel) { return; }

      checkbox = angular.element($element[0].querySelector('input[type="checkbox"]'));

      if(!checkbox.length) { return; }

      checkbox.bind('change', function(e) {
        ngModel.$setViewValue(checkbox[0].checked);
        $scope.$apply(function() {
          e.alreadyHandled = true;
        });
      });

      if(ngModel) {
        ngModel.$render = function() {
          checkbox[0].checked = ngModel.$viewValue;
        };
      }
    }
  };
});

})();
;
(function() {
'use strict';

angular.module('ionic.ui.content', [])

/**
 * Panel is a simple 100% width and height, fixed panel. It's meant for content to be
 * added to it, or animated around.
 */
.directive('pane', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      element.addClass('pane');
    }
  };
})

// The content directive is a core scrollable content area
// that is part of many View hierarchies
.directive('content', ['$parse', '$timeout', function($parse, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="scroll-content"></div>',
    transclude: true,
    scope: {
      onRefresh: '&',
      onRefreshOpening: '&',
      onScroll: '&',
      onScrollComplete: '&',
      refreshComplete: '=',
      scroll: '@',
      hasScrollX: '@',
      hasScrollY: '@',
      scrollbarX: '@',
      scrollbarY: '@',
      scrollEventInterval: '@'
    },
    compile: function(element, attr, transclude) {
      return function($scope, $element, $attr) {
        var clone, sc, sv,
          addedPadding = false,
          c = $element.eq(0);

        if(attr.hasHeader == "true") { c.addClass('has-header'); }
        if(attr.hasSubheader == "true") { c.addClass('has-subheader'); }
        if(attr.hasFooter == "true") { c.addClass('has-footer'); }
        if(attr.hasTabs == "true") { c.addClass('has-tabs'); }

        // If they want plain overflow scrolling, add that as a class
        if($scope.scroll === "false") {
          clone = transclude($scope.$parent);
          $element.append(clone);
        } else if(attr.overflowScroll === "true") {
          c.addClass('overflow-scroll');
          clone = transclude($scope.$parent);
          $element.append(clone);
        } else {
          sc = document.createElement('div');
          sc.className = 'scroll';
          if(attr.padding == "true") {
            sc.className += ' padding';
            addedPadding = true;
          }
          $element.append(sc);

          // Pass the parent scope down to the child
          clone = transclude($scope.$parent);
          angular.element($element[0].firstElementChild).append(clone);

          var refresher = $element[0].querySelector('.scroll-refresher');
          var refresherHeight = refresher && refresher.clientHeight || 0;

          if(attr.refreshComplete) {
            $scope.refreshComplete = function() {
              if($scope.scrollView) {
                refresher && refresher.classList.remove('active');
                $scope.scrollView.finishPullToRefresh();
                $scope.$parent.$broadcast('scroll.onRefreshComplete');
              }
            };
          }


          // Otherwise, supercharge this baby!
          $timeout(function() {
            sv = new ionic.views.Scroll({
              el: $element[0],
              scrollbarX: $scope.$eval($scope.scrollbarX) !== false,
              scrollbarY: $scope.$eval($scope.scrollbarY) !== false,
              scrollingX: $scope.$eval($scope.hasScrollX) === true,
              scrollingY: $scope.$eval($scope.hasScrollY) !== false,
              scrollEventInterval: parseInt($scope.scrollEventInterval, 10) || 20,
              scrollingComplete: function() {
                $scope.onScrollComplete({
                  scrollTop: this.__scrollTop,
                  scrollLeft: this.__scrollLeft
                });
              }
            });

            // Activate pull-to-refresh
            if(refresher) {
              sv.activatePullToRefresh(50, function() {
                refresher.classList.add('active');
              }, function() {
                refresher.classList.remove('refreshing');
                refresher.classList.remove('active');
              }, function() {
                refresher.classList.add('refreshing');
                $scope.onRefresh();
                $scope.$parent.$broadcast('scroll.onRefresh');
              });
            }

            $element.bind('scroll', function(e) {
              $scope.onScroll({
                event: e,
                scrollTop: e.detail ? e.detail.scrollTop : e.originalEvent ? e.originalEvent.detail.scrollTop : 0,
                scrollLeft: e.detail ? e.detail.scrollLeft: e.originalEvent ? e.originalEvent.detail.scrollLeft : 0
              });
            });

            $scope.$parent.$on('scroll.resize', function(e) {
              // Run the resize after this digest
              $timeout(function() {
                sv && sv.resize();
              });
            });

            $scope.$parent.$on('scroll.refreshComplete', function(e) {
              sv && sv.finishPullToRefresh();
            });
            
            // Let child scopes access this 
            $scope.$parent.scrollView = sv;
          });



        }

        // if padding attribute is true, then add padding if it wasn't added to the .scroll
        if(attr.padding == "true" && !addedPadding) {
          c.addClass('padding');
        }

      };
    }
  };
}])

.directive('refresher', function() {
  return {
    restrict: 'E',
    replace: true,
    require: ['^?content', '^?list'],
    template: '<div class="scroll-refresher"><div class="ionic-refresher-content"><i class="icon ion-arrow-down-c icon-pulling"></i><i class="icon ion-loading-d icon-refreshing"></i></div></div>',
    scope: true
  };
})

.directive('scrollRefresher', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<div class="scroll-refresher"><div class="scroll-refresher-content" ng-transclude></div></div>'
  };
});


})();
;
(function() {
'use strict';

angular.module('ionic.ui.list', ['ngAnimate'])

.directive('item', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    require: '?^list',
    replace: true,
    transclude: true,

    scope: {
      item: '=',
      itemType: '@',
      canDelete: '@',
      canReorder: '@',
      canSwipe: '@',
      onDelete: '&',
      optionButtons: '&',
      deleteIcon: '@',
      reorderIcon: '@'
    },

    template: '<div class="item item-complex" ng-class="itemClass">\
            <div class="item-edit" ng-if="deleteClick !== undefined">\
              <button class="button button-icon icon" ng-class="deleteIconClass" ng-click="deleteClick()"></button>\
            </div>\
            <a class="item-content" ng-href="{{ href }}" ng-transclude></a>\
            <div class="item-drag" ng-if="reorderIconClass !== undefined">\
              <button data-ionic-action="reorder" class="button button-icon icon" ng-class="reorderIconClass"></button>\
            </div>\
            <div class="item-options" ng-if="itemOptionButtons">\
             <button ng-click="b.onTap(item, b)" class="button" ng-class="b.type" ng-repeat="b in itemOptionButtons" ng-bind="b.text"></button>\
           </div>\
          </div>',

    link: function($scope, $element, $attr, list) {
      if(!list) return;
      
      var $parentScope = list.scope;
      var $parentAttrs = list.attrs;

      $attr.$observe('href', function(value) {
        if(value) $scope.href = value.trim();
      });

      // Set this item's class, first from the item directive attr, and then the list attr if item not set
      $scope.itemClass = $scope.itemType || $parentScope.itemType;

      // Decide if this item can do stuff, and follow a certain priority 
      // depending on where the value comes from
      if(($attr.canDelete ? $scope.canDelete : $parentScope.canDelete) !== "false") {
        if($attr.onDelete || $parentAttrs.onDelete) {

          // only assign this method when we need to
          // and use its existence to decide if the delete should show or not
          $scope.deleteClick = function() {
            if($attr.onDelete) {
              // this item has an on-delete attribute
              $scope.onDelete({ item: $scope.item });
            } else if($parentAttrs.onDelete) {
              // run the parent list's onDelete method
              // if it doesn't exist nothing will happen
              $parentScope.onDelete({ item: $scope.item });
            }
          };

          // Set which icons to use for deleting
          $scope.deleteIconClass = $scope.deleteIcon || $parentScope.deleteIcon || 'ion-minus-circled';
        }
      }

      // set the reorder Icon Class only if the item or list set can-reorder="true"
      if(($attr.canReorder ? $scope.canReorder : $parentScope.canReorder) === "true") {
        $scope.reorderIconClass = $scope.reorderIcon || $parentScope.reorderIcon || 'ion-navicon';
      }

      // Set the option buttons which can be revealed by swiping to the left
      // if canSwipe was set to false don't even bother
      if(($attr.canSwipe ? $scope.canSwipe : $parentScope.canSwipe) !== "false") {
        $scope.itemOptionButtons = $scope.optionButtons();
        if(typeof $scope.itemOptionButtons === "undefined") {
          $scope.itemOptionButtons = $parentScope.optionButtons();
        }
      }

    }
  };
}])

.directive('list', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,

    scope: {
      itemType: '@',
      canDelete: '@',
      canReorder: '@',
      canSwipe: '@',
      showDelete: '=',
      showReorder: '=',
      onDelete: '&',
      onReorder: '&',
      optionButtons: '&',
      deleteIcon: '@',
      reorderIcon: '@'
    },

    template: '<div class="list" ng-class="{\'list-editing\': showDelete, \'list-reordering\': showReorder}" ng-transclude></div>',

    controller: function($scope, $attrs) {
      this.scope = $scope;
      this.attrs = $attrs;
    },

    link: function($scope, $element, $attr) {
      $scope.listView = new ionic.views.ListView({
        el: $element[0],
        listEl: $element[0].children[0]
      });

      if($attr.animation) {
        $element[0].classList.add($attr.animation);
      }

      var destroyShowReorderWatch = $scope.$watch('showReorder', function(val) {
        if(val) {
          $element[0].classList.add('item-options-hide');
        } else if(val === false) {
          // false checking is because it could be undefined
          // if its undefined then we don't care to do anything
          $timeout(function(){
            $element[0].classList.remove('item-options-hide');
          }, 250);
        }
      });

      $scope.$on('$destroy', function () {
        destroyShowReorderWatch();
      });

    }
  };
}]);

})();
;
(function() {
'use strict';

angular.module('ionic.ui.loading', [])

.directive('loading', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    link: function($scope, $element){
      $element.addClass($scope.animation || '');
    },
    template: '<div class="loading-backdrop" ng-class="{enabled: showBackdrop}">' + 
                '<div class="loading" ng-transclude>' +
                '</div>' +
              '</div>'
  };
});

})();
;
(function() {
'use strict';

/**
 * @description
 * The NavController is a navigation stack View Controller modelled off of 
 * UINavigationController from Cocoa Touch. With the Nav Controller, you can
 * "push" new "pages" on to the navigation stack, and then pop them off to go
 * back. The NavController controls a navigation bar with a back button and title
 * which updates as the pages switch.
 *
 * The NavController makes sure to not recycle scopes of old pages
 * so that a pop will still show the same state that the user left.
 *
 * However, once a page is popped, its scope is destroyed and will have to be
 * recreated then next time it is pushed.
 *
 */

var actualLocation = null;

angular.module('ionic.ui.navRouter', ['ionic.service.gesture'])

.run(['$rootScope', function($rootScope) {
  $rootScope.stackCursorPosition = 0;
}])

.directive('navRouter', ['$rootScope', '$timeout', '$location', '$window', '$route', function($rootScope, $timeout, $location, $window, $route) {
  return {
    restrict: 'AC',
    // So you can require being under this
    controller: ['$scope', '$element', function($scope, $element) {
      this.navBar = {
        isVisible: true
      };
      $scope.navController = this;

      this.goBack = function() {
        $scope.direction = 'back';
      };
    }],

    link: function($scope, $element, $attr, ctrl) {
      if(!$element.length) return;

      $scope.animation = $attr.animation;

      $element[0].classList.add('noop-animation');

      var isFirst = true;
      // Store whether we did an animation yet, to know if
      // we should let the first state animate
      var didAnimate = false;

      var initTransition = function() {
        //$element.addClass($scope.animation);
      };

      var reverseTransition = function() {
        $element[0].classList.remove('noop-animation');
        $element[0].classList.add($scope.animation);
        $element[0].classList.add('reverse');
      };

      var forwardTransition = function() {
        $element[0].classList.remove('noop-animation');
        $element[0].classList.remove('reverse');
        $element[0].classList.add($scope.animation);
      };

      $scope.$on('$routeChangeSuccess', function(e, a) {
      });
      $scope.$on('$routeChangeStart', function(e, next, current) {
        var back, historyState = $window.history.state;

        back = $scope.direction == 'back' || (!!(historyState && historyState.position <= $rootScope.stackCursorPosition));

        if(isFirst || (next && next.$$route && next.$$route.originalPath === "")) {
          // Don't animate
          isFirst = false;
          return;
        }

        if(didAnimate || $rootScope.stackCursorPosition > 0) {
          didAnimate = true;
          if(back) {
            reverseTransition();
          } else {
            forwardTransition();
          }
        }
      });

      $scope.$on('$locationChangeSuccess', function(a, b, c) {
        // Store the new location
        $rootScope.actualLocation = $location.path();
        if(isFirst && $location.path() !== '/') {
          isFirst = false;
        }
      });  

      $scope.$on('navRouter.goBack', function(e) {
        ctrl.goBack();
      });


      // Keep track of location changes and update a stack pointer that tracks whether we are
      // going forwards or back
      $scope.$watch(function () { return $location.path(); }, function (newLocation, oldLocation) {
        if($rootScope.actualLocation === newLocation) {
          if(oldLocation === '') {// || newLocation == '/') {
            // initial route, skip this
            return;
          }

          var back, historyState = $window.history.state;

          back = $scope.direction == 'back' || (!!(historyState && historyState.position <= $rootScope.stackCursorPosition));

          if (back) {
            //back button
            $rootScope.stackCursorPosition--;
          } else {
            //forward button
            $rootScope.stackCursorPosition++;
          }
           
          $scope.direction = 'forwards';

        } else {
          var currentRouteBeforeChange = $route.current;

          if (currentRouteBeforeChange) {

            $window.history.replaceState({
              position: $rootScope.stackCursorPosition
            });

            $rootScope.stackCursorPosition++;
          }
        }
      });
    }
  };
}])

/**
 * Our Nav Bar directive which updates as the controller state changes.
 */
.directive('navBar', ['$rootScope', '$animate', '$compile', function($rootScope, $animate, $compile) {

  /**
   * Perform an animation between one tab bar state and the next.
   * Right now this just animates the titles.
   */
  var animate = function($scope, $element, oldTitle, data, cb) {
    var title, nTitle, oTitle, titles = $element[0].querySelectorAll('.title');

    var newTitle = data.title;
    if(!oldTitle || oldTitle === newTitle) {
      cb();
      return;
    }

    // Clone the old title and add a new one so we can show two animating in and out
    // add ng-leave and ng-enter during creation to prevent flickering when they are swapped during animation
    title = angular.element(titles[0]);
    oTitle = $compile('<h1 class="title ng-leave" ng-bind="oldTitle"></h1>')($scope);
    title.replaceWith(oTitle);
    nTitle = $compile('<h1 class="title ng-enter" ng-bind="currentTitle"></h1>')($scope);

    var insert = $element[0].firstElementChild || null;

    // Insert the new title
    $animate.enter(nTitle, $element, insert && angular.element(insert), function() {
      cb();
    });

    // Remove the old title
    $animate.leave(angular.element(oTitle), function() {
    });
  };

  return {
    restrict: 'E',
    require: '^navRouter',
    replace: true,
    scope: {
      type: '@',
      backButtonType: '@',
      backButtonLabel: '@',
      backButtonIcon: '@',
      alignTitle: '@'
    },
    template: '<header class="bar bar-header nav-bar" ng-class="{invisible: !navController.navBar.isVisible}">' + 
        '<div class="buttons"> ' +
          '<button nav-back class="button" ng-if="enableBackButton && showBackButton" ng-class="backButtonClass" ng-bind-html="backButtonLabel"></button>' +
          '<button ng-click="button.tap($event)" ng-repeat="button in leftButtons" class="button no-animation {{button.type}}" ng-bind-html="button.content"></button>' + 
        '</div>' +
        '<h1 class="title" ng-bind="currentTitle"></h1>' + 
        '<div class="buttons" ng-if="rightButtons.length"> ' +
          '<button ng-click="button.tap($event)" ng-repeat="button in rightButtons" class="button no-animation {{button.type}}" ng-bind-html="button.content"></button>' + 
        '</div>' +
      '</header>',
    link: function($scope, $element, $attr, navCtrl) {
      var backButton;

      $element.addClass($attr.animation);

      // Create the back button content and show/hide it based on scope settings
      $scope.enableBackButton = true;
      $scope.backButtonClass = $attr.backButtonType;
      if($attr.backButtonIcon) {
        $scope.backButtonClass += ' icon ' + $attr.backButtonIcon;
      }

      // Listen for changes in the stack cursor position to indicate whether a back
      // button should be shown (this can still be disabled by the $scope.enableBackButton
      $rootScope.$watch('stackCursorPosition', function(value) {
        if(value > 0) {
          $scope.showBackButton = true;
        } else {
          $scope.showBackButton = false;
        }
      });

      // Store a reference to our nav controller
      $scope.navController = navCtrl;

      // Initialize our header bar view which will handle resizing and aligning our title labels
      var hb = new ionic.views.HeaderBar({
        el: $element[0],
        alignTitle: $scope.alignTitle || 'center'
      });
      $scope.headerBarView = hb;

      // Add the type of header bar class to this element
      $element.addClass($scope.type);

      var updateHeaderData = function(data) {
        var oldTitle = $scope.currentTitle;
        $scope.oldTitle = oldTitle;

        if(typeof data.title !== 'undefined') {
          $scope.currentTitle = data.title;
        }

        $scope.leftButtons = data.leftButtons;
        $scope.rightButtons = data.rightButtons;

        if(typeof data.hideBackButton !== 'undefined') {
          $scope.enableBackButton = data.hideBackButton !== true;
        }

        if(data.animate !== false && typeof data.title !== 'undefined') {
          animate($scope, $element, oldTitle, data, function() {
            hb.align();
          });
        } else {
          hb.align();
        }
      };

      $scope.$parent.$on('navRouter.showBackButton', function(e, data) {
        $scope.enableBackButton = true;
      });

      $scope.$parent.$on('navRouter.hideBackButton', function(e, data) {
        $scope.enableBackButton = false;
      });

      // Listen for changes on title change, and update the title
      $scope.$parent.$on('navRouter.pageChanged', function(e, data) {
        updateHeaderData(data);
      });

      $scope.$parent.$on('navRouter.pageShown', function(e, data) {
        updateHeaderData(data);
      });

      $scope.$parent.$on('navRouter.titleChanged', function(e, data) {
        var oldTitle = $scope.currentTitle;
        $scope.oldTitle = oldTitle;

         if(typeof data.title !== 'undefined') {
          $scope.currentTitle = data.title;
        }

        if(data.animate !== false && typeof data.title !== 'undefined') {
          animate($scope, $element, oldTitle, data, function() {
            hb.align();
          });
        } else {
          hb.align();
        }
      });

      // If a nav page changes the left or right buttons, update our scope vars
      $scope.$parent.$on('navRouter.leftButtonsChanged', function(e, data) {
        $scope.leftButtons = data;
      });
      $scope.$parent.$on('navRouter.rightButtonsChanged', function(e, data) {
        $scope.rightButtons = data;
      });

      /*
      $scope.$parent.$on('navigation.push', function() {
        backButton = angular.element($element[0].querySelector('.button'));
        backButton.addClass($scope.backButtonType);
        hb.align();
      });
      $scope.$parent.$on('navigation.pop', function() {
        hb.align();
      });
      */

      $scope.$on('$destroy', function() {
        //
      });
    }
  };
}])

.directive('navPage', ['$parse', function($parse) {
  return {
    restrict: 'E',
    require: '^navRouter',
    scope: {
      leftButtons: '=',
      rightButtons: '=',
      title: '=',
      icon: '@',
      iconOn: '@',
      iconOff: '@',
      type: '@',
      alignTitle: '@',
      hideBackButton: '@',
      hideNavBar: '@',
      animate: '@',
    },
    link: function($scope, $element, $attr, navCtrl) {
      $element.addClass('pane');

      // Should we hide a back button when this tab is shown
      $scope.hideBackButton = $scope.$eval($scope.hideBackButton);

      $scope.hideNavBar = $scope.$eval($scope.hideNavBar);

      navCtrl.navBar.isVisible = !$scope.hideNavBar;

      if($scope.hideBackButton === true) {
        $scope.$emit('navRouter.hideBackButton');
      } else {
        $scope.$emit('navRouter.showBackButton');
      }

      // Whether we should animate on tab change, also impacts whether we
      // tell any parent nav controller to animate
      $scope.animate = $scope.$eval($scope.animate);
        

      // watch for changes in the left buttons
      $scope.$watch('leftButtons', function(value) {
        $scope.$emit('navRouter.leftButtonsChanged', $scope.leftButtons);
      });

      $scope.$watch('rightButtons', function(val) {
        $scope.$emit('navRouter.rightButtonsChanged', $scope.rightButtons);
      });

      /*
      $scope.$watch('hideBackButton', function(value) {
        if(value === true) {
          navCtrl.hideBackButton();
        } else {
          navCtrl.showBackButton();
        }
      });
      */

      // watch for changes in the title
      $scope.$watch('title', function(value) {
        $scope.$emit('navRouter.titleChanged', {
          title: value,
          animate: $scope.animate
        });
      });
    }
  };
}])

.directive('navBack', ['$window', '$rootScope', 'Gesture', function($window, $rootScope, Gesture) {
  return {
    restrict: 'AC',
    link: function($scope, $element, $attr, navCtrl) {
      var goBack = function(e) {
        // Only trigger back if the stack is greater than zero
        if($rootScope.stackCursorPosition > 0) {
          $window.history.back();

          // Fallback for bad history supporting devices
          $scope.$emit('navRouter.goBack');
        }
        e.alreadyHandled = true;
        return false;
      };
      $element.bind('click', goBack);
    }
  };
}]);

})();
;
(function(ionic) {
'use strict';

angular.module('ionic.ui.radio', [])

// The radio button is a radio powered element with only
// one possible selection in a set of options.
.directive('radio', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {
      value: '@'
    },
    transclude: true,
    template: '<label class="item item-radio">\
                <input type="radio" name="radio-group">\
                <div class="item-content" ng-transclude>\
                </div>\
                <i class="radio-icon icon ion-checkmark"></i>\
              </label>',

    link: function($scope, $element, $attr, ngModel) {
      var radio;

      if(!ngModel) { return; }

      radio = $element.children().eq(0);

      if(!radio.length) { return; }

      if(ngModel) {
        radio.bind('click', function(e) {
          console.log('RADIO CLICK');
          $scope.$apply(function() {
            ngModel.$setViewValue($scope.$eval($attr.ngValue));
          });
          e.alreadyHandled = true;
        });

        ngModel.$render = function() {
          var val = $scope.$eval($attr.ngValue);
          if(val === ngModel.$viewValue) {
            radio.attr('checked', 'checked');
          } else {
            radio.removeAttr('checked');
          }
        };
      }
    }
  };
})

// The radio button is a radio powered element with only
// one possible selection in a set of options.
.directive('radioButtons', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {
      value: '@'
    },
    transclude: true,
    template: '<div class="button-bar button-bar-inline" ng-transclude></div>',

    controller: ['$scope', '$element', function($scope, $element) {

      this.select = function(element) {
        var c, children = $element.children();
        for(var i = 0; i < children.length; i++) {
          c = children[i];
          if(c != element[0]) {
            c.classList.remove('active');
          }
        }
      };

    }],

    link: function($scope, $element, $attr, ngModel) {
      var radio;

      if(ngModel) {
        //$element.bind('tap', tapHandler);

        ngModel.$render = function() {
          var children = $element.children();
          for(var i = 0; i < children.length; i++) {
            children[i].classList.remove('active');
          }
          $scope.$parent.$broadcast('radioButton.select', ngModel.$viewValue);
        };
      }
    }
  };
})

.directive('buttonRadio', function() {
  return {
    restrict: 'CA',
    require: ['?^ngModel', '?^radioButtons'],
    link: function($scope, $element, $attr, ctrls) {
      var ngModel = ctrls[0];
      var radioButtons = ctrls[1];
      if(!ngModel || !radioButtons) { return; }

      var setIt = function() {
        console.log('SET');
        $element.addClass('active');
        ngModel.$setViewValue($scope.$eval($attr.ngValue));

        radioButtons.select($element);
      };

      var clickHandler = function(e) {
        console.log('CLICK');
        setIt();
      };

      $scope.$on('radioButton.select', function(e, val) {
        if(val == $scope.$eval($attr.ngValue)) {
          $element.addClass('active');
        }
      });
        
      ionic.on('tap', clickHandler, $element[0]);

      $scope.$on('$destroy', function() {
        ionic.off('tap', clickHandler);
      });
    }
  };
});

})(window.ionic);
;
(function() {
'use strict';

angular.module('ionic.ui.scroll', [])

.directive('scroll', ['$parse', '$timeout', function($parse, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="scroll-view"></div>',
    transclude: true,
    scope: {
      direction: '@',
      paging: '@',
      onRefresh: '&',
      onScroll: '&',
      refreshComplete: '=',
      scroll: '@',
      scrollbarX: '@',
      scrollbarY: '@',
    },

    controller: function() {},

    compile: function(element, attr, transclude) {
      return function($scope, $element, $attr) {
        var clone, sv, sc = document.createElement('div');

        // Create the internal scroll div
        sc.className = 'scroll';
        if(attr.padding == "true") {
          sc.classList.add('padding');
          addedPadding = true;
        }
        if($scope.$eval($scope.paging) === true) {
          sc.classList.add('scroll-paging');
        }
        $element.append(sc);

        // Pass the parent scope down to the child
        clone = transclude($scope.$parent);
        angular.element($element[0].firstElementChild).append(clone);

        // Get refresher size
        var refresher = $element[0].querySelector('.scroll-refresher');
        var refresherHeight = refresher && refresher.clientHeight || 0;

        if(!$scope.direction) { $scope.direction = 'y'; }
        var hasScrollingX = $scope.direction.indexOf('x') >= 0;
        var hasScrollingY = $scope.direction.indexOf('y') >= 0;

        $timeout(function() {
          var options = {
            el: $element[0],
            paging: $scope.$eval($scope.paging) === true,
            scrollbarX: $scope.$eval($scope.scrollbarX) !== false,
            scrollbarY: $scope.$eval($scope.scrollbarY) !== false,
            scrollingX: hasScrollingX,
            scrollingY: hasScrollingY
          };

          if(options.paging) {
            options.speedMultiplier = 0.8;
            options.bouncing = false;
          }

          sv = new ionic.views.Scroll(options);

          // Activate pull-to-refresh
          if(refresher) {
            sv.activatePullToRefresh(refresherHeight, function() {
              refresher.classList.add('active');
            }, function() {
              refresher.classList.remove('refreshing');
              refresher.classList.remove('active');
            }, function() {
              refresher.classList.add('refreshing');
              $scope.onRefresh();
              $scope.$parent.$broadcast('scroll.onRefresh');
            });
          }

          $element.bind('scroll', function(e) {
            $scope.onScroll({
              event: e,
              scrollTop: e.detail ? e.detail.scrollTop : e.originalEvent ? e.originalEvent.detail.scrollTop : 0,
              scrollLeft: e.detail ? e.detail.scrollLeft: e.originalEvent ? e.originalEvent.detail.scrollLeft : 0
            });
          });

          $scope.$parent.$on('scroll.resize', function(e) {
            // Run the resize after this digest
            $timeout(function() {
              sv && sv.resize();
            });
          });

          $scope.$parent.$on('scroll.refreshComplete', function(e) {
            sv && sv.finishPullToRefresh();
          });
          
          // Let child scopes access this 
          $scope.$parent.scrollView = sv;
        });
      };
    }
  };
}]);

})();
;
(function() {
'use strict';

/**
 * @description
 * The sideMenuCtrl lets you quickly have a draggable side
 * left and/or right menu, which a center content area.
 */

angular.module('ionic.ui.sideMenu', ['ionic.service.gesture'])

/**
 * The internal controller for the side menu controller. This
 * extends our core Ionic side menu controller and exposes
 * some side menu stuff on the current scope.
 */

.directive('sideMenus', function() {
  return {
    restrict: 'ECA',
    controller: ['$scope', function($scope) {
      var _this = this;

      angular.extend(this, ionic.controllers.SideMenuController.prototype);

      ionic.controllers.SideMenuController.call(this, {
        // Our quick implementation of the left side menu
        left: {
          width: 275,
        },

        // Our quick implementation of the right side menu
        right: {
          width: 275,
        }
      });

      $scope.sideMenuContentTranslateX = 0;

      $scope.sideMenuController = this;
    }],
    replace: true,
    transclude: true,
    template: '<div class="pane" ng-transclude></div>'
  };
})

.directive('sideMenuContent', ['$timeout', 'Gesture', function($timeout, Gesture) {
  return {
    restrict: 'AC',
    require: '^sideMenus',
    scope: true,
    compile: function(element, attr, transclude) {
      return function($scope, $element, $attr, sideMenuCtrl) {

        $element.addClass('menu-content');

        $scope.dragContent = $scope.$eval($attr.dragContent) === false ? false : true;

        var defaultPrevented = false;
        var isDragging = false;

        ionic.on('mousedown', function(e) {
          // If the child element prevented the drag, don't drag
          defaultPrevented = e.defaultPrevented;
        });

        // Listen for taps on the content to close the menu
        /*
        ionic.on('tap', function(e) {
          sideMenuCtrl.close();
        }, $element[0]);
        */

        var dragFn = function(e) {
          if($scope.dragContent) {
            if(defaultPrevented) {
              return;
            }
            isDragging = true;
            sideMenuCtrl._handleDrag(e);
            e.gesture.srcEvent.preventDefault();
          }
        };

        var dragVertFn = function(e) {
          if(isDragging) {
            e.gesture.srcEvent.preventDefault();
          }
        };

        //var dragGesture = Gesture.on('drag', dragFn, $element);
        var dragRightGesture = Gesture.on('dragright', dragFn, $element);
        var dragLeftGesture = Gesture.on('dragleft', dragFn, $element);
        var dragUpGesture = Gesture.on('dragup', dragVertFn, $element);
        var dragDownGesture = Gesture.on('dragdown', dragVertFn, $element);

        var dragReleaseFn = function(e) {
          isDragging = false;
          if(!defaultPrevented) {
            sideMenuCtrl._endDrag(e);
          }
          defaultPrevented = false;
        };

        var releaseGesture = Gesture.on('release', dragReleaseFn, $element);

        sideMenuCtrl.setContent({
          onDrag: function(e) {},
          endDrag: function(e) {},
          getTranslateX: function() {
            return $scope.sideMenuContentTranslateX || 0;
          },
          setTranslateX: function(amount) {
            $element[0].style.webkitTransform = 'translate3d(' + amount + 'px, 0, 0)';
            $timeout(function() {
              $scope.sideMenuContentTranslateX = amount;
            });
          },
          enableAnimation: function() {
            //this.el.classList.add(this.animateClass);
            $scope.animationEnabled = true;
            $element[0].classList.add('menu-animated');
          },
          disableAnimation: function() {
            //this.el.classList.remove(this.animateClass);
            $scope.animationEnabled = false;
            $element[0].classList.remove('menu-animated');
          }
        });

        // Cleanup
        $scope.$on('$destroy', function() {
          Gesture.off(dragLeftGesture, 'dragleft', dragFn);
          Gesture.off(dragRightGesture, 'dragright', dragFn);
          Gesture.off(dragUpGesture, 'dragup', dragFn);
          Gesture.off(dragDownGesture, 'dragdown', dragFn);
          Gesture.off(releaseGesture, 'release', dragReleaseFn);
        });
      };
    }
  };
}])


.directive('sideMenu', function() {
  return {
    restrict: 'E',
    require: '^sideMenus',
    replace: true,
    transclude: true,
    scope: true,
    template: '<div class="menu menu-{{side}}"></div>',
    compile: function(element, attr, transclude) {
      return function($scope, $element, $attr, sideMenuCtrl) {
        $scope.side = $attr.side;

        if($scope.side == 'left') {
          sideMenuCtrl.left.isEnabled = true;
          sideMenuCtrl.left.pushDown = function() {
            $element[0].style.zIndex = -1;
          };
          sideMenuCtrl.left.bringUp = function() {
            $element[0].style.zIndex = 0;
          };
        } else if($scope.side == 'right') {
          sideMenuCtrl.right.isEnabled = true;
          sideMenuCtrl.right.pushDown = function() {
            $element[0].style.zIndex = -1;
          };
          sideMenuCtrl.right.bringUp = function() {
            $element[0].style.zIndex = 0;
          };
        }

        $element.append(transclude($scope));
      };
    }
  };
});
})();
;
(function() {
'use strict';

/**
 * @description
 * The sideMenuCtrl lets you quickly have a draggable side
 * left and/or right menu, which a center content area.
 */

angular.module('ionic.ui.slideBox', [])

/**
 * The internal controller for the side menu controller. This
 * extends our core Ionic side menu controller and exposes
 * some side menu stuff on the current scope.
 */

.directive('slideBox', ['$timeout', '$compile', function($timeout, $compile) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      doesContinue: '@',
      showPager: '@',
      onSlideChanged: '&'
    },
    controller: ['$scope', '$element', function($scope, $element) {
      var _this = this;

      var slider = new ionic.views.Slider({
        el: $element[0],
        continuous: $scope.$eval($scope.doesContinue) === true,
        slidesChanged: function() {
          $scope.currentSlide = slider.getPos();

          // Try to trigger a digest
          $timeout(function() {});
        },
        callback: function(slideIndex) {
          $scope.currentSlide = slideIndex;
          $scope.onSlideChanged({index:$scope.currentSlide});
          $scope.$parent.$broadcast('slideBox.slideChanged', slideIndex);

          // Try to trigger a digest
          $timeout(function() {});
        }
      });

      $scope.$on('slideBox.nextSlide', function() {
        slider.next();
      });

      $scope.$on('slideBox.prevSlide', function() {
        slider.prev();
      });

      $scope.$on('slideBox.setSlide', function(e, index) {
        slider.slide(index);
      });

      $scope.slideBox = slider;

      $timeout(function() {
        slider.load();
      });
    }],
    template: '<div class="slider">\
            <div class="slider-slides" ng-transclude>\
            </div>\
          </div>',

    link: function($scope, $element, $attr, slideBoxCtrl) {
      // If the pager should show, append it to the slide box
      if($scope.$eval($scope.showPager) !== false) {
        var childScope = $scope.$new();
        var pager = angular.element('<pager></pager>');
        $element.append(pager);
        $compile(pager)(childScope);
      }
    }
  };
}])

.directive('slide', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '^slideBox',
    transclude: true,
    template: '<div class="slider-slide" ng-transclude></div>',
    compile: function(element, attr, transclude) {
      return function($scope, $element, $attr, slideBoxCtrl) {
      };
    }
  };
})

.directive('pager', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '^slideBox',
    template: '<div class="slider-pager"><span class="slider-pager-page" ng-repeat="slide in numSlides() track by $index" ng-class="{active: $index == currentSlide}"><i class="icon ion-record"></i></span></div>',
    link: function($scope, $element, $attr, slideBox) {
      var selectPage = function(index) {
        var children = $element[0].children;
        var length = children.length;
        for(var i = 0; i < length; i++) {
          if(i == index) {
            children[i].classList.add('active');
          } else {
            children[i].classList.remove('active');
          }
        }
      };

      $scope.numSlides = function() {
        return new Array($scope.slideBox.getNumSlides());
      };

      $scope.$watch('currentSlide', function(v) {
        console.log('Current slide', v);
        selectPage(v);
      });
    }
  };

});

})();
;
angular.module('ionic.ui.tabs', ['ngAnimate'])

/**
 * @description
 *
 * The Tab Controller renders a set of pages that switch based on taps
 * on a tab bar. Modelled off of UITabBarController.
 */

.directive('tabs', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    transclude: true,
    controller: ['$scope', '$element', '$animate', function($scope, $element, $animate) {
      var _this = this;

      angular.extend(this, ionic.controllers.TabBarController.prototype);

      ionic.controllers.TabBarController.call(this, {
        controllerChanged: function(oldC, oldI, newC, newI) {
          $scope.controllerChanged && $scope.controllerChanged({
            oldController: oldC,
            oldIndex: oldI,
            newController: newC,
            newIndex: newI
          });
        },
        tabBar: {
          tryTabSelect: function() {},
          setSelectedItem: function(index) {},
          addItem: function(item) {}
        }
      });

      this.add = function(controller) {
        this.addController(controller);
        this.select(0);
      };

      this.select = function(controllerIndex) {
        $scope.activeAnimation = $scope.animation;
        _this.selectController(controllerIndex);
      };

      $scope.controllers = this.controllers;

      $scope.tabsController = this;
    }],
    //templateUrl: 'ext/angular/tmpl/ionicTabBar.tmpl.html',
    template: '<div class="view"><tab-controller-bar></tab-controller-bar></div>',
    compile: function(element, attr, transclude, tabsCtrl) {
      return function($scope, $element, $attr) {
        var tabs = $element[0].querySelector('.tabs');

        $scope.tabsType = $attr.tabsType || 'tabs-positive';
        $scope.tabsStyle = $attr.tabsStyle;
        $scope.animation = $attr.animation;

        $scope.animateNav = $scope.$eval($attr.animateNav);
        if($scope.animateNav !== false) {
          $scope.animateNav = true;
        }

        $attr.$observe('tabsStyle', function(val) {
          if(tabs) {
            angular.element(tabs).addClass($attr.tabsStyle);
          }
        });

        $attr.$observe('tabsType', function(val) {
          if(tabs) {
            angular.element(tabs).addClass($attr.tabsType);
          }
        });

        $scope.$watch('activeAnimation', function(value) {
          //$element.removeClass($scope.animation + ' ' + $scope.animation + '-reverse');
          $element.addClass($scope.activeAnimation);
        });
        transclude($scope, function(cloned) {
          $element.prepend(cloned);
        });
      };
    }
  };
})

// Generic controller directive
.directive('tab', ['$animate', '$parse', function($animate, $parse) {
  return {
    restrict: 'E',
    require: '^tabs',
    scope: true,
    transclude: 'element',
    compile: function(element, attr, transclude) {
      return function($scope, $element, $attr, tabsCtrl) {
        var childScope, childElement;

        $scope.title = $attr.title;
        $scope.icon = $attr.icon;
        $scope.iconOn = $attr.iconOn;
        $scope.iconOff = $attr.iconOff;

        // Should we hide a back button when this tab is shown
        $scope.hideBackButton = $scope.$eval($attr.hideBackButton);

        if($scope.hideBackButton !== true) {
          $scope.hideBackButton = false;
        }

        // Whether we should animate on tab change, also impacts whether we
        // tell any parent nav controller to animate
        $scope.animate = $scope.$eval($attr.animate);

        // Grab whether we should update any parent nav router on tab changes
        $scope.doesUpdateNavRouter = $scope.$eval($attr.doesUpdateNavRouter);
        if($scope.doesUpdateNavRouter !== false) {
          $scope.doesUpdateNavRouter = true;
        }

        var leftButtonsGet = $parse($attr.leftButtons);
        $scope.$watch(leftButtonsGet, function(value) {
          $scope.leftButtons = value;
          if($scope.doesUpdateNavRouter) {
            $scope.$emit('navRouter.leftButtonsChanged', $scope.rightButtons);
          }
        });

        var rightButtonsGet = $parse($attr.rightButtons);
        $scope.$watch(rightButtonsGet, function(value) {
          $scope.rightButtons = value;
        });

        tabsCtrl.add($scope);
        
        $scope.$watch('isVisible', function(value) {
          if(childElement) {
            $animate.leave(childElement);
            $scope.$broadcast('tab.hidden');
            childElement = undefined;
          }
          if(childScope) {
            childScope.$destroy();
            childScope = undefined;
          }
          if(value) {
            childScope = $scope.$new();
            transclude(childScope, function(clone) {
              childElement = clone;

              clone.addClass('pane');

              $animate.enter(clone, $element.parent(), $element);

              if($scope.title) {
                // Send the title up in case we are inside of a nav controller
                if($scope.doesUpdateNavRouter) {
                  $scope.$emit('navRouter.pageShown', {
                    title: $scope.title,
                    rightButtons: $scope.rightButtons,
                    leftButtons: $scope.leftButtons,
                    hideBackButton: $scope.hideBackButton,
                    animate: $scope.animateNav
                  });
                }
                //$scope.$emit('navRouter.titleChanged', $scope.title);
              }
              $scope.$broadcast('tab.shown');
            });
          }
        });
      };
    }
  };
}])


.directive('tabControllerBar', function() {
  return {
    restrict: 'E',
    require: '^tabs',
    transclude: true,
    replace: true,
    scope: true,
    template: '<div class="tabs">' + 
      '<tab-controller-item title="{{controller.title}}" icon="{{controller.icon}}" icon-on="{{controller.iconOn}}" icon-off="{{controller.iconOff}}" active="controller.isVisible" index="$index" ng-repeat="controller in controllers"></tab-controller-item>' + 
    '</div>',
    link: function($scope, $element, $attr, tabsCtrl) {
      $element.addClass($scope.tabsType);
      $element.addClass($scope.tabsStyle);
    }
  };
})

.directive('tabControllerItem', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '^tabs',
    scope: {
      title: '@',
      icon: '@',
      iconOn: '@',
      iconOff: '@',
      active: '=',
      tabSelected: '@',
      index: '='
    },
    link: function(scope, element, attrs, tabsCtrl) {
      if(attrs.icon) {
        scope.iconOn = scope.iconOff = attrs.icon;
      }
      scope.selectTab = function(index) {
        tabsCtrl.select(scope.index);
      };
    },
    template: 
      '<a ng-class="{active:active}" ng-click="selectTab()" class="tab-item">' +
        '<i class="{{icon}}" ng-if="icon"></i>' +
        '<i class="{{iconOn}}" ng-if="active"></i>' +
        '<i class="{{iconOff}}" ng-if="!active"></i> {{title}}' +
      '</a>'
  };
})

.directive('tabBar', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<div class="tabs tabs-primary" ng-transclude>' + 
    '</div>'
  };
});

;
(function(ionic) {
'use strict';

angular.module('ionic.ui.toggle', [])

// The Toggle directive is a toggle switch that can be tapped to change
// its value
.directive('toggle', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {},
    template: '<div ng-click="toggleIt($event)" class="toggle" skip-tap-poly><input type="checkbox"><div class="track"><div class="handle"></div></div></div>',

    link: function($scope, $element, $attr, ngModel) {
      var checkbox, handle;

      if(!ngModel) { return; }

      checkbox = $element.children().eq(0);
      handle = $element.children().eq(1);

      if(!checkbox.length || !handle.length) { return; }

      $scope.toggle = new ionic.views.Toggle({ 
        el: $element[0],
        checkbox: checkbox[0],
        handle: handle[0]
      });

      $scope.toggleIt = function(e) {
        $scope.toggle.tap(e);
        ngModel.$setViewValue(checkbox[0].checked);
      };

      ngModel.$render = function() {
        $scope.toggle.val(ngModel.$viewValue);
      };
    }
  };
});

})(window.ionic);
;
(function() {
'use strict';

angular.module('ionic.ui.virtRepeat', [])

.directive('virtRepeat', function() {
  return {
    require: ['?ngModel', '^virtualList'],
    transclude: 'element',
    priority: 1000,
    terminal: true,
    compile: function(element, attr, transclude) {
      return function($scope, $element, $attr, ctrls) {
        var virtualList = ctrls[1];

        virtualList.listView.renderViewport = function(high, low, start, end) {
        };
      };
    }
  };
});
})(ionic);
;

(function() {
'use strict';

// Turn the expression supplied to the directive:
//
//     a in b
//
// into `{ value: "a", collection: "b" }`
function parseRepeatExpression(expression){
  var match = expression.match(/^\s*([\$\w]+)\s+in\s+(\S*)\s*$/);
  if (! match) {
    throw new Error("Expected sfVirtualRepeat in form of '_item_ in _collection_' but got '" +
                    expression + "'.");
  }
  return {
    value: match[1],
    collection: match[2]
  };
}

// Utility to filter out elements by tag name
function isTagNameInList(element, list){
  var t, tag = element.tagName.toUpperCase();
  for( t = 0; t < list.length; t++ ){
    if( list[t] === tag ){
      return true;
    }
  }
  return false;
}


// Utility to find the viewport/content elements given the start element:
function findViewportAndContent(startElement){
  /*jshint eqeqeq:false, curly:false */
  var root = $rootElement[0];
  var e, n;
  // Somewhere between the grandparent and the root node
  for( e = startElement.parent().parent()[0]; e !== root; e = e.parentNode ){
    // is an element
    if( e.nodeType != 1 ) break;
    // that isn't in the blacklist (tables etc.),
    if( isTagNameInList(e, DONT_WORK_AS_VIEWPORTS) ) continue;
    // has a single child element (the content),
    if( e.childElementCount != 1 ) continue;
    // which is not in the blacklist
    if( isTagNameInList(e.firstElementChild, DONT_WORK_AS_CONTENT) ) continue;
    // and no text.
    for( n = e.firstChild; n; n = n.nextSibling ){
      if( n.nodeType == 3 && /\S/g.test(n.textContent) ){
        break;
      }
    }
    if( n === null ){
      // That element should work as a viewport.
      return {
        viewport: angular.element(e),
        content: angular.element(e.firstElementChild)
      };
    }
  }
  throw new Error("No suitable viewport element");
}

// Apply explicit height and overflow styles to the viewport element.
//
// If the viewport has a max-height (inherited or otherwise), set max-height.
// Otherwise, set height from the current computed value or use
// window.innerHeight as a fallback
//
function setViewportCss(viewport){
  var viewportCss = {'overflow': 'auto'},
      style = window.getComputedStyle ?
        window.getComputedStyle(viewport[0]) :
        viewport[0].currentStyle,
      maxHeight = style && style.getPropertyValue('max-height'),
      height = style && style.getPropertyValue('height');

  if( maxHeight && maxHeight !== '0px' ){
    viewportCss.maxHeight = maxHeight;
  }else if( height && height !== '0px' ){
    viewportCss.height = height;
  }else{
    viewportCss.height = window.innerHeight;
  }
  viewport.css(viewportCss);
}

// Apply explicit styles to the content element to prevent pesky padding
// or borders messing with our calculations:
function setContentCss(content){
  var contentCss = {
    margin: 0,
    padding: 0,
    border: 0,
    'box-sizing': 'border-box'
  };
  content.css(contentCss);
}

// TODO: compute outerHeight (padding + border unless box-sizing is border)
function computeRowHeight(element){
  var style = window.getComputedStyle ? window.getComputedStyle(element)
                                      : element.currentStyle,
      maxHeight = style && style.getPropertyValue('max-height'),
      height = style && style.getPropertyValue('height');

  if( height && height !== '0px' && height !== 'auto' ){
    $log.info('Row height is "%s" from css height', height);
  }else if( maxHeight && maxHeight !== '0px' && maxHeight !== 'none' ){
    height = maxHeight;
    $log.info('Row height is "%s" from css max-height', height);
  }else if( element.clientHeight ){
    height = element.clientHeight+'px';
    $log.info('Row height is "%s" from client height', height);
  }else{
    throw new Error("Unable to compute height of row");
  }
  angular.element(element).css('height', height);
  return parseInt(height, 10);
}

angular.module('ionic.ui.virtualRepeat', [])

/**
 * A replacement for ng-repeat that supports virtual lists.
 * This is not a 1 to 1 replacement for ng-repeat. However, in situations
 * where you have huge lists, this repeater will work with our virtual
 * scrolling to only render items that are showing or will be showing
 * if a scroll is made.
 */
.directive('virtualRepeat', ['$log', function($log) {
    return {
      require: ['?ngModel, ^virtualList'],
      transclude: 'element',
      priority: 1000,
      terminal: true,
      compile: function(element, attr, transclude) {
        var ident = parseRepeatExpression(attr.sfVirtualRepeat);

        return function(scope, iterStartElement, attrs, ctrls, b) {
          var virtualList = ctrls[1];

          var rendered = [];
          var rowHeight = 0;
          var sticky = false;

          var dom = virtualList.element;
          //var dom = findViewportAndContent(iterStartElement);

          // The list structure is controlled by a few simple (visible) variables:
          var state = 'ngModel' in attrs ? scope.$eval(attrs.ngModel) : {};

          function makeNewScope (idx, collection, containerScope) {
            var childScope = containerScope.$new();
            childScope[ident.value] = collection[idx];
            childScope.$index = idx;
            childScope.$first = (idx === 0);
            childScope.$last = (idx === (collection.length - 1));
            childScope.$middle = !(childScope.$first || childScope.$last);
            childScope.$watch(function updateChildScopeItem(){
              childScope[ident.value] = collection[idx];
            });
            return childScope;
          }

          // Given the collection and a start and end point, add the current
          function addElements (start, end, collection, containerScope, insPoint) {
            var frag = document.createDocumentFragment();
            var newElements = [], element, idx, childScope;
            for( idx = start; idx !== end; idx ++ ){
              childScope = makeNewScope(idx, collection, containerScope);
              element = linker(childScope, angular.noop);
              //setElementCss(element);
              newElements.push(element);
              frag.appendChild(element[0]);
            }
            insPoint.after(frag);
            return newElements;
          }

          function recomputeActive() {
            // We want to set the start to the low water mark unless the current
            // start is already between the low and high water marks.
            var start = clip(state.firstActive, state.firstVisible - state.lowWater, state.firstVisible - state.highWater);
            // Similarly for the end
            var end = clip(state.firstActive + state.active,
                           state.firstVisible + state.visible + state.lowWater,
                           state.firstVisible + state.visible + state.highWater );
            state.firstActive = Math.max(0, start);
            state.active = Math.min(end, state.total) - state.firstActive;
          }

          function sfVirtualRepeatOnScroll(evt){
            if( !rowHeight ){
              return;
            }
            // Enter the angular world for the state change to take effect.
            scope.$apply(function(){
              state.firstVisible = Math.floor(evt.target.scrollTop / rowHeight);
              state.visible = Math.ceil(dom.viewport[0].clientHeight / rowHeight);
              $log.log('scroll to row %o', state.firstVisible);
              sticky = evt.target.scrollTop + evt.target.clientHeight >= evt.target.scrollHeight;
              recomputeActive();
              $log.log(' state is now %o', state);
              $log.log(' sticky = %o', sticky);
            });
          }

          function sfVirtualRepeatWatchExpression(scope){
            var coll = scope.$eval(ident.collection);
            if( coll.length !== state.total ){
              state.total = coll.length;
              recomputeActive();
            }
            return {
              start: state.firstActive,
              active: state.active,
              len: coll.length
            };
          }

          function destroyActiveElements (action, count) {
            var dead, ii, remover = Array.prototype[action];
            for( ii = 0; ii < count; ii++ ){
              dead = remover.call(rendered);
              dead.scope().$destroy();
              dead.remove();
            }
          }

          // When the watch expression for the repeat changes, we may need to add
          // and remove scopes and elements
          function sfVirtualRepeatListener(newValue, oldValue, scope){
            var oldEnd = oldValue.start + oldValue.active,
                collection = scope.$eval(ident.collection),
                newElements;
            if(newValue === oldValue) {
              $log.info('initial listen');
              newElements = addElements(newValue.start, oldEnd, collection, scope, iterStartElement);
              rendered = newElements;
              if(rendered.length) {
                rowHeight = computeRowHeight(newElements[0][0]);
              }
            } else {
              var newEnd = newValue.start + newValue.active;
              var forward = newValue.start >= oldValue.start;
              var delta = forward ? newValue.start - oldValue.start
                                  : oldValue.start - newValue.start;
              var endDelta = newEnd >= oldEnd ? newEnd - oldEnd : oldEnd - newEnd;
              var contiguous = delta < (forward ? oldValue.active : newValue.active);
              $log.info('change by %o,%o rows %s', delta, endDelta, forward ? 'forward' : 'backward');
              if(!contiguous) {
                $log.info('non-contiguous change');
                destroyActiveElements('pop', rendered.length);
                rendered = addElements(newValue.start, newEnd, collection, scope, iterStartElement);
              } else {
                if(forward) {
                  $log.info('need to remove from the top');
                  destroyActiveElements('shift', delta);
                } else if(delta) {
                  $log.info('need to add at the top');
                  newElements = addElements(
                    newValue.start,
                    oldValue.start,
                    collection, scope, iterStartElement);
                  rendered = newElements.concat(rendered);
                }

                if(newEnd < oldEnd) {
                  $log.info('need to remove from the bottom');
                  destroyActiveElements('pop', oldEnd - newEnd);
                } else if(endDelta) {
                  var lastElement = rendered[rendered.length-1];
                  $log.info('need to add to the bottom');
                  newElements = addElements(
                    oldEnd,
                    newEnd,
                    collection, scope, lastElement);
                  rendered = rendered.concat(newElements);
                }
              }
              if(!rowHeight && rendered.length) {
                rowHeight = computeRowHeight(rendered[0][0]);
              }
              dom.content.css({'padding-top': newValue.start * rowHeight + 'px'});
            }
            dom.content.css({'height': newValue.len * rowHeight + 'px'});
            if(sticky) {
              dom.viewport[0].scrollTop = dom.viewport[0].clientHeight + dom.viewport[0].scrollHeight;
            }
          }

          //  - The index of the first active element
          state.firstActive = 0;
          //  - The index of the first visible element
          state.firstVisible = 0;
          //  - The number of elements visible in the viewport.
          state.visible = 0;
          // - The number of active elements
          state.active = 0;
          // - The total number of elements
          state.total = 0;
          // - The point at which we add new elements
          state.lowWater = state.lowWater || 100;
          // - The point at which we remove old elements
          state.highWater = state.highWater || 300;
          // TODO: now watch the water marks

          setContentCss(dom.content);
          setViewportCss(dom.viewport);
          // When the user scrolls, we move the `state.firstActive`
          dom.bind('momentumScrolled', sfVirtualRepeatOnScroll);

          scope.$on('$destroy', function () {
            dom.unbind('momentumScrolled', sfVirtualRepeatOnScroll);
          });

          // The watch on the collection is just a watch on the length of the
          // collection. We don't care if the content changes.
          scope.$watch(sfVirtualRepeatWatchExpression, sfVirtualRepeatListener, true);
        };
      }
    };
  }]);

})(ionic);
