define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('moduleClassifyCtrl', ['$scope', 'httpRequest', 'Storage', '$state',
        function($scope, httpRequest, Storage, $state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                //获取版块
                httpRequest.postWithUI($scope, '?method=cms.category', {type:2}, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        console.log(data);
                        $scope.categories = data;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });
        }
    ]);

});
