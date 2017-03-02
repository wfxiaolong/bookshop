define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('discoverCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicScrollDelegate', '$rootScope',
        function($scope, httpRequest, Storage, $state, $ionicScrollDelegate, $rootScope) {
            var pageCategoryId;
            var is_init = is_init || false;
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.is_hide = false;
                if (!is_init) {
                    $scope.page = 1;
                    $scope.articleList = [];
                    //获取分类列表
                    httpRequest.postWithUI($scope, '?method=cms.category', { type: 1 }, function(re) {
                        if (re.data.state) {
                            var data = re.data.data;
                            var show = data.splice(0, 4);
                            var hide = data;
                            $scope.classifyShow = show;
                            $scope.classifyMore = hide;
                            var tempCateId = Storage.get('vrsm_discoverCateId');
                            if (tempCateId) {
                                pageCategoryId = tempCateId;
                                Storage.remove('vrsm_discoverCateId');
                            } else {
                                pageCategoryId = show[0].id;
                                $scope.active = 0;
                            }
                            getArticles(pageCategoryId, $scope.page);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                    is_init = true;
                }
            });

            // 下拉刷新
            // $scope.doRefresh = function() {
            //     $scope.page = 1;
            //     // $scope.articleList = [];
            //     //获取分类列表
            //     httpRequest.postWithUI($scope, '?method=cms.category', { type: 1 }, function(re) {
            //         if (re.data.state) {
            //             var data = re.data.data;
            //             var show = data.splice(0, 4);
            //             var hide = data;
            //             $scope.classifyShow = show;
            //             $scope.classifyMore = hide;
            //             var tempCateId = Storage.get('vrsm_discoverCateId');
            //             if (tempCateId) {
            //                 pageCategoryId = tempCateId;
            //                 Storage.remove('vrsm_discoverCateId');
            //             } else {
            //                 pageCategoryId = show[0].id;
            //                 $scope.active = 0;
            //             }
            //             getArticles(pageCategoryId, $scope.page);
            //         }
            //     }, function(re) {
            //         Tips.showTips(re.data.msg);
            //     }, function() {checkHttpDone();});
            //     is_init = true;
            // }

            $scope.jumpDetail = function(v) {
                Storage.set('vrsm_discoverCateId', pageCategoryId);
                $state.go('infoDetail', { infoId: v.id });
            }
            $scope.toggleMore = function() {
                $scope.moreClassify = !$scope.moreClassify;
            };


            //更换分类
            $scope.changeCategory = function(category, index) {
                window.stop();
                pageCategoryId = category.id;
                $ionicScrollDelegate.scrollTop();
                $scope.page = 1;
                $scope.articleList = [];
                $scope.noData = false;
                $scope.active = index;
                $scope.moreClassify = false;
                getArticles(pageCategoryId, $scope.page);
            };
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getArticles(pageCategoryId, $scope.page);
            }

            function getArticles(categoryId, page) {
                var postData = {
                    type: 1,
                    category_id: categoryId || 1,
                    page: page
                }
                httpRequest.post('?method=cms.articleList', postData, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.articleList = $scope.articleList.concat(data);
                        $scope.page++;
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }

            function checkHttpDone() {
                $scope.$broadcast('scroll.refreshComplete');
            }

        }
    ]);
});
