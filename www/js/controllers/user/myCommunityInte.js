define(['app'], function(app) {
    app.controller('myCommunityInteCtrl', ['$scope', 'Storage', 'httpRequest', '$state', function($scope, Storage, httpRequest, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var point = $state.params.point;
            $scope.point = point;
            $scope.pointRecord = [];
            $scope.page = 1;

            httpRequest.postWithUI($scope, '?method=userInfo.pointInfo', {}, function(re) {
                if (re.data.state) {
                    var data = re.data.data;
                    $scope.rules = data;
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
            getPointDetail($scope.page);
        });

        $scope.loadMore = function() {
            if ($scope.page == 1) return; //ion-infinite-scroll默认会触发一次loadMore()
            getPointDetail($scope.page);
        };
        
        function getPointDetail(page) {
            httpRequest.postWithAuth($scope, '?method=userInfo.pointDetail', { page:page }, function(re) {
                if (re.data.state) {
                    var data = re.data.data;
                    $scope.pointRecord = $scope.pointRecord.concat(data.list);
                    $scope.page ++;
                    if (data.list.length < 10) {
                        $scope.noData = true;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        }
    }]);

});
