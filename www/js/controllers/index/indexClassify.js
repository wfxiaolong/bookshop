define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('indexClassifyCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$rootScope', '$ionicScrollDelegate', '$ionicHistory',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $rootScope, $ionicScrollDelegate, $ionicHistory) {
            var min, max;
            $scope.$on("$ionicView.beforeEnter", function() {
                //获取首页传过来的数据
                $scope.cateId = $state.params.classifyId;
                if ($state.params.brands) {
                    $scope.brands = JSON.parse($state.params.brands);
                } else {
                    $scope.brands = [];
                }
                $scope.name = $state.params.name;
                $scope.page = $scope.page || 1;
                $scope.subCateId = -1; //子分类（品牌）
                $scope.goods = { minPrize: '', maxPrize: '' };
                if (!Storage.get("is_gotoDetail_withFilter")) {
                    Storage.set("is_gotoDetail_withFilter", false);
                    $scope.goodsList = [];
                    $scope.noData = false;
                    getShopGoods($scope.page);
                } // 如果通过筛选进入商品详情，则不清空数据
            });
            $scope.toggleMoreList = function() {
                $scope.moreList = !$scope.moreList;
                if ($scope.moreList) {
                    min = $scope.$watch('goods.minPrize', function(newValue, oldValue, scope) {
                        if (!newValue) return;
                        var float = newValue.toString().split('.')[1];
                        if (float && float.length > 2) {
                            $scope.goods.minPrize = parseInt(newValue * 100) / 100;
                        }
                    });
                    max = $scope.$watch('goods.maxPrize', function(newValue, oldValue, scope) {
                        if (!newValue) return;
                        var float = newValue.toString().split('.')[1];
                        if (float && float.length > 2) {
                            $scope.goods.maxPrize = parseInt(newValue * 100) / 100;
                        }
                    });
                } else {
                    min();
                    max();
                }
            };

            // 进入商品详情
            $scope.goto_detail = function(v) {
                $state.go("indexProDetail", { goodId: v.id });
                Storage.set("is_gotoDetail_withFilter", true);
                // $scope.noData = true;
                // console.log($scope.goodsList.length);
            }

            // 返回上一页
            $scope.goBackIndex = function() {
                APP.isInApp ? $ionicHistory.goBack() : history.back();
                Storage.set("is_gotoDetail_withFilter", false);
                $scope.page = 1;
            }

            $scope.chooseSubCate = function(v, index) {
                if ($scope.subCate == index) {
                    $scope.subCateId = -1;
                    $scope.subCate = -1;
                    return;
                }
                $scope.subCate = index;
                $scope.subCateId = v.id;
            };
            //自定筛选条件
            $scope.mySort = function() {
                var minPrize = $scope.goods.minPrize;
                var maxPrize = $scope.goods.maxPrize;
                if (minPrize != '' && maxPrize != '' && minPrize > maxPrize) {
                    Tips.showTips('最低价格不能大于最高价格');
                    return;
                }
                $scope.noData = false;  //重置noData的Flag
                $scope.page = 1;
                $scope.goodsList = [];
                $scope.toggleMoreList();
                getShopGoods($scope.page, $scope.sortType);
            };
            //更改搜索条件
            $scope.changeSortType = function(index) {
                if (index != -1) {
                    $scope.sortType = index;
                } else {
                    $scope.sortType = $scope.sortType == 3 ? 4 : 3;
                }
                $scope.page = 1;
                $scope.goodsList = [];
                $scope.noData = false;
                getShopGoods($scope.page, $scope.sortType);
            };

            // 下拉加载更多
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getShopGoods($scope.page, $scope.sortType);
            };

            function getShopGoods(page, sortType) {
                var maxPrize = $scope.goods.maxPrize;
                var minPrize = $scope.goods.minPrize || 0;
                var postData = {
                    page: $scope.page,
                    category_id: ($scope.subCateId == -1) ? $scope.cateId : $scope.subCateId,
                    order_type: sortType || 0,
                    min_price: minPrize
                };
                if (maxPrize && maxPrize != '') postData.max_price = maxPrize;
                httpRequest.post('?method=shop.goodList', postData, function(re) {
                    if (re.data.state) {
                        if ($scope.page == 1) { //当切换了条件时，回到最顶部
                            $ionicScrollDelegate.scrollTop();
                            // $scope.page++;
                        }
                        $scope.goodsList = $scope.goodsList.concat(re.data.data.list);
                        $scope.page++;
                        if (re.data.data.list.length < 10) {
                            $scope.noData = true;
                        }
                    }
                }, function(re) {}, function(re) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }
        }
    ]);

});
