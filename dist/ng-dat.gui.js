/**
 * @ngdoc overview
 * @module dat.gui
 * @name dat.gui
 * @description
 *
 * The Module.
 */
var module = angular.module('dat.gui', []);

/**
 * @ngdoc controller
 * @name dat.gui:DatGuiController
 * @module dat.gui
 * @description Controller for dat.GUI
 *
 * @property {boolean} hidden True if the GUI is hidden from the page.
 * @property {boolean} closed True if the GUI is collapsed.
 */
module.controller('DatGuiController', function DatGuiController() {});

/**
 * @ngdoc directive
 * @restrict E
 * @name dat.gui:datGui
 * @module dat.gui
 * @description Base element for dat.GUI
 *
 * @usage
 * <dat-gui>
 *   <dat-gui-control property-name="Wiehi">
 *     <input type="text"></input>
 *   </dat-gui-control>
 * </dat-gui>
 *
 * @property {boolean} hidden True if the GUI is hidden from the page.
 * @property {boolean} closed True if the GUI is collapsed.
 * @property {string} closedLabel Label for if the GUI is collapsed.
 * @property {string} openedLabel Label for if the GUI is open.
 */
module.directive('datGui', function() {
	return {
		restrict: 'E',
		transclude: true,
		controller: 'DatGuiController',
		controllerAs: 'datGui',
		bindToController: {
			hidden: '@',
			closed: '@'
		},
		scope: {
			closedLabel: '@',
			openedLabel: '@'
		},
		template: '<div class="main" style="-webkit-user-select: none; width: 245px; position: absolute; top: 0px; right: 20px;" ng-hide="datGui.hidden">\
		<ul ng-transclude ng-hide="datGui.closed"></ul>\
		<dat-gui-close-btn closed="datGui.closed" closed-label="closedLabel" opened-label="openedLabel"/>\
		</div>'
	}
});

/**
 * @ngdoc directive
 * @restrict EA
 * @name dat.gui:datGuiFolder
 * @module dat.gui
 * @description Folder within a menu.
 *
 * @usage
 * <dat-gui>
 *   <dat-gui-folder title="My Folder">
 *     <dat-gui-control property-name="Wiehi">
 *       <input type="text"></input>
 *     </dat-gui-control>
 *   </dat-gui-folder>
 * </dat-gui>
 *
 * @property {string} title Folder name that is displayed in the UI.
 */
module.directive('datGuiFolder', function() {
	return {
		restrict: 'EA',
		require: '^^datGui',
		scope: {
			title: "@"
		},
		transclude: true,
		template: '<li class="folder">' +
			'<div class="dg">' +
				'<ul ng-class="{ closed : closed }">' +
					'<li class="title" ng-bind="title" ng-click="closed = !closed"></li>' +
					'<ng-transclude></ng-transclude>' +
				'</ul>' +
			'</div>' +
		'</li>'
	}
});

/**
 * @ngdoc directive
 * @restrict EA
 * @name dat.gui:datGuiControl
 * @module dat.gui
 * @description Control within a menu.
 *
 * @usage
 * <dat-gui-control property-name="Wiehi">
 *   <input type="text"></input>
 * </dat-gui-control>
 *
 * @property {string} propertyName Name for the field that is displayed in the UI.
 * @property {string} type Type for the field that determines its default appearance.
 */
module.directive('datGuiControl', function() {
	return {
		restrict: 'EA',
		transclude: true,
		require: '^^datGui',
		scope: {
			propertyName: '@',
			type: '@'
		},
		template: '<li class="cr" ng-class="type">\
			<div>\
				<span class="property-name" ng-bind="propertyName"></span>\
				<div class="c" ng-transclude></div>\
			</div>\
		</li>',
		link: function(scope, element) {
			var elem;
			if (!scope.type) {
				if ((elem = element.find('dat-gui-slider')).length) {
					scope.type = 'number has-slider';
				}
				else if ((elem = element.find('input')).length) {
					scope.type = ({
						number: 'number',
						checkbox: 'boolean'
					})[elem.attr('type')];
				}
			}
			scope.type = scope.type || 'string';
		}
	}
});

/**
 * @ngdoc directive
 * @restrict E
 * @name dat.gui:datGuiCloseBtn
 * @module dat.gui
 * @description Close button for the GUI.
 *
 * @property {boolean} closed True if the GUI is collapsed.
 * @property {string} closedLabel Label for if the GUI is collapsed.
 * @property {string} openedLabel Label for if the GUI is open.
 */
module.directive('datGuiCloseBtn', function() {
	return {
		restrict: 'E',
		require: '^^datGui',
		scope: {
			closed: '=',
			closedLabel: '@',
			openedLabel: '@'
		},
		template: '<div class="close-button" ng-click="closed = !closed" \
			ng-bind="closed ? openedLabel || \'Open Controls\' : closedLabel || \'Close Controls\'"></div>',
		link: function(scope, elem) {
			var parentElem = elem.parent()[0];
			var width = parentElem.style.width || parentElem.getBoundingClientRect().width + "px";
			elem.find('div').css('width', width);
		}
	}
});

/**
 * @ngdoc directive
 * @restrict A
 * @name dat.gui:datGuiSlider
 * @module dat.gui
 * @description Slider element.
 *
 * @usage
 * <dat-gui-control property-name="Speed" ng-init="slider.value = 5.2">
 *   <dat-gui-slider ng-model="slider.value" min="0" max="50"/>
 * </dat-gui-control>
 *
 * @property {number} min Minimal value.
 * @property {number} max Maxmimal value.
 * @property {number} step Maxmimal value.
 * @property {*} ngModel Bound model value used for `ngModel`.
 */
module.directive('datGuiSlider', function() {
	return {
		restrict: 'A',
		transclude: true,
		scope: {
			min: '@',
			max: '@',
			step: '@',
			ngModel: '='
		},
		require: '^ngModel',
		template:
			'<div class="slider">' +
				'<div class="slider-fg" style="width: 100%;"></div>' +
			'</div>' +
			'<div>' +
				'<input type="number" ng-model="ngModel" min="{{min}}" max="{{max}}" step="{{step}}"/>' +
			'</div>' +
		'',
		link: function(scope, tElement, iAttrs, ngModel) {
			var slider = angular.element(tElement[0].getElementsByClassName('slider'));
			var sliderFg = angular.element(tElement[0].getElementsByClassName('slider-fg'));

			ngModel.$render = function() {
				var pct = (ngModel.$viewValue - scope.min) / scope.max * 100;
				sliderFg.css('width', pct+'%');
			};

			slider.on('mousedown', function onMouseDown() {
				var rect = slider[0].getBoundingClientRect();

				function onMouseDrag(event) {
					var pct = (event.clientX - rect.left) / rect.width * scope.max;
					pct = Math.min(scope.max, Math.max(scope.min, pct));
					pct = Math.round(pct);
					ngModel.$setViewValue(pct, event);
					ngModel.$render();
				}

				angular.element(window)
					.on('mousemove', onMouseDrag)
					.one('mouseup', function onMouseUp() {
						angular.element(window).off('mousemove', onMouseDrag);
					});
			})
		}
	}
});