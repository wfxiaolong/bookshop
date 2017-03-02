define(['app', 'js/utils/tips'], function(app, Tips) {

    app.controller('followCtrl', ['$scope', '$state', 'httpRequest', 'Storage', '$ionicPopup',
        function($scope, $state, httpRequest, Storage, $ionicPopup) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.page = 1;
                $scope.follows = [];
                getFollowList($scope.page);
            });

            $scope.checkUser = function(user) {
                var uid = user.uid;
                $state.go('followDetail', { uid: uid });
            };
            $scope.cancelFollow = function(user, $event) {
                $event.stopPropagation();
                var uidClick = user.uid;
                $ionicPopup.confirm({
                    title: '确定取消关注？',
                    cancelText: "取消",
                    okText: "确定"
                }).then(function(res) {
                    if (res) {
                        httpRequest.postWithAuth($scope, '?method=userInfo.doConcern', { concern: uidClick, type: 1 }, function(re) {
                            if (re.data.state) {
                                var follows = $scope.follows;
                                var length = follows.length;
                                for (var i = 0; i < length; i++) {
                                    if(follows[i].uid == uidClick) {
                                        follows.splice(i, 1)
                                        $scope.follows = follows;
                                        break;
                                    }
                                }
                            }
                        }, function(re) {
                            Tips.showTips(re.data.msg);
                        });
                    }
                });

            }
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getFollowList($scope.page);
            };

            function getFollowList(page) {
                httpRequest.postWithAuth($scope, '?method=userInfo.concernList', { page: $scope.page, type: 0 }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        $scope.follows = $scope.follows.concat(data);
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
