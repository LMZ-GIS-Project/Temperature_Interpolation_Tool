<?php
	ini_set("display_warnings", true);
  
	$user = $_GET["USER"];
	$lat = $_GET["LAT"];
	$lon = $_GET["LON"];
	$temp = $_GET["TEMP"];
	$exists = $_GET["EXISTS"];
	$id = $_GET["ID"];
	//echo "values" .$user.",".$lat.",".$lon.",".$temp;
	
    //open the database:
    $db = new SQLite3('interpolation_app.db'); 
		
	if ($exists == 'false') {
	
		//echo "Inserting entry";
		//insert measurement:
		$db->exec("INSERT INTO measurements (USER, LAT, LON, TEMP) VALUES ('".$user."',".$lat.",".$lon.",".$temp.");"); //user -> double quotes for text values
		
		//In order to not display the marker twice, we have to get the ID and return it to the client, after that the ID is added to the array of all displayed markers:
		//Check if measurement already exists, hence, temp only needs to be updated:
		$sql = "SELECT ID FROM 'measurements' WHERE USER = '".$user."' AND LAT = ".$lat." AND LON = ".$lon." AND TEMP = ".$temp;
	
		//save query results:
		$result = $db->query($sql);
		
		//save measurements with while-loop -> row by row:
		while ($row = $result->fetchArray()) {
			$id = $row['ID'];
		}
		//return id:
		echo $id;

	} else {
		echo "in if";
		//echo "Updating entries";
		//Update existing entry:
		$db->exec("UPDATE measurements SET TEMP = ".$temp." WHERE ID = ".$id.";");
	}
	//}
    // close the database connection
    $db->close();
  
?>
