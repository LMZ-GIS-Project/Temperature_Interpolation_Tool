app.controller('registerCtrl', [ '$scope', '$rootScope', '$http',  function($scope, $rootScope, $http) {
 
	console.log("registerController is OK");
	
	$scope.close = function() {
		$scope.registering = false;
	}
	
	//Function save / register usernames:
	$scope.register = function() {		
		if (typeof $scope.part1 != 'undefined' || typeof $scope.part2 != 'undefined' || typeof $scope.amount != 'undefined') {
			$scope.registering = false;
			
			var amount = parseInt($scope.amount,0);
			//Check amount, if no number or equal to / smaller than zero, give "alert":
			if (amount <= 0 || isNaN(amount))
			{
				$rootScope.showAlert("Fehler!","Bitte geben Sie eine Anzahl an!");
				$scope.registering = true;
				return;
			}
			
			//Pass the information to the server:
			$http.get('partials/controllers/register.php?PART1=' + $scope.part1 + '&PART2=' + $scope.part2 + '&AMOUNT=' + $scope.amount + '&TID=' + $rootScope.user_id).success(function(data,status) {
				
				/*Check if registration was successful:
				returned is a String containg true (successful) or false (not successful) seperated by a comma -> split String into different parts*/
				var array_check = data.split(',');	//array of string parts
				var string_alert = "Ergebnis der Registrierung: \r\n";	//String to be displayed as alert
				var count_errors = 0; //count number of false (=errors)
				//Iterate through returned results (true / false):
				for (var i = 0; i < (array_check.length-1); i++) {
					var number = (i+1).toString();
					//Define message for alert:
					if (array_check[i] == "true") {
						string_alert += $scope.part1 + "_" + $scope.part2 + "_" + number + " war erfolgreich";
					} else {
						string_alert += $scope.part1 + "_" + $scope.part2 + "_" + number + " war nicht erfolgreich";
						count_errors += 1;	//also count number of errors during registration
					}
					if (i < (array_check.length-2)) {
						string_alert += "\n";
					}
				}
				//Display alert with results:
				$rootScope.showAlert("Ergebnis:",string_alert);
				//If not all usernames could be registered, keep the register-Interface displayed:
				if (count_errors > 0 ) {
					$scope.registering = true;
				}
			});
			
		} else {
			$rootScope.showAlert("Fehler!","Bitte füllen Sie die Felder vollständig aus!");
			$scope.registering = true;
		}
		
		
		
	}
	
	$rootScope.$on("startregister", function (event) {
		
		$scope.part1 = $rootScope.school;
		$scope.part2 = $rootScope.classname;
		$scope.registering = true;
		console.log("Modal open!");
		
	});
	
	$rootScope.$on("stopregister", function (event) {
	
		$scope.registering = false;
		
	});
	
	
	
} ]);