<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST,GET,OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

// receive data posted from JS
$data = json_decode(file_get_contents('php://input'), true);

$first_key = array_key_first($data);
$file_date = $data[$first_key]["date"];
// create a list container for csv 
$list_csv = [];

array_push($list_csv, array($file_date));
foreach ($data as $fund => $value) {
  if (array_key_exists("aum", $data[$fund])) {
    array_push($list_csv, array($data[$fund]["name"] . " (" . $fund . ")", $data[$fund]["aum"]));
  } else {
    array_push($list_csv, array($data[$fund]["name"] . " (" . $fund . ")"));
  }
  if (!empty($data[$fund]["series"])) {
    foreach ($data[$fund]["series"] as $series_id => $nav) {
      array_push($list_csv, array('', "Series " . $series_id, $nav));
    }
  }
}
//new csv file write mode
$fp = fopen('updated_nav.csv', 'w');

foreach ($list_csv as $fields) {
  fputcsv($fp, $fields);
}

fclose($fp);

// download file from url
$url = 'https://purposecloud.s3.amazonaws.com/challenge-data.json';
$file_name = basename($url);
$file = gzdecode(file_get_contents($url));
$json_data = json_decode($file, true);

if (file_put_contents($file_name, $file)) {
  echo "File downloaded successfully at " . $file_name;
} else {
  echo "File downloading failed.";
}

// }
//update json file
foreach ($data as $fund => $value) {
  if (array_key_exists("aum", $data[$fund])) {
    $json_data[$fund]["aum"] = $data[$fund]["aum"];
    $json_data[$fund]["last_modified"] = $file_date;
  }
  if (!empty($data[$fund]["series"])) {
    foreach ($data[$fund]["series"] as $series_id => $nav) {
      $json_data[$fund]["series"][$series_id]["latest_nav"]["value"] = $nav;
      $json_data[$fund]["series"][$series_id]["latest_nav"]["date"] =
        $file_date;
      $json_data[$fund]["series"][$series_id]["last_modified"] =
        $file_date;
    }
  }
}
// save file to new path
$updated_json_data = json_encode($json_data);
$updated_file_name = "updated-" . basename($url);

if (file_put_contents($updated_file_name, $updated_json_data)) {
  echo "File updated successfully at " . $updated_file_name;
} else {
  echo "File update failed.";
}
