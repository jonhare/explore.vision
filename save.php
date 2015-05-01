<?php
	//get data 
	$data = $_REQUEST['data'];

	//generate a local file name
	$name = strtoupper(substr(md5($data), 0, 5));
	
	//write contents
	file_put_contents("saved-code/".$name.".json", $data, LOCK_EX);

	echo $name;
?>