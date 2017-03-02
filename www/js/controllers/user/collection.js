define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('collectionCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicScrollDelegate', '$state',
        function($scope, Storage, httpRequest, $ionicScrollDelegate, $state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.articles = [];
                $scope.goods = [];
                $scope.page = 1;
                getData($scope.type, $scope.page);
            });
            $scope.changeType = function(type) {
                if (type == $scope.type) return;
                $scope.articles = [];
                $scope.goods = [];
                $ionicScrollDelegate.scrollTop();
                $scope.type = type;
                $scope.page = 1;
                $scope.noData = false;
                getData($scope.type, $scope.page);
            };
            $scope.jumpDetail = function(v) {
                if (v.type == 1) {
                    $state.go('infoDetail', ({ infoId: v.id }));
                } else {
                    $state.go('postDetail', ({ postId: v.id }));
                }
            };
            // 取消收藏(type为1则是帖子，2则是商品)
            $scope.cancelLike = function(v, index, type) {
                httpRequest.postWithAuth($scope, '?method=cms.delCollect', { type: type, collect_id: v.id }, function(re) {
                    if (re.data.state) {
                        if (type == 1) {
                            $scope.articles.splice(index, 1);
                        } else {
                            $scope.goods.splice(index, 1);
                        }
                        Tips.showTips('删除成功');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getData($scope.type, $scope.page);
            };

            function getData(type, page) {
                var postData = {
                    type: type || 1,
                    page: page
                };
                httpRequest.postWithAuth($scope, '?method=cms.collectList', postData, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        if (type == 2) { //type一开始是不赋值的所以要判断是不是等于2
                            $scope.goods = $scope.goods.concat(data);
                        } else {
                            $scope.articles = $scope.articles.concat(data);
                        }
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                }, function(re) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }
        }
    ]);

});
