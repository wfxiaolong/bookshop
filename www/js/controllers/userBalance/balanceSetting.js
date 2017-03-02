define(['app', 'js/utils/tips'], function(app,Tips) {
    app.controller('balanceSettingCtrl', ['$scope', 'Storage', 'httpRequest', '$state', function($scope, Storage, httpRequest, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
        	var phoneStatus = Storage.get('vrsm_auth').phone_status;
        	if (phoneStatus == 0) {
        		$scope.noBindPhone = true;
        		return;
        	}
            var purseStatus = $state.params.purseStatus;
            $scope.noPassword = (purseStatus == 0) ? true : false;
        });
    }]);

});
