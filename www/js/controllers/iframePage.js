define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('iframePageCtrl', ['$scope', 'httpRequest', '$state', '$sce', function($scope, httpRequest, $state, $sce) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var url = $state.params.url;
            $scope.myURL = $sce.trustAsResourceUrl(url);
        });
    }]);

});
