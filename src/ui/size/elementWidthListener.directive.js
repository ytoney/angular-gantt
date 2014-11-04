'use strict';
gantt.directive('ganttElementWidthListener', [function() {
    // Updates the limit filters if the user scrolls the gantt chart

    return {
        restrict: 'A',
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            var scopeVariable = $attrs.ganttElementWidthListener;
            if (scopeVariable === '') {
                scopeVariable = 'ganttElementWidth';
            }

            var effectiveScope = $scope;

            while(scopeVariable.indexOf('$parent.') === 0) {
                scopeVariable = scopeVariable.substring('$parent.'.length);
                effectiveScope = $scope.$parent;
            }

            effectiveScope.$watch(function() {
                effectiveScope[scopeVariable] = $element[0].offsetWidth;
            });
        }]
    };
}]);
