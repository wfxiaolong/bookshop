define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('userCommentsCtrl', ['$scope', 'httpRequest', 'Storage', '$state', function($scope, httpRequest, Storage, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.page = 1;
            $scope.commentList = [];
            $scope.goodId = $state.params.goodId;
            getCommentList($scope.page);
        });
        $scope.loadMore = function() {
            if ($scope.page == 1) return;
            getCommentList($scope.page);
        };

        function getCommentList(page) {
            httpRequest.post('?method=shop.shopCommentList', { page: page, good_id: $scope.goodId }, function(re) {
                if (re.data.state) {
                    var data = re.data.data;
                    $scope.averageStar = data.average_star;
                    $scope.commentList = $scope.commentList.concat(data.list);
                    $scope.page++;
                    if (data.list.length < 10) {
                        $scope.noData = true;
                    }
                }
            }, function(re) {}, function(re) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
    }]);

});
