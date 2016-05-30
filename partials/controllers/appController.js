app.controller('appController', [ '$scope', '$rootScope', '$http', 'leafletData', '$timeout', '$window', function($scope, $rootScope, $http, leafletData, $timeout, $window) {
 
	console.log("appController is OK");
	
	//Boolean control variables:
	
	//to control displaying of modal windows:
	$scope.editable = true;		//save- / delete-button in edit modal window
	$scope.teacher = false;		//register button in login modal window
	$scope.inclass = false;		//teacher modal window for defintion of class
	
	$scope.editing = false;		//edit modal window
	$scope.loggingin = false;	//login modal window
	$scope.registering = false;	//register modal window
	$scope.gettingclass = false;	//class modal window
	$scope.modalalert = false;		//alert modal window
	$scope.choosingint = false;		//interpolation method modal window
	
	$rootScope.modaltitel = "";
	$rootScope.modalmessage = "";
	
	$rootScope.username = "";			//username
	$rootScope.teachername = "";
	$rootScope.user_id = 0;				//id of user, only not equal to 0 if user is a teacher, needed to display markers of groups
	$rootScope.display_markers = false;	//helper variable to determine displaying of other groups' markers
	$rootScope.classname = "";			//needed to determine the markers to be displayed for a teacher
	$rootScope.school = "";				//needed to determine the markers to be displayed for a teacher
	
	//Control variable for heatmap:
	$rootScope.heatmap_visible = false;
	$rootScope.interpolation_method = "Kriging";
	
	//Variable for "geolocate" button:
	$scope.locateButton;
	
	
	//Marker variables and functions:
	$rootScope.marker_array = [];						//all markers displayed on the map are stored inside this array
	
	$rootScope.color_array = ['black','blue','yellow','red','green-dark','cyan','orange','blue-dark','purple','brown'];	//Array for color of markers, 0 = teacher, 1-9 = pupils / groups
	
	//Default marker icon:
	$rootScope.awesomeMarkerIconDefault = L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: parseInt(0),
									markerColor: 'blue'
	});
	
	/*Global variable to get groupnumber to determine color for markers:*/
	$rootScope.getGroupnumber = function(username) {
		//Adding the groupnumber as property to determine the color of the markers:
		array_username = username.split("_");
		groupnumber = array_username[2];
		return groupnumber;
	}
	
	/*Create marker icon depending on type needed and temperature,
	two parameters: the temperature value and the type of the markers:*/
	$rootScope.getMarkerIcon = function(temp,type,groupnumber) {
		switch(type) {
			//default = markers of own group:
			case "default": return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: Math.round(parseFloat(temp)),	//conversion to float and then rounding to next integer value
									markerColor: $rootScope.color_array[groupnumber]});
							break;
							
			//updating = markers that are "updated" due to changes by other group since last update
			case "updating":	return L.ExtraMarkers.icon({
									icon: 'fa-spinner',
									shape: 'penta',
									markerColor: $rootScope.color_array[groupnumber],
									prefix: 'fa',
									extraClasses: 'fa-spin'
								});
								break;
			
			//updated = markers that were updated by other group since last update
			case "updated":	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									shape: 'penta',
									number: Math.round(parseFloat(temp)),
									markerColor: $rootScope.color_array[groupnumber]
							});
							break;
							
			default:	return L.ExtraMarkers.icon({
									icon: 'fa-number',
									number: Math.round(parseFloat(temp)),
									markerColor: 'blue'});
						break;
		} 
		
	}
	
	//Function to create a marker object, which is also returned, at the passed location with the correct icon depending on the marker type and its creator:
	$scope.createMarker = function(lat, lon, temperature, type, username) {
		thisIcon = $rootScope.getMarkerIcon(temperature, type, $rootScope.getGroupnumber(username));
		var marker = L.marker([eval(lat), eval(lon)], {icon: thisIcon});
		
		//adding "click" event to marker object
		marker.on("click", function (e) {
			$rootScope.$broadcast("startedit", {feature: marker});
        });
		
		return marker;
	}
	
	//Function to display "alert" in a modal window: called everytime a modal window for an alert should be displayed,
	//arguments: titel = header of modal window, message = message within body of modal window
	$rootScope.showAlert = function(titel,message) {
		$rootScope.modaltitel = titel;
		$rootScope.modalmessage = message;
		// Show alert modal window:
		$rootScope.$broadcast("startalert");
	}
	
		
	function onLocationFound(e) {
		
		//Coordinates of location for marker:
		var latLon = e.latlng;
		
		//Creation of the marker:
		var marker = $scope.createMarker(latLon.lat,latLon.lng,parseInt(0),"default",$rootScope.username);
			
		//If marker creation was successful show input dialog:
		if (marker) {
				
			//Add marker to editItems:
			$rootScope.editItems.addLayer(marker);
				
			// Show input dialog
			$rootScope.$broadcast("startedit", {feature: marker});
		}
		
		//return button state to default state:
		$scope.locateButton.state('un_loaded');
	}

	function onLocationError(e) {
		alert(e.message);
		$scope.locateButton.state('error');
	}
 
    $scope.getLocation = function () {
		leafletData.getMap().then(function(map) {
			//map.locate({setView: true, maxZoom: 11});
			map.locate();
		});
    }
	
	//Setup of map object:
	angular.extend($scope, {
		layercontrol: {
                    icons: {
                      uncheck: "fa fa-toggle-off",
                      check: "fa fa-toggle-on"
                    }
                },
		maxbounds: {
				southWest: {lat: 47.0, lng: 5.8},
				northEast: {lat: 50, lng: 10.4918239143}
		},
		defaults: {
			minZoom: 8,
			maxZoom: 16,
			zoomControl: false
		},
		events: {},
		center: {
			lat: 48.7,
			lng: 8.6,
			zoom: 8
		},
		
		layers: {
			baselayers: {},			
			overlays: {				
				draw: {
					name: "Temperaturen",
					type: "group",
					visible: true
				}
			}
		},
		paths: {},
		markers:{},
		controls: {
			custom: [
				
			],
			draw: {
				position: 'bottomright',
				draw: {
					polyline: false,
					polygon: false,
					rectangle: false,
					circle: false,
					marker: {
						icon: $rootScope.awesomeMarkerIconDefault,
						repeatMode: true
					}
				}
			}
		}		
	});
	
	var pluginLayerObject = new Array();	
	
