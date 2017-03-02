define(
    [
        'ionic',
        'app',
        'routes',
        'appConfig',
        'js/utils/httpRequest',
        'js/utils/storage',
        'js/utils/filter',
        'js/utils/directive'
    ],
    function(ionic, app, routes, appConfig) {

        angular.element(document.getElementsByTagName('html')[0]).ready(function() {
            try {
                angular.bootstrap(document, ['app']);
            } catch (e) {
                console.error(e.stack || e.message || e);
            }

        });
    });
