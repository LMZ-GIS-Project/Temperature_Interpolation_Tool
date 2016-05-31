app.controller('interpolationCtrl', [ '$scope', '$rootScope', 'leafletData', function($scope, $rootScope, leafletData) {
	console.log("interpolationController is OK");
	
	$scope.close = function() {
		$scope.choosingint = false;	//set choosingint to false to end choosing process of interpolation method!
	}
	
	$scope.getIntMethod = function() {
		$scope.choosingint = false;	//end choosing interpolation method
		
		if ($scope.intmethod != $rootScope.interpolation_method) {
			$rootScope.interpolation_method = $scope.intmethod;
			
			//Automatically pan the map object by 10 pixels and back to initialize the redrawing of the canvas:
			//leafletData.getMap().then(function(map){map.panBy([10,10]);map.panBy([-10,-10]);});
			$rootScope.canvas_layer.redraw();
		}
	}
	
	$rootScope.$on("startchoosing", function (event) {
		if ($rootScope.interpolation_method == "Kriging") {
			$scope.intmethod = 'Kriging';
		} else {
			$scope.intmethod = 'IDW';
		}
		$scope.choosingint = true;
		console.log("Modal open!");
	});
	
	$rootScope.$on("stopchoosing", function (event) {
		$scope.choosingint = false;
	});
	
	
	
} ]);