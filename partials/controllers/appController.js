app.controller('appController', [ '$scope', '$rootScope', '$http', 'leafletData', '$timeout', '$window', function($scope, $rootScope, $http, leafletData, $timeout, $window) {
 
	console.log("appController is OK");
	$scope.editing = false;
	$scope.editable = true;
	
	$scope.loggingin = false;
	$scope.registering = false;
	
	$rootScope.username = "";
	
	$rootScope.marker_array = [];
	
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
						repeatMode: true
					}
				}
			}
		}
		
	});
	

	var awesomeMarkerIcon =  {
                    type: 'awesomeMarker',
                    icon: 'tint',
                    markerColor: 'red'
                }
				
	var awesomeMarkerDefault = {
			type: 'awesomeMarker',
			icon: 'tint',
			markerColor: 'blue'
	}
				
				
		
	var DefaultIcon = new L.Icon.Default();
	
	var pluginLayerObject = new Array();


	//---------------------Farbskala festlegen-------------------------------------------------

	    var gradient = {
        0.0: "rgba(000,000,255,0)",
        0.2: "rgba(000,000,255,1)",
        0.4: "rgba(000,255,255,1)",
        0.6: "rgba(000,255,000,1)",
        0.8: "rgba(255,255,000,1)",
        1.0: "rgba(255,000,000,1)"
    };
    var gradientImage = (function () {
        var canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 256;
        var ctx = canvas.getContext("2d");
        var grad = ctx.createLinearGradient(0, 0, 1, 256);

        for (var x in gradient) {
            grad.addColorStop(x, gradient[x]);
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1, 256);

        return ctx.getImageData(0, 0, 1, 256).data;
    })();
	
	//---------------------Ende Farbskala festlegen----------------------------------------------------
	
// Perform some post init adjustments
	
	leafletData.getMap().then(function(map) {

		//----------Heatlayer erhält als Imput die Koordinaten und die Temp als Array------------------
		//----------Heatlayer erhält die Information zur Gestaltung------------------------------------
		$rootScope.heat = L.heatLayer(arrayTemp, {gradientImage}).addTo(map);

		console.log("rootScope.heat........................................");
		console.log($rootScope.heat);
	
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
				
					//$rootScope.heat.addLatLng(layer._latlng);
					//console.log($rootScope.heat.addLatLng(layer._latlng));
				
				
					// register click
					layer.on("click", function (e) {
				
						$rootScope.$broadcast("startedit", {feature: layer});
					
					});
				
					// Show input dialog
					$rootScope.$broadcast("startedit", {feature: layer});
				} else {
					alert("Please login before adding measurements!")
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

	//"Simulation" of multiple users: one array with three different usernames, generating a random number between 0 and 2 to randomly "choose" user!
	/*$scope.usernames = ["dummy", "steve", "helmfried"];
	var randomNumber = Math.round(Math.random() * (2 - 0)) + 0;
	$rootScope.username = $scope.usernames[randomNumber];
	alert($rootScope.username);*/
	
	//Create an array to store id of markers that is used to control the display of the markers with the timout function:
	$rootScope.markers = [];
	
	//Definition of a global function, this way it can be called inside the interpolate-module
	$rootScope.displayMarkers = function() {
		
		
		// Load all the existing entries from the database, check if marker is already display, if not then display it:
		$http.get('partials/controllers/getMeasurements.php?USER=' + $rootScope.username).success(function(data, status) {
			
			//Array to store ids of returned markers, used to check if already displayed markers have been deleted in the meantime:
			var array_marker_ids = [];
		
			//Iteration through returned entries:
			data.features.forEach(function (feature) {
				
				//Check if marker ID is already in the array of the displayed markers:
				var checkID = $rootScope.markers.indexOf(feature.properties.id);
				
				//If marker is not displayed yet, create new marker and display it:
				if (checkID == -1) {
					$scope.interarray = [];
					inttemp = parseInt(feature.properties.temp);
					$scope.interarray.push(eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1]),inttemp);

					console.log("interarray......................................");
					console.log($scope.interarray);

					arrayTemp.push($scope.interarray);
					var marker = L.marker([eval(feature.geometry.coordinates[0]), eval(feature.geometry.coordinates[1])]);
					marker.temp =  feature.properties.temp.toString();
					
					//Adding the id of the corresponding entry in the table "measurements" of the sqlite database:
					marker.id = feature.properties.id;
					
					//Adding the name of the user that inserted this entry into the table "measurements" of the sqlite database:
					marker.user = feature.properties.user;

					marker.on("click", function (e) {
                        $rootScope.$broadcast("startedit", {feature: marker});	//Marker object is passed as feature since it stores the temperature value!
                    });
					
					//Add marker as layer to map:
					$rootScope.editItems.addLayer(marker);

					console.log("HIer folgt ein marker");

					console.log(marker);
					
					//Add id of marker entry to array of displayed markers:
					$rootScope.markers.push(feature.properties.id);
					
					//Add marker object to marker array:
					$rootScope.marker_array.push(marker);

					console.log("marker_array");
					console.log($rootScope.marker_array);
				}
				// if marker is already displayed, check if necessary to update the value:
				else {
					$rootScope.marker_array.forEach(function(marker_object) {
		
						if (marker_object.id == feature.properties.id) {
								if (marker_object.temp != feature.properties.temp) {
									marker_object.temp = feature.properties.temp.toString();
								}
						}
						 
						
					});
				}
				
				
				//Add id of returned marker object to array:
				array_marker_ids.push(feature.properties.id.toString());
				//console.log(feature.properties.id);
				
			});
			
			//Check if displayed marker has been deleted in the meantime:
			$rootScope.marker_array.forEach(function(marker_object) {
		
				var index_marker = array_marker_ids.indexOf(marker_object.id.toString());
				if (index_marker == -1) {
					$rootScope.editItems.removeLayer(marker_object);
					var index_this_marker = $rootScope.markers.indexOf(marker_object.id);
					$rootScope.markers.splice(index_this_marker, 1);
				}
						
			});
			
			
			leafletData.getMap().then(function(map){map.panBy([10,10]);map.panBy([-10,-10]);});
			
		});
		
		
    };	
	
	//$rootScope.displayMarkers();
	
	$scope.show = function() {
		console.log("Clicked Login");
		$rootScope.$broadcast("startlogin");
	}
	
} ]);