define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('addChildCtrl', ['$scope', 'Storage', 'httpRequest', '$state', function($scope, Storage, httpRequest, $state) {
        $scope.$on("$ionicView.afterEnter", function() {
            getSchoolList();
        });

        $scope.school = {
            selectedSchool : "",
            selectedGrade : "",
            selectedClass : ""
        };
        $scope.list = {
            schoolList : [],
            gradeList : [],
            classList : []
        }

        var getSchoolList = function() {
            httpRequest.postWithUI($scope, 'api/services/app/platform/GetSchool', {}, function(re) {
                if (re.data.success) {
                    $scope.list.schoolList = re.data.result;
                }
            });
        };

        var getGradeList = function(school) {
            var postData = {
                schoolId: school
            };
            httpRequest.postWithUI($scope, 'api/services/app/platform/GetGradesBySchoolId', postData, function(re) {
                if (re.data.success) {
                    $scope.list.gradeList = re.data.result;
                }
            });
        }

        var getClassList = function(grade) {
            var postData = {
                gradeId: grade
            };
            httpRequest.postWithUI($scope, 'api/services/app/platform/GetClassicsByGradeId', postData, function(re) {
                if (re.data.success) {
                    $scope.list.classList = re.data.result;
                }
            });
        }

        $scope.changeSchool = function() {
            getGradeList($scope.school.selectedSchool);
        };

        $scope.changeGrades = function() {
            getClassList($scope.school.selectedGrade);
        };

        var user = Storage.get('vrsm_auth');
        $scope.data = {};
        $scope.data.studentName = "";
        $scope.data.studentIDCardNumber = "";
        $scope.createChild = function() {
            var postData = {
                platformMemberId: user.id,
                studentName: $scope.data.studentName,
                studentIDCardNumber: $scope.data.studentIDCardNumber
            };
            httpRequest.postWithUI($scope, 'api/services/app/platform/CreateStudent', postData, function(re) {
                if (re.data.result.isSuccess) {
                    var student = re.data.result.student;
                    var data = {
                        studentId: student.tenantId,
                        platformMemberId: student.platformMemberId,
                        classicId: $scope.school.selectedClass
                    };
                    httpRequest.postWithUI($scope, 'api/services/app/platform/StudentBindClassic', postData, function(re) {});

                    Tips.showTips('添加成功!');
                    $state.go('children');
                }
            });

        };
    }]);
});
