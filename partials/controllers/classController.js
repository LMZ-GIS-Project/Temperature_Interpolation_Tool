app.controller('classCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
	console.log("classController is OK");
	
	$scope.close = function() {
		$scope.gettingclass = false;	//set loggingin to false to end login!
	}
	
	$scope.getClass = function() {
		
		//If teacher has entered both school- and classname:
		if (typeof $scope.part1 != 'undefined' || typeof $scope.part2 != 'undefined') {
			$scope.gettingclass = false;
			//Set school- and classname:
			$rootScope.school = $scope.part1;
			$rootScope.classname = $scope.part2;
			//Set teacher's username to group "0":
			$rootScope.username = $rootScope.school + "_" + $rootScope.classname + "_" + parseInt(0).toString();
			
			//Retrieve potentially existing markers from database:
			$rootScope.displayMarkers();
			
			//Changing the color of the default icon depending on the group (here teacher):
			$rootScope.awesomeMarkerIconDefault.options.markerColor = $rootScope.color_array[$rootScope.getGroupnumber($rootScope.username)];
			
			//Display alert Window to notify that login was successful:
			$rootScope.showAlert("Erfolg!","Der Login war erfolgreich!");
		} else {
			$rootScope.showAlert("Fehler!","Bitte Sie sowohl einen Schul- <br /> als auch einen Klassennamen ein!");
			$scope.gettingclass = true;
		}
		
	}
	
	$rootScope.$on("startgetclass", function (event) {
		//Display "class"-Interface:
		$scope.gettingclass = true;
		console.log("Modal open!");
		
		
	});
	
	$rootScope.$on("stopgetclass", function (event) {
		$scope.gettingclass = false;
	});
	
	
	
} ]);