<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST,GET,OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

// receive data posted from JS
$data = json_decode(file_get_contents('php://input'), true);

// create a list container for csv 
$lis_new = [];
foreach($data as $key => $value) {
  if ($key == "date"){
    array_push($lis_new, array($value));
  } 
  elseif (strpos($key, "_")){
    array_push($lis_new, array('',$key,$value));
  }
  else{
    array_push($lis_new, array("Fund_name (" . $key . ")",$value));
  }
  
}

print_r($lis_new);


$fp = fopen('file.csv', 'w');

foreach ($lis_new as $fields) {
    fputcsv($fp, $fields);
}

fclose($fp);

// download file from url
// $url = 'https://purposecloud.s3.amazonaws.com/challenge-data.json'; 
// $file_name = basename($url); 
// $old_json = json_decode(gzuncompress(file_get_contents($url)));
// // if(file_put_contents( $file_name,file_get_contents($url))) { 
// //     echo "File downloaded successfully"; 
// // } 
// // else { 
// //     echo "File downloading failed."; 
// // }
// foreach($old_json as $key => $value) {
//  echo $key;

// print_r($lis_new);
//update json

?>