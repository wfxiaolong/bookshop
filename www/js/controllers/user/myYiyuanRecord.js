define(['app'], function(app) {
    app.controller('myYiyuanRecordCtrl', ['$scope', 'Storage', '$state', '$sce', function($scope, Storage, $state, $sce) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var auth = Storage.get('vrsm_auth');
            if (!auth) {
                Tips.showTips('请先登录');
                $state.go('login');
            } else {
                $scope.myURL = $sce.trustAsResourceUrl(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token + "|myIndianaRecord");
                console.log(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token + "|myIndianaRecord");
            }
        });

        window.addEventListener("message", function( e ) {
            if (e.data == "hideBar") {
                $scope.$apply(function () {
                    $scope.hideBar = true;
                });
            }
            if (e.data == "showBar") {
                $scope.$apply(function () {
                    $scope.hideBar = false;
                });
            }
        }, false );
    }]);

});
