define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('speakCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicScrollDelegate', '$ionicPopup','$state',
        function($scope, Storage, httpRequest, $ionicScrollDelegate, $ionicPopup, $state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.page = 1;
                $scope.page2 = 1;
                $scope.myArticles = [];
                $scope.myResponse = [];
                getArticles($scope.page);
                getResponse($scope.page2);
            });
            $scope.changeType = function(index) {
                $scope.type = index;
            };

            // 跳转到帖子页面
            $scope.goto_article = function(v) {
                if (v.article_type == 2) {
                    $state.go("postDetail", {postId: v.article_id});
                } else {
                    $state.go("infoDetail", {infoId: v.article_id});
                }
            }

            $scope.deletePost = function(v,index) {
                $ionicPopup.confirm({
                    title: '删除帖子',
                    template: '确认删除此帖子？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (res) {
                        httpRequest.postWithAuth($scope, '?method=cms.delArticle', { id: v.id }, function(re) {
                            if (re.data.state) {
                                Tips.showTips('删除成功');
                                $scope.myArticles.splice(index, 1);
                            }
                        }, function(re) {
                            Tips.showTips(re.data.msg);
                        });
                    }
                });
            }
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getArticles($scope.page);
            };
            $scope.loadMore2 = function() {
                if ($scope.page2 == 1) return;
                getResponse($scope.page2);
            };

            function getArticles(page) {
                httpRequest.postWithAuth($scope, '?method=cms.articleList', { page: page }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        $scope.myArticles = $scope.myArticles.concat(data);
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }

            function getResponse(page) {
                httpRequest.postWithAuth($scope, '?method=cms.mentionList', { page: page }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page2++;
                        $scope.myResponse = $scope.myResponse.concat(data);
                        if (data.length < 10) {
                            $scope.noData2 = true;
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
