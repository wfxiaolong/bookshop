define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('repairClassifyCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate) {
            $scope.$on("$ionicView.beforeEnter", function() {

                httpRequest.postWithUI($scope, '?method=repair.categoryChild', { pid: 0 }, function(re) {
                    if (re.data.state) {
                        $scope.productCategories = re.data.data;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });



            // 跳转到相应的二级菜单
            $scope.toLevel2 = function(pid) {
               $state.go("brandChoose", {pid: pid});
            }
        }
    ]);
});
