define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('positionCtrl', ['$scope','$rootScope', 'httpRequest', 'Storage', '$state', '$ionicHistory', '$http', function($scope,$rootScope,httpRequest, Storage, $state, $ionicHistory, $http) {
        $scope.city_json = [];
        $scope.type = 0;

        $http({
            url:'data/city.json',
            method:'GET'
        }).success(function(data,header,config,status){
            $scope.city_json = data;
        });

        $scope.changeType = function(){
            $ionicHistory.goBack();
        }
    }]);
});
