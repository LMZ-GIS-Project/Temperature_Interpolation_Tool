app.controller('registerCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
 
	console.log("registerController is OK");
	
	$scope.close = function() {
		$scope.registering = false;
	}
	
	// add for loop ( for user name and the amount of the student)
	// get the temp & date & increasing number
	
	$scope.register = function() {
		$scope.registering = false;
	
		console.log($scope.user);
		var amount = parseInt($scope.amount,0);
		if (amount == 0 || isNaN(amount))
		{
			alert('please enter amount');
			return;
		}
		
		$http.get('partials/controllers/register.php?USER=' + $scope.user + '&amount=' + $scope.amount).success(function(data,status) {
				console.log("Returned data");
				console.log(data);
				if (data == "true") {
					console.log("User " + $scope.user + " was succesfully registerd!");
					alert("Registration was successful! You can now login!");
					$scope.user = "";
				} else {
					alert("Username already exists! You can login with this username! " + data);
					$scope.user = "";
					$scope.amount = "";
				}
			});
		
		
	}
	
	$rootScope.$on("startregister", function (event) {
	
		$scope.registering = true;
		console.log("Modal open!");
		
	});
	
	$rootScope.$on("stopregister", function (event) {
	
		$scope.registering = false;
		
	});
	
	
	
} ]);