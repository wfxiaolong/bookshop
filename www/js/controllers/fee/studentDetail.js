define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('studentDetailCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicPopup',
        function($scope, httpRequest, Storage, $state, $ionicPopup) {
           $scope.student = Storage.get("tmpStudent");

        }
    ]);

});
