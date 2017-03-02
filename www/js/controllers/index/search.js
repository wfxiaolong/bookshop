define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('searchCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicPopup', '$ionicHistory',
        function($scope, httpRequest, Storage, $state, $ionicPopup, $ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                // $scope.is_gotoDetail_withSearch = false; // 是否通过搜索按钮进入商品详情
                $scope.goodLists = "";
                $scope.input = { keywords: "" };
                $scope.page = 1;
                $scope.noData = true;
                if (!Storage.get("is_gotoDetail_withSearch")) { $scope.goodsList = []; }; // 如果进入商品详情，则不清空数据
                $scope.is_get_focus = false;
                $scope.search_history = Storage.get("search_history") || [];
            });

            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getShopGoods($scope.page);
            };

            // 搜索框获得焦点
            $scope.inp_focus = function() {
                $scope.is_get_focus = true;
                console.log($scope.is_get_focus);
            }

            // 搜索框失去焦点
            $scope.inp_blur = function() {
                $scope.is_get_focus = false;
                console.log($scope.is_get_focus);
            }

            // 返回上一页
            $scope.goBackIndex = function() {
                APP.isInApp ? $ionicHistory.goBack() : history.back();
                Storage.set("is_gotoDetail_withSearch", false);
            }

            // 进入商品详情
            $scope.goto_detail = function(v) {
                $state.go("indexProDetail", { goodId: v.id });
                Storage.set("is_gotoDetail_withSearch", true);
            }

            // 搜索框内容为空时搜索历史隐藏
            $scope.inp_change = function() {
                if ($scope.input.keywords.length == 0) {
                    $scope.is_get_focus = false;
                }
            }

            // 点击搜索历史搜索框获得相同内容
            $scope.click_search = function(v) {
                $scope.input.keywords = v;
                $scope.is_get_focus = false;
            }

            // 长按删除该条历史记录
            $scope.inp_hold = function(v) {
                for (var i = 0; i < $scope.search_history.length; i++) {
                    if ($scope.search_history[i] == v) {
                        $scope.search_history.splice(i, 1);
                        break;
                    }
                }
            }

            $scope.searchResult = function() {
                if (!$scope.input.keywords) {
                    Tips.showTips("请输入您想要查询的商品");
                    return;
                }
                $scope.is_get_focus = false;
                $scope.noData = false;
                $scope.goodsList = [];
                $scope.page = 1;
                getShopGoods($scope.page);
            }

            function getShopGoods(page) {
                var is_repeat_history = false; //判断是否是重复的关键词，如果是，则将其提到最前面
                for (var i = 0, len = $scope.search_history.length; i < len; i++) {
                    if ($scope.search_history[i] == $scope.input.keywords) {
                        $scope.search_history.splice(i, 1);
                        $scope.search_history.unshift($scope.input.keywords);
                        is_repeat_history = true;
                        break;
                    }
                }
                if (!is_repeat_history) { // 如果不是重复的关键词，就添加到最后面
                    if ($scope.search_history.length == 10) { // 将搜索历史限制在10条
                        $scope.search_history.pop();
                    }
                    $scope.search_history.push($scope.input.keywords);
                }
                Storage.set("search_history", $scope.search_history);
                console.log($scope.search_history);
                httpRequest.post('?method=shop.goodList', { keyword: $scope.input.keywords, page: page }, function(re) {
                    if (re.data.state) {
                        if (!$scope.goodsList) {
                            $scope.goodsList = [];
                        }
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
            }
        }
    ]);
});
