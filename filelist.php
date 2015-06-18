<!DOCTYPE html>
<!-- 
Copyright 2015 Jonathon Hare / The University of Southampton

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1280">
  <title>Explore Computer Vision</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">

  
</head>
<body>
  <div class="row" style="height:10px;"></div>
  <div class="row" style="height:38px;">
    <div class="cell" style="width:1%;"></div>
    <div class="cell yellow" style="border-radius:25px 0 0 0; width:6%;"></div>
    <div class="cell yellow"></div>
    <div class="cell" style="width:1%;"></div>
  </div>
  <div class="row">
    <div class="cell" style="width:1%;"></div>
    <div class="cell yellow uif" style="width:6%; text-align:right">
      FILES&nbsp;
    </div>
    <div class="cell uif">
      <div style="color:white; overflow-y:scroll" id="content" class="uif">
        <?php
          $files = scandir("saved-code");
          $i = 0;
          foreach ($files as $file) {
            if (strlen($file) > 10) {
              $str = file_get_contents("saved-code/".$file);
              $json = json_decode($str, true);

              $containerClass = "fileitem";
              if ($i % 2 == 0) {
                $containerClass.=" alt";
              }
              $fn = str_replace(".json", "", $file);

              echo "<a href='".$fn."' class='".$containerClass."'><span class='filename'>".$fn."</span> <span class='filetitle'>".$json["name"]."</span></a>";
              $i++;
            }
          }
        ?>
      </div>
    </div>
    <div class="cell" style="width:1%;"></div>
  </div>
  <div class="row" style="height:10px;"></div>
</body>
</html>

