define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('moduleDetailCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', '$ionicPopup',
        function($scope, httpRequest, Storage, $state, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicPopup) {
            $scope.vrsm_auth = Storage.get("vrsm_auth");
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.moduleId = $state.params.moduleId;
                // console.log($state.params);
                $scope.moduleName = $state.params.moduleName; //按照模块改变标题
                // console.log($scope.vrsm_auth);
                $scope.posts = [];
                $scope.page = 1;
                initSwiperHeight(750 / 470, function() { //根据屏幕宽度初始化swiper的高度
                    // 获取顶部banner
                    httpRequest.postWithUI($scope, '?method=website.bannerList', { type: 4 }, function(re) {
                        if (re.data.state) {
                            $scope.communityBanner = re.data.data;
                            $ionicSlideBoxDelegate.update();
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                });
                getPosts($scope.page);
            });
            function replaceSpace(str){
                return str.split('&amp;nbsp;').join('&nbsp;');
            }
            $scope.addCollect = function() {
                $ionicPopup.confirm({
                    title: '确认关注此版块？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (res) {
                        if (!$scope.vrsm_auth) {
                            Tips.showTips('请先登录');
                            $state.go('login');
                            return;
                        }
                        httpRequest.postWithAuth($scope, '?method=cms.saveCollect', { collect_id: $scope.moduleId, type: 3 }, function(re) {
                            if (re.data.state) {
                                Tips.showTips("关注成功");
                            }
                        }, function(re) {
                            Tips.showTips(re.data.msg);
                        });
                    }
                });
            };
            //跳转新帖子的页面
            $scope.toWritePost = function() {
                if ($scope.vrsm_auth) {
                    $state.go('writePost', { moduleId: $scope.moduleId });
                } else {
                    Tips.showTips('请先登陆');
                    $state.go('login');
                }
            };
            $scope.changeType = function(order) {
                $scope.order = order;
                // $ionicScrollDelegate.scrollTop();
                $scope.page = 1;
                $scope.posts = [];
                getPosts($scope.page, order);
            };
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getPosts($scope.page);
            };
            $scope.jumpOtherUrl = function(v, event) { //跳外链
                if (!APP.isIOS && APP.isInApp) { //安卓APP
                    event.preventDefault();
                    $state.go('iframePage', { url: v.url });
                } else {
                    return;
                }
            };
            $scope.jumpInfo = function(v) { //跳资讯
                if (v.url_type == 1) {
                    $state.go('infoDetail', { infoId: v.url.id });
                } else {
                    $state.go('indexProDetail', { goodId: v.url.id });
                }
            };

            function getPosts(page, order) {
                var postData = {
                    type: 2,
                    category_id: $scope.moduleId,
                    page: page,
                    order_type: order || 0
                }
                httpRequest.postWithUI($scope, '?method=cms.articleList', postData, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        $scope.posts = $scope.posts.concat(data);
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }

            function initSwiperHeight(percent, callBackFunc) {
                var width = document.body.clientWidth;
                var height = width / percent;
                var swipers = angular.element(document.getElementsByClassName('swiper'));
                swipers.css('height', height + 'px');
                callBackFunc();
            }
        }
    ]);

});
