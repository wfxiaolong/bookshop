define(['app'], function(app) {
    app.controller('settingAboutCtrl', ['$scope', 'httpRequest', function($scope, httpRequest) {
        $scope.$on("$ionicView.beforeEnter", function() {
            httpRequest.postWithUI($scope, '?method=website.about', {}, function(re) {
                if (re.data.state) {
                    $scope.content = re.data.data.content;
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        });
    }]);

});
