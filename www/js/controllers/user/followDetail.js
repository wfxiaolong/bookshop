define(['app', 'js/utils/tips'], function(app, Tips) {

    app.controller('followDetailCtrl', ['$scope', '$state', 'httpRequest', 'Storage', '$ionicHistory', '$ionicPopup',
        function($scope, $state, httpRequest, Storage, $ionicHistory, $ionicPopup) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.page = 1;
                $scope.user = {};
                $scope.articles = [];
                var postData = { their_id: $state.params.uid };
                var auth = Storage.get("vrsm_auth");
                if (auth) {
                    //详情页为自己的话隐藏关注按钮
                    if (auth.uid == $state.params.uid) {
                        $scope.followBtnHide = true;
                    }
                    postData.uid = auth.uid;
                    postData.token = auth.token;
                }
                httpRequest.postWithUI($scope, '?method=userInfo.theirDetail', postData, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        $scope.user = data;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
                getArticles($scope.page);
            });
            //根据是否关注此人来进行取关或关注操作
            $scope.followClick = function() {
                if (!Storage.get("vrsm_auth")) {
                    Tips.showTips("请先登录");
                    return;
                }
                var user = $scope.user;
                if (user.is_concern == 1) {
                    $ionicPopup.confirm({
                        title: '确定取消关注？',
                        cancelText: '取消',
                        okText: '确定'
                    }).then(function(res) {
                        if (res) {
                            httpRequest.postWithAuth($scope, '?method=userInfo.doConcern', { concern: user.uid, type: 1 }, function(re) {
                                if (re.data.state) {
                                    $scope.user.is_concern = 0;
                                }
                            }, function(re) {
                                Tips.showTips(re.data.msg);
                            });
                        }
                    });
                } else {
                    httpRequest.postWithAuth($scope, '?method=userInfo.doConcern', { concern: user.uid, type: 0 }, function(re) {
                        if (re.data.state) {
                            $scope.user.is_concern = 1;
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            };
            $scope.report = function() {
                $ionicPopup.confirm({
                    title: '确认举报该用户？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (res) {
                        Tips.showTips('举报成功，我们将在24小时内进行处理。');
                    }
                });
            };
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getArticles($scope.page);
            };

            function getArticles(page) {
                httpRequest.postWithUI($scope, '?method=cms.articleList', { uid: $state.params.uid, page: page, type: 2 }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        $scope.articles = $scope.articles.concat(data);
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }
        }
    ]);

});
