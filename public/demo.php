<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST,GET,OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

// receive data posted from JS
$data = json_decode(file_get_contents('php://input'), true);

// $data =


// create a list container for csv 
$list_csv = [];
foreach($data as $key => $value) {
  if ($key == "date"){
    array_push($list_csv, array($value));
  } 
  elseif (strpos($key, "__")){
    array_push($list_csv, array('',$key,$value));
  }
  else{
    array_push($list_csv, array("Fund_name (" . $key . ")",$value));
  }
  
}

$fp = fopen('file.csv', 'w');

foreach ($list_csv as $fields) {
    fputcsv($fp, $fields);
}

fclose($fp);

// download file from url
$url = 'https://purposecloud.s3.amazonaws.com/challenge-data.json'; 
$file_name = basename($url);
$file = gzdecode(file_get_contents($url));
$json_data = json_decode($file,true);

if(file_put_contents($file_name,$file)) { 
    echo "File downloaded successfully at ".$file_name; 
} 
else { 
    echo "File downloading failed."; 
}

// }
//update json file
foreach($data as $key => $value) {
  if ($key == "date"){
   // bypass the date row
  } 
  elseif (strpos($key, "__")){
   // fund_series nav row
    $parts = explode("__", $key);
    $fund_id = $parts[0]; 
    $series_id =  $parts[1];
    $json_data[$fund_id]["series"][$series_id]["latest_nav"]["value"] = $value;
    // update the last modified date as well for data sanity validation
    $json_data[$fund_id]["series"][$series_id]["latest_nav"]["date"] =
    $data["date"];
    $json_data[$fund_id]["series"][$series_id]["last_modified"] =
    $data["date"];
  }
  else{// fund_name aum row
   $json_data[$key]["aum"]= $value;
   // update the last modified date as well for data sanity validation
   $json_data[$key]["last_modified"] = $data["date"];
  }
 }
// save file to new path
$updated_json_data = json_encode($json_data);
$updated_file_name = "updated-".basename($url);

if(file_put_contents($updated_file_name,$updated_json_data)) { 
    echo "File updated successfully at ".$updated_file_name; 
} 
else { 
    echo "File update failed."; 
}
?>