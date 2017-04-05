define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('childrenCtrl', ['$scope', 'Storage', 'httpRequest', '$state', function($scope, Storage, httpRequest, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.getChildList();
        });
        $scope.getChildList = function() {
            var user = Storage.get('vrsm_auth');
            var postData = {
                platformMemberId: user.id,
            };
            httpRequest.postWithUI($scope, '/api/services/app/platform/GetStudents', postData, function(re) {
                if (re.data.success) {
                    $scope.studentList = re.data.result.students;
                }
            });
        };

        $scope.getStudentDetail = function(item) {
            location.href = "#/studentDetail";
            Storage.set("tmpStudent", item);
        }
    }]);
});
