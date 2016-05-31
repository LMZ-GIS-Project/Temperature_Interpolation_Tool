app.controller('loginCtrl', [ '$scope', '$rootScope', '$http', 'leafletData', function($scope, $rootScope, $http, leafletData) {
	//Check code for login. Problem when changing user with the creation of markers? Implement logoff-function?
	console.log("loginController is OK");
	
	$scope.close = function() {
		$scope.loggingin = false;	//set loggingin to false to end login!
	}
	
	$scope.login = function() {
		
	
		console.log($scope.user);
		
		//If user has entered a username:
		if (typeof $scope.user != 'undefined') {
			$scope.loggingin = false;	//end loggingin
			
			//Get request to server, passing the entered username:
			$http.get('partials/controllers/login.php?USER=' + $scope.user).success(function(data,status) {
				//Use the returned data to determine if login can be done:
				//If username exists in either the teachers or the users table:
				if (data != "false") {
					
					/*First reset all variables if entered username is not the same as the previously logged in user:
					remove existing markers of the map from a different user,
					set all "names" to "",...:*/
					if ($rootScope.username != "" && $rootScope.username != $scope.user) {
						$rootScope.marker_array.forEach(function(marker) {
							$rootScope.editItems.removeLayer(marker);
							/*var marker_index = $rootScope.marker_array.indexOf(marker);
							$rootScope.marker_array.splice(marker_index,1);*/
						});
						$rootScope.markers = [];
						$rootScope.markers.length = 0;
						$rootScope.marker_array = new Array();
						$rootScope.marker_array.length = 0;
						$rootScope.display_markers = false;	//defines that all markers are displayed for the first time after user change
						$rootScope.school = "";				//Schoolname "reset"
						$rootScope.classname = "";			//Classname "reset"
						$rootScope.teachername = "";		//teachername "reset" if new user is no teacher!
						$rootScope.username = "";
					}
					//Save id of user, which is only not equal to 0 if the user is a teacher:
					$rootScope.user_id = data;
					
					//Before markers can be displayed for a teacher, the classname needs to be specified (1 teacher can have multiple classes):
					if ($rootScope.user_id != 0) {
						console.log("User is a teacher!");
						//Save username as teachername:
						$rootScope.teachername = $scope.user;
						$scope.switchToClass();
						//return;
					//for users that are no teachers the markers can be displayed directly:
					} else {
						console.log("User is no teacher!");
						//Save new username in global variable:
						$rootScope.username = $scope.user;
						
						//Split username into different parts and save them in the respective variables -> Part 1 = School, Part 2 = Classname
						var username_parts = $rootScope.username.split("_");
						$rootScope.school = username_parts[0];
						$rootScope.classname = username_parts[1];					
						
						//Retrieve potentially existing markers from database:
						$rootScope.displayMarkers();
						
						//Changing the color of the default icon depending on the group:
						$rootScope.awesomeMarkerIconDefault.options.markerColor = $rootScope.color_array[$rootScope.getGroupnumber($rootScope.username)];
						
						//Automatically pan the map object by 1 pixels and back to initialize the redrawing of the canvas:
						//leafletData.getMap().then(function(map){map.panBy([1,1]);map.panBy([-1,-1]);return;});
						if ($rootScope.heatmap_visible == true) {
							$rootScope.canvas_layer.redraw();
						}
			
						$rootScope.showAlert("Erfolg!","Der Login war erfolgreich!");
					}
					
				//If the username is neither in teachers nor in users:
				} else {
					$rootScope.showAlert("Fehler!","Der eingegebene Benutzername ist nicht registriert!");
					$scope.loggingin = true;
					$scope.user = $rootScope.username;
				}
			});
		} else {
			$rootScope.showAlert("Achtung!","Bitte geben Sie einen Benutzernamen ein!");
			$scope.loggingin = true;
		}
		
	}
	
	//Function to switch from login- to register-Interface for teachers if they want to use the registration function:
	$scope.switchToRegister = function() {
		$scope.loggingin = false;
		$scope.registering = true;
		$rootScope.$broadcast("startregister");
	}
	
	//Function to switch from login- to class-Interface for teachers to enter the school- and classname for the project they are now working on:
	$scope.switchToClass = function() {
		console.log("in switchToClass");
		$scope.loggingin = false;
		$scope.gettingclass = true;
		$rootScope.$broadcast("startgetclass");
	}
	
	$rootScope.$on("startlogin", function (event) {
		//Check if user is a teacher, only then display the "Register"-Button:
		if ($rootScope.user_id != 0) {
			$scope.teacher = true;
		} else {
			$scope.teacher = false;
		}
	
		$scope.loggingin = true;
		console.log("Modal open!");
		
		
	});
	
	$rootScope.$on("stoplogin", function (event) {
		$scope.loggingin = false;
	});
	
	
	
} ]);