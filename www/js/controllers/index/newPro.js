define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('newProCtrl', ['$scope', 'httpRequest', 'Storage', '$state',
        function($scope, httpRequest, Storage, $state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.page = 1;
                $scope.goodsList = [];
                getShopGoods($scope.page);
            });
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getShopGoods($scope.page);
            };
            $scope.doRefresh = function() {
                $scope.page = 1;
                $scope.goodsList = [];
                getShopGoods($scope.page);
                $scope.noData = false;
            };

            function getShopGoods(page) {
                httpRequest.post('?method=shop.goodList', { page: page, flag: 1 }, function(re) {
                    if (re.data.state) {
                        $scope.goodsList = $scope.goodsList.concat(re.data.data.list);
                        $scope.page++;
                        if (re.data.data.list.length < 10) {
                            $scope.noData = true;
                        }
                    }
                }, function(re) {}, function(re) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                });
                console.log(page);
            }
        }
    ]);
});
