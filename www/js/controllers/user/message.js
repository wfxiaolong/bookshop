define(['app', 'js/utils/tips'], function(app,Tips) {
    app.controller('messageCtrl', ['$scope', 'Storage', 'httpRequest', function($scope, Storage, httpRequest) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.messageList = [];
            $scope.page = 1;
            getCommentList($scope.page);
            $scope.noData = false;
        });
        $scope.loadMore = function() {
            if ($scope.page == 1) return;
            getCommentList($scope.page);
        };

        function getCommentList(page) {
            httpRequest.postWithAuth($scope, '?method=userInfo.messageList', { page: page }, function(re) {
                if (re.data.state) {
                    var data = re.data.data.list;
                    $scope.page++;
                    $scope.messageList = $scope.messageList.concat(data);
                    if (data.length < 10) {
                        $scope.noData = true;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        };
    }]);
});
