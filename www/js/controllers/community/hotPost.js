define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('hotPostCtrl', ['$scope', 'httpRequest', 'Storage', '$state', 
        function($scope, httpRequest, Storage, $state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.page = 1;
                $scope.hotPost = [];
                getHotPost($scope.page);
            });
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getHotPost($scope.page);
            };

            function getHotPost(page) {
                httpRequest.postWithUI($scope, '?method=cms.articleList', {page:page,type:2,order_type:3}, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        $scope.hotPost = $scope.hotPost.concat(data);
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        console.log(data);
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }
        }
    ]);

});
