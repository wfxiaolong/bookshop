define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('feeCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicPopup',
        function($scope, httpRequest, Storage, $state, $ionicPopup) {
        	$scope.getOrder = function() {
        		location.href = "#/feeDetail";
        	};

	        $scope.type = 1;
	        $scope.changeType = function(type) {
	        	$scope.type = type;
	        }
        }
    ]);

});
