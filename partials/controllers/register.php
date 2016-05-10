<?php
	ini_set("display_warnings", true);
  
	$user = $_GET["USER"];
	$amount = (int)$_GET["amount"];
	
	if ($amount < 1) {
		die("the number of amount is wrong");
	}
	
    //open the database:
    $db = new SQLite3('interpolation_app.db'); 
	
	//In order to not display the marker twice, we have to get the ID and return it to the client, after that the ID is added to the array of all displayed markers:
	//Check if measurement already exists, hence, temp only needs to be updated:
	$sql = "SELECT COUNT(*) as count FROM 'teachers' WHERE USER = '".$user."'";
	
	//save query results:
	$result = $db->query($sql);
	
	$row = $result->fetchArray();
	
	$numRows = $row['count'];
	
	if ($numRows == 0) {
		$db->exec("INSERT INTO teachers (USER, amount) VALUES ('".$user."','".$amount."');"); 
		$teacgerid = $db->lastInsertRowid();
		for ($i=0; $i<$amount;$i++){
			$username = "temp_". date("d.m.y")."_". ($i+1);
			$db->exec("INSERT INTO users (teacher_id, username) VALUES ('".$teacgerid."','".$username."');");
		}
		echo "true";
	} else {
		echo "false";
	}
	
	
    // close the database connection
    $db->close();
  
?>
