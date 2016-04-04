app.controller('editCtrl', [ '$scope', '$rootScope',  function($scope, $rootScope) {
 
	console.log("editController is OK");
	
	$scope.editing = false;
	
	$scope.temp = 20;
	$scope.feature = {};
	
	$scope.close = function() {
		$scope.editing = false;
	}
	
	
	$scope.save = function() {
		$scope.editing = false;
		
		// Save the temperature within the feature
		$scope.feature.temp = $scope.temp;
		
		console.log("Feature", $scope.feature);
		
		// Lets loop through all the elements that are drawn by now
		// pick the correct marker and set the temperature
		
		$rootScope.editItems._layers[$scope.feature._leaflet_id].temp = $scope.temp;
			
		
		
		
	}
	
	$rootScope.$on("startedit", function (event, data) {
	
		$scope.editing = true;
		$scope.temp = data.feature.temp;
		$scope.feature = data.feature;
		
	});
	
	$rootScope.$on("stopedit", function (event, data) {
	
		$scope.editing = false;
		
	});
	
	
} ]);