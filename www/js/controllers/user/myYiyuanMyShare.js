define(['app'], function(app) {
    app.controller('myYiyuanMyShareCtrl', ['$scope', 'Storage', '$state', '$sce', function($scope, Storage, $state, $sce) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var auth = Storage.get('vrsm_auth');
            if (!auth) {
                Tips.showTips('请先登录');
                $state.go('login');
            } else {
                var params = {
                    uid:auth.uid,
                    goodsId: 4,
                    pageTitle: '我的晒单' 
                };
                $scope.myURL = $sce.trustAsResourceUrl(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token + "|shareOrder|" + JSON.stringify(params));
                console.log(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token + "|shareOrder|" + JSON.stringify(params));
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
