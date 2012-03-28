<?php
$error = "";
$msg = "";
$fileElementName = 'fileToUpload';
if(!empty($_FILES[$fileElementName]['error'])) {
    switch($_FILES[$fileElementName]['error']) {

        case '1':
            $error = 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
            break;
        case '2':
            $error = 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
            break;
        case '3':
            $error = 'The uploaded file was only partially uploaded';
            break;
        case '4':
            $error = 'No file was uploaded.';
            break;

        case '6':
            $error = 'Missing a temporary folder';
            break;
        case '7':
            $error = 'Failed to write file to disk';
            break;
        case '8':
            $error = 'File upload stopped by extension';
            break;
        case '999':
        default:
            $error = 'No error code avaiable';
    }
} elseif (empty($_FILES['fileToUpload']['tmp_name']) || $_FILES['fileToUpload']['tmp_name'] == 'none') {
    $error = 'No file was uploaded..';
} else {
        $msg .= $_FILES['fileToUpload']['name'];
        $dir = __DIR__ . DIRECTORY_SEPARATOR . 'upload';
        if (!file_exists($dir)) {
            @mkdir($dir, '0777', true);
        }
        $target = $dir . '/' . $_FILES['fileToUpload']['name'];
        move_uploaded_file($_FILES['fileToUpload']['tmp_name'], $target);
        chmod($target, 0666);
        
        //for security reason, we force to remove all uploaded file
        @unlink($_FILES['fileToUpload']);        
}   
$response = array(
    'error' => $error,
    'msg'	=> $msg
);     
header('Content-Type: application/json');
echo json_encode($response);