// Perform some post init adjustments
	
	leafletData.getMap().then(function(map) {
		//console.log("Map object: ",map);
		
		//Adding Leaflet.EasyButton button for the geolocalization of a user:
		$scope.locateButton = L.easyButton({
			states:[{
				stateName: 'un_loaded',
				icon: 'fa-location-arrow',
				title: 'Benutzer orten!',
				onClick: function(control) {
					//only if user is logged in, the geolocalization process is started,
					//necessary since a marker is created automatically:
					if ($rootScope.username != "") {
						control.state("loading");
						//Start geolocalization:
						$scope.getLocation();
					} else {
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}, {
				stateName: 'loading',			//display of spinning animation in button while locating user
				icon: 'fa-spinner fa-spin',
				title: 'Am Verorten!'
			}, {
				stateName: 'error',
				icon: 'fa-frown-o',
				title: 'Ort nicht gefunden!'
			}]
		});
		$scope.locateButton.addTo(map);
		
		//console.log("Test control: ", $scope.locateButton);
		
		//Geolocation using leaflet map object:
		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);
		
		//Button to choose interpolation method:
		$scope.intMethodButton = L.easyButton({
			states:[{
				stateName: 'default',
				icon: 'fa-calculator',
				title: 'Interpolationsmethode definieren!',
				onClick: function(control) {
					if ($rootScope.username != "" && $rootScope.heatmap_visible == true) {
						control.state("choosing");
						$rootScope.$broadcast("startchoosing");
					} else {
						//Displaying alert in modal window by calling showAlert function, passed arguments: header as well as message
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}]
		});
		$scope.intMethodButton.addTo(map);
		
		//Save button for export of heatmap:
		$scope.saveButton = L.easyButton({
			states:[{
				stateName: 'un_saved',
				icon: 'fa-floppy-o',
				title: 'Heatmap speichern!',
				onClick: function(control) {
					if ($rootScope.username != "" && $rootScope.heatmap_visible == true) {
						control.state("saving");
						var date = new Date();
						$rootScope.canvas_layer.exportPNG($rootScope.school,$rootScope.classname,$rootScope.interpolation_method,date,control);
					} else {
						//Displaying alert in modal window by calling showAlert function, passed arguments: header as well as message
						$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
					}
				}
			}, {
				stateName: 'saving',	//if saving takes a while, a spinning animation will be displayed!
				icon: 'fa-spinner fa-spin',
				title: 'Am Speichern!'
			}, {
				stateName: 'error',
				icon: 'fa-frown-o',
				title: 'Fehler beim Speichern!'
			}]
		});
		$scope.saveButton.addTo(map);
		
		// Instantiate Draw Plugin
		leafletData.getLayers().then(function(baselayers) {
			$rootScope.editItems = baselayers.overlays.draw;
			
			
			// Handle creation of temperature markers
			map.on('draw:created', function (e) {
				if ($rootScope.username) {
					var layer = e.layer;
					console.log("Draw:Created:");
					console.log(layer);
					$rootScope.editItems.addLayer(layer);
					
					//Leaflet.Heat:
					//$rootScope.heat.addLatLng(layer._latlng);
				
					// register click
					layer.on("click", function (e) {
				
						$rootScope.$broadcast("startedit", {feature: layer});
					
					});
				
					// Show input dialog
					$rootScope.$broadcast("startedit", {feature: layer});
				} else {
					//alert("Please login before adding measurements!")
					$rootScope.showAlert("Fehler!","Bitte loggen Sie sich ein!");
				}
				
				
			});
			
			// BaseLayers for Plugin		
				pluginLayerObject.push({
								title: "MapsForFree Relief",
								layer: new L.tileLayer("http://www.maps-for-free.com/layer/relief/z{z}/row{y}/{z}_{x}-{y}.jpg",
									{
										maxZoom: 16,
										maxNativeZoom: 16,
										attribution: 'Map data &copy; <a href="http://www.maps-for-free.com">www.maps-for-free.com</a>'
										}),
								icon: 'app/data/img/mapsforfree.png'	
					});
				
				pluginLayerObject.push({
								title: "OpenStreetMap",
								layer: new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
								{
										maxZoom: 16,
										maxNativeZoom: 16,
										attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
										}),
								icon: 'app/data/img/openstreetmap.png'		
					});
				
				pluginLayerObject.push({
								title: "ESRI Satellit",
								layer: new L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
								{
									attribution: '<a href="http://www.esri.com">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
									maxZoom: 16,
									maxNativeZoom: 16
								}),
								icon: 'app/data/img/bingaerial.png'
					});
		
				pluginLayerObject.push({
								title: 'OpenTopoMap',
								layer: new L.tileLayer("http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", 
									{
										maxZoom: 16,
										maxNativeZoom: 16,
										attribution: 'Map data © <a href="http://opentopomap.org">OpenTopoMap</a> contributors'
										}),
								icon: 'app/data/img/opentopomap.png'
					});
				
			
			
							
				
					
			
				// create BaseLayercontrol
				var iconLayersControl = new L.Control.IconLayers(pluginLayerObject, {position: 'bottomright',  maxLayersInRow: 1});
				iconLayersControl.addTo(map);
							
				// remove layercontrol
				var layerControl = document.getElementsByClassName('leaflet-control-layers')[0];
				layerControl.parentNode.removeChild(layerControl);
				
						
		
				
				// create overlayLayer control
				
				var overLayers = {					
						"Temperaturen":$rootScope.editItems	
				};
				
				console.log("editItems", $rootScope.editItems);
				
				var panelLayers = new L.control.layers(null, overLayers, {position: 'bottomright'});
				panelLayers.addTo(map);
				
				
				// Place zoomcontrol on bottomright position
				new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
				
				});
				
				$rootScope.map = map;
			
	});	// map preparation
		/*
		// Define zoom dependent smoothFactor
		map.on("zoomstart", function(event){
			
			var zoom = this.getZoom();
			// Check, if RiverLayer is active
			if (this.hasLayer($rootScope.rivers)) {
				
				$rootScope.rivers.eachLayer(function(layer){
					layer.options.smoothFactor = 12-zoom;
					
				});
			}
			
			
		});
			
	
	});
		*/
		
		
		
	
	/*
	
	$scope.$on('sidebar', function(event,data) {
		leafletData.getMap().then(function(map) {
					$rootScope.sideBar = L.control.sidebar('sidebar', {
								position: 'right'
							});
					$rootScope.sideBar.addTo(map);
							
					$rootScope.sideBar.on("content", function(data) {
						if (data.id == "search") {
							$rootScope.$broadcast('rzSliderForceRender');
							highlightStations(init=true);
						}
					});
					
							
				});
	})

*/
	//Heatcanvas: Create an array to store the measurement data for interpolation:
	/*$rootScope.measurements = [];
	$rootScope.measurements = {
		max: 45,
		data: []
	};*/
	
	//Create an array to store id of markers that is used to control the display of the markers with the timout function:
	$rootScope.markers = [];
	
	//Create an array to store the marker objects that are created / changed by other users:
	$rootScope.updateMarkers = [];
	
	//Definition of a global function, this way it can be called inside the interpolate-module
	$rootScope.displayMarkers = function() {
		
		//"Reset" previusly updated / created markers -> change icon color to default, done by iterating throuhg array with marker objects:
		$rootScope.updateMarkers.forEach(function (marker) {
			thisIcon = $rootScope.getMarkerIcon(marker.temp, "default",marker.group);
			marker.setIcon(thisIcon);
		});
		//After updating, the array is reset:
		$rootScope.updateMarkers = [];
		
		// Load all the existing entries from the database, check if marker is already displayed, if not then display it:
		$http.get('partials/controllers/getMeasurements.php?USER=' + $rootScope.username).success(function(data, status) {
			
			//Array to store ids of returned markers, used to check if already displayed markers have been deleted in the meantime:
			var array_marker_ids = [];
		
			//Iteration through returned entries:
			data.features.forEach(function (feature) {
				
				var thisIcon;
				//Check if marker ID is already in the array of the displayed markers:
				var checkID = $rootScope.markers.indexOf(parseInt(feature.properties.id));
				//console.log(checkID);
				
				//If marker is not displayed yet, create new marker and display it:
				if (checkID == -1) {
					/*check if user just logged in -> display all existing markers, variable used: $rootScope.display_markers,
					first login -> display all markers of other clients with standard icon,
					thereafter: -> display new markers added by other clients -> green*/
					
					if ($rootScope.display_markers == false) {
						if (feature.properties.user == $rootScope.username) {
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"default",$rootScope.username);
						} else {
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"default",feature.properties.user);
						}	
					} else {
						if (feature.properties.user == $rootScope.username) {
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"default",feature.properties.user);
						} else {
							var marker = $scope.createMarker(feature.geometry.coordinates[0],feature.geometry.coordinates[1],feature.properties.temp,"updating",feature.properties.user);
							marker.options.clickable = false;
							setTimeout(function() {
								marker.options.clickable = true;
								thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updated", $rootScope.getGroupnumber(feature.properties.user));
								marker.setIcon(thisIcon);
							},2000);						
						}
						$rootScope.updateMarkers.push(marker);
					}
					
					marker.temp =  feature.properties.temp.toString();
					
					//Adding the id of the corresponding entry in the table "measurements" of the sqlite database:
					marker.id = parseInt(feature.properties.id);
					
					//Adding the name of the user that inserted this entry into the table "measurements" of the sqlite database:
					marker.user = feature.properties.user;
					
					//Adding the groupnumber as property to determine the color of the markers:
					marker.group = $rootScope.getGroupnumber(feature.properties.user);
					
					//Add marker as layer to map:
					$rootScope.editItems.addLayer(marker);
					
					//Add id of marker entry to array of displayed markers:
					$rootScope.markers.push(parseInt(feature.properties.id));
					
					//Add marker object to marker array:
					$rootScope.marker_array.push(marker);
				}
				// if marker is already displayed, check if necessary to update the value:
				else {
					$rootScope.marker_array.forEach(function(marker_object) {
		
						if (parseInt(marker_object.id) == parseInt(feature.properties.id)) {
								if (marker_object.temp != feature.properties.temp) {
									thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updating", $rootScope.getGroupnumber(feature.properties.user));
									marker_object.setIcon(thisIcon);
									marker_object.options.clickable = false;
									marker_object.temp = feature.properties.temp.toString();
									$rootScope.updateMarkers.push(marker_object);
									setTimeout(function() {
										marker_object.options.clickable = true;
										thisIcon = $rootScope.getMarkerIcon(feature.properties.temp, "updated", $rootScope.getGroupnumber(feature.properties.user));
										marker_object.setIcon(thisIcon);
									},2000);
								}
						}
						 
						
					});
					//leafletData.getMap().then(function(map){map.panBy([10,10]);map.panBy([-10,-10]);});
				}
				
				//Add id of returned marker object to array:
				array_marker_ids.push(parseInt(feature.properties.id));
				//console.log(feature.properties.id);
				
			});
			
			//Check if displayed marker has been deleted in the meantime:
			$rootScope.markers.forEach(function(marker_id) {
				//console.log(marker_id);
				var index_marker = array_marker_ids.indexOf(parseInt(marker_id));
				//console.log(index_marker);
				if (index_marker == -1) {
					var index_deleted_marker = $rootScope.markers.indexOf(parseInt(marker_id));
					$rootScope.markers.splice(index_deleted_marker, 1);
					//for (var i = 0; i < $rootScope.marker_array.length; i++){
					$rootScope.marker_array.forEach(function(marker_object) {
						if (parseInt(marker_object.id) == parseInt(marker_id)) {
							$rootScope.editItems.removeLayer(marker_object);
							var marker_index = $rootScope.marker_array.indexOf(marker_object);
							console.log("id:", marker_object.id, ", indexOf: ", marker_index);
							$rootScope.marker_array.splice(marker_index,1);
						}
					});			
				}
			});
			
			//after first use -> set $scope.display_markers to true:
			$rootScope.display_markers = true;
			
			if ($rootScope.marker_array.length > 3) {
				console.log("in array: ", $rootScope.marker_array.length);
				$rootScope.canvas_layer = new L.canvasOverlay();
				leafletData.getMap().then(function(map) {
					if (typeof map != 'undefined'){
						$rootScope.map = map;
						$rootScope.canvas_layer
							.drawing($scope.drawingOnCanvas)
							.addTo(map);
					}
				});
				$rootScope.heatmap_visible = true;
			}
			
			//Automatically pan the map object by 10 pixels and back to initialize the redrawing of the canvas:
			leafletData.getMap().then(function(map){map.panBy([10,10]);map.panBy([-10,-10]);});
		});		
    };
	
	$scope.show = function() {
		console.log("Clicked Login");
		$rootScope.$broadcast("startlogin");
	}	
	
	//Canvas Overlay part:
	
	//Get kriging.js file only after initialization of the map object:
	$http.get('app/components/kriging/kriging.js').then(function(data,status) {
		// Adding the script tag to the head as suggested before
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = data.config.url;
		document.getElementById('head').appendChild(script);

	});

	//necessary functions:
	
		$scope.drawingOnCanvas = function(canvasOverlay, params) {
			var draw_it = 0;//boolean if set to 1, the canvas is drawn

			//data
			var values = new Array();
			var x = new Array();
			var y = new Array();        

			$rootScope.marker_array.forEach(function(marker_object){
				var lat = marker_object._latlng.lat;
				var lng = marker_object._latlng.lng;
				var value = marker_object.temp;
				x.push(lng);
				y.push(lat);
				values.push(value);
			});

			//color range setup
			var color_model = (2/3)/(Math.max.apply(null, values) - Math.min.apply(null, values)) * (-1);
			var color_offset = Math.min.apply(null, values);

			//modelsetup of kriging
			var model = "exponential";
			var sigma2 = 0.1, alpha = 1;
			var variogram = kriging.train(values, x, y, model, sigma2, alpha);

			//min max values of the drawn rectangular
			var x_min = Math.min.apply(null, x),
				x_max = Math.max.apply(null, x),
				y_min = Math.min.apply(null, y),
				y_max = Math.max.apply(null, y);
			
			var ctx = params.canvas.getContext('2d');//create canvas
			ctx.globalAlpha = 0.4;//set the opacity for the whole canvas
			ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

		/*	var x_len_deg = (params.bounds._northEast.lng - params.bounds._southWest.lng);//canvas x length in degree
			var y_len_deg = (params.bounds._northEast.lat - params.bounds._southWest.lat);//canvas y length in degree
			var x_len_px = params.canvas.width;//canvas x length in pixel
			var y_len_px = params.canvas.height;//canvas y length in pixel

			var x_factor = x_len_deg / x_len_px;//degree of one pixel in x
			var y_factor = y_len_deg / y_len_px;//degree of one pixel in y*/

			var x_factor = ((params.bounds._northEast.lng - params.bounds._southWest.lng))/(params.canvas.width);
			var y_factor = ((params.bounds._northEast.lat - params.bounds._southWest.lat))/(params.canvas.height);

			//calc offset from left upper corner // using right = x direction // using down = y direction <- down!!!!! NOT UP!
			var x_offset = (x_min - params.bounds._southWest.lng) / x_factor;//in pixel
			var y_offset = (params.bounds._northEast.lat - y_max) / y_factor;//in pixel
		
			var x_offset_deg = 0;//offset in degree
			var y_offset_deg = 0;//offset in degree
			
			//exception handling if some parts are outside the canvas
			if (x_min < params.bounds._northEast.lng && x_max > params.bounds._southWest.lng){
				draw_it = 1;
				if (x_min < params.bounds._southWest.lng){
					x_offset = 0;
					x_min = params.bounds._southWest.lng;
				}
				if (x_max > params.bounds._northEast.lng){
					x_max = params.bounds._northEast.lng;
				}
			}
			else {
				draw_it = 0;
			}
			if (y_max > params.bounds._southWest.lat && y_min < params.bounds._northEast.lat){
				draw_it = 1;
				if (y_max > params.bounds._northEast.lat){
					y_offset = 0;
					y_max = params.bounds._northEast.lat;
				}
				if (y_min < params.bounds._southWest.lat){
					y_min = params.bounds._southWest.lat;
				}
			}
			else {
				draw_it = 0;
			}

			if (draw_it == 1){
				x_offset_deg = params.bounds._southWest.lng + x_offset * x_factor;
				y_offset_deg = params.bounds._northEast.lat - y_offset * y_factor;
				var test = (x_min >= params.bounds._southWest.lng ) &&
					(x_max <= params.bounds._northEast.lng ) &&
					(y_min >= params.bounds._southWest.lat ) &&
					(y_max <= params.bounds._northEast.lat );

				var rec_x = (x_max - x_min);//rectangular size in degree
				var rec_y = (y_max - y_min);//rectangular size in degree
				
				rec_x = rec_x / x_factor;//converting rectuglar size to pixel
				rec_y = rec_y / y_factor;//converting  rectuglar size to pixel

				rec_incl_off_x = rec_x + x_offset;//add the offset of the canvas
				rec_incl_off_y = rec_y + y_offset;//add the offset of the canvas

				for (var i = x_offset; i < rec_incl_off_x; i += 10){
					for ( var j = y_offset; j < rec_incl_off_y; j += 10) {
						//calculate the current position in lat / lng
						var k = i + 5 - x_offset;
						var lng =  x_offset_deg + ( k * x_factor );
						k = j + 5 - y_offset;
						var lat = y_offset_deg - ( k * y_factor );

						//var value = predict_point(x_offset_deg + ( (i + 5) * x_factor ), y_offset_deg - ( (j + 5) * y_factor ), variogram);//->store the value at position in value
						var value;
						if ($rootScope.interpolation_method == "Kriging") {
							value = predict_point(lng,lat,variogram);
						} else {	//,x,y
							var wj = 0;
							var wis = [];
							for (var k=0;k<values.length;k++)	{
								var dx = x[k]-i;
								var dy = y[k]-j;
								var dk = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
								var p = 3;
								var wj_inst = 1/(Math.pow(dk,p));
								wj += wj_inst;
								wis.push(wj_inst*values[k]);
							}
							value = 0;
							for (var l=0;l<wis.length;l++)
							{
								value += wis[l]/wj;
							}
							//console.log("IDW value: ", value);
							/*if (isNaN(value) == true) {
								for (var k=0;k<values.length;k++)	{
									if (x[k] == i && y[k] == j) {
										value = values[k];
										console.log(value);
									}
								}
							}*/
						}
						
						var color;
						// if (value < 0){
							// color = value + color_offset;
							// color_model=Math.abs(color_model);
						// }
						// else {
							// color = value - color_offset; 
						// }
						
						
						//test5 = (2/3) +(value-color_offset) * color_model
						test5 = ((2/3)/(Math.max.apply(null, values) - Math.min.apply(null, values))) * (-1) * value;
						if (test5 <0){
							test5 = test5+ (2*test5);
						}
						ctx.fillStyle = hslToRgb(test5, 1, 0.5) ;//map the value to a color range
						
							
						
						ctx.fillRect(i,j,10,10);//draw a rectangular on canvas with height and width 1 pixel
					}
				}
			}//draw_it
		};

		function componentToHex(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r, g, b) {
			return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		function hslToRgb(h, s, l){
			var r, g, b;

			if(s == 0){
				r = g = b = l; // achromatic
			}else{
				var hue2rgb = function hue2rgb(p, q, t){
					if(t < 0) t += 1;
					if(t > 1) t -= 1;
					if(t < 1/6) return p + (q - p) * 6 * t;
					if(t < 1/2) return q;
					if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
					return p;
				}

				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = hue2rgb(p, q, h + 1/3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1/3);
			}

			return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
		}

		//predict value with kriging for this specific point (x, y); variogram is calculated on the top
		function predict_point(x, y, variogram) {
			var i, k = Array(variogram.n);
			for(i=0;i<variogram.n;i++)
				k[i] = variogram.model(Math.pow(Math.pow(x-variogram.x[i], 2)+
					   Math.pow(y-variogram.y[i], 2), 0.5),
					   variogram.nugget, variogram.range, 
					   variogram.sill, variogram.A);
			return matrix_multiply(k, variogram.M, 1, variogram.n, 1)[0];
		};

		function matrix_multiply(X, Y, n, m, p) {
			var i, j, k, Z = Array(n*p);
			for(i=0;i<n;i++) {
				for(j=0;j<p;j++) {
				Z[i*p+j] = 0;
				for(k=0;k<m;k++)
					Z[i*p+j] += X[i*m+k]*Y[k*p+j];
				}
			}
			return Z;
		}
} ]);