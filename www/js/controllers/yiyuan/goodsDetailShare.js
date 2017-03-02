define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('goodsDetailShareCtrl', ['$scope', '$rootScope','Storage', '$state', '$sce',
        function($scope,$rootScope, Storage, $state, $sce) {

            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.activityId = $state.params.activity_id;

                console.log(APP.duobaoUrl + "#/activity/" + $scope.activityId + "//share")
                $scope.myURL = $sce.trustAsResourceUrl(APP.duobaoUrl + "#/activity/" + $scope.activityId + "//share");

            });
            window.addEventListener("message", function( e ) {
                if (e.data == "TabYiyuan") {
                    if(APP.is_wechat){
                       $rootScope.goWechatLogin('#/tab/yiyuan');
                   }else{
                        $state.go('login');
                   }
                    //如果要回到当前页，但需要携带用户信息
                    // $rootScope.goWechatLogin("#/goodsDetailShare/" + $scope.activityId + "/share/");
                }
            }, false );

            $scope.goBack = function(){
                $state.go('tab.yiyuan');
            }
        }
    ]);

});
