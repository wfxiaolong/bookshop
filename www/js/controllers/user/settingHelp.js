define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('settingHelpCtrl', ['$scope', 'httpRequest', function($scope, httpRequest) {
        $scope.$on("$ionicView.beforeEnter", function() {
            httpRequest.postWithUI($scope, '?method=website.help', {}, function(re) {
                if (re.data.state) {
                    $scope.content = re.data.data.content;
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        });
    }]);

});
