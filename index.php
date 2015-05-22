<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1280">
  <title>Explore Computer Vision</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">

  <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
  <script type="text/javascript" src="js/wmain.js"></script>
  <script type="text/javascript" src="js/ace.js"></script>
  <script type="text/javascript" src="js/mode-javascript.js"></script>
  <script type="text/javascript" src="js/theme-monokai.js"></script>
  <script type="text/javascript" src="js/ext-language_tools.js"></script>
  <script type="text/javascript" src="js/worker-javascript.js"></script>
  <script type="text/javascript">
    function resize() {
        var cell = $("#stretchy");
        cell.css("height", "100%");
        var px = cell.height();
        cell.height(px);

        $("#log").height($("#logContainer").height());
      }

      $(document).ready(function() {
        //initialise the video
        initialiseVideo("source", "sink", function() {
          //load the code once the video is initialised
          <?php 
            $demos = [];
            $files = scandir("saved-code");
            foreach ($files as $file) {
              if (strlen($file) > 10) {
                $demos[] = $file;
              }
            }

            $name = "saved-code/default.json";
            if (isset($_REQUEST['id'])) {
              if (strcasecmp($_REQUEST['id'], "demo")==0) {
                $name = "saved-code/".$demos[0];
                echo "var demofiles = ".json_encode($demos).";\n";
              } else {
                echo "var demofiles;";
                $name = "saved-code/".$_REQUEST['id'].".json";
              }
            }
            echo "var file = \"".$name."\";\n";
          ?>
          $.getJSON(file, function(data) {
            $("#title").val(data.name);
            editor.setValue(data.code, -1);
            run(data.code);
          })
          .fail(function() {
            $.getJSON("saved-code/default.json", function(data) {
              $("#title").val(data.name);
              editor.setValue(data.code, -1);
              run(data.code);
            });
          });

          if (demofiles) {
            var count = 0;
            setInterval(function() {
              count++;
              if (count>demofiles.length)
                count = 0;
              console.log(demofiles[count]);
              $.getJSON("saved-code/" + demofiles[count], function(data) {
                $("#title").val(data.name);
                editor.setValue(data.code, -1);
                run(data.code);
              });
            }, 5000);
          }
        });

        //setup the ui controls
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        editor.$blockScrolling = Infinity;
        editor.setShowPrintMargin(false);
        // editor.setOptions({
        //   enableBasicAutocompletion: true,
        //   enableSnippets: true,
        //   enableLiveAutocompletion: true
        // });

        //disable backspace navigation  
        $(document).on('keydown',function(e){
          var $target = $(e.target||e.srcElement);
          if(e.keyCode == 8 && !$target.is('input,[contenteditable="true"],textarea'))
          {
            e.preventDefault();
          }
        })

        $('#runbtn').click(function() {
          run(editor.getValue());
        });

        $('#savebtn').click(function() {
          save($("#title").val(), editor.getValue());
        });

        $('#loadbtn').click(function() {
          showLoad();
        });

        $( window ).resize(resize);
        resize();

        window.performLoad = function() {
          var file = "saved-code/" + $("#codeInput").val() + ".json";
          $.getJSON(file).done(function(data) {
            $("#loadError").text("");
            $("#title").val(data.name);
            editor.setValue(data.code, -1);
            run(data.code);
            dismissLoad();
          }).fail(function(data) {
            $("#loadError").text("FILE NOT FOUND");
          });
        }
      });
  </script>
</head>
<body>
  <?php include_once("analyticstracking.php") ?>
  
  <div id="drawingArea" class="row" style="height:530px">
    <div class="cell">
      <div class="altcell yellow" style="width:6%; height: 526px; border-radius: 25px 0 0 0; margin-left:1%; text-align:right">
        <span class="uif" style="display: inline-block; margin-top:38px; margin-right:10px;">
          VIDEO
        </span>
      </div>
      <div class="altcell" style="width:91%;">
        <video id="video" muted loop autoplay>
          <source src="melies.mp4"></source>
          <source src="melies.ogv"></source>
        </video>
        <div style="width:calc(50% - 7px); height: 38px; margin-bottom: 4px; text-align:right; float:left" class="yellow">
          <span class="uif" style="position : relative; top: 6px; left: -6px">INPUT</span>
        </div>
        <div style="width:calc(50% - 7px); height: 38px; margin-bottom: 4px; text-align:right; float:left; margin-left:14px" class="yellow">
          <span class="uif" style="position : relative; top: 6px; left: -6px">OUTPUT</span>
        </div>
        <div style="width:50%; float: left">
          <div style="position: absolute; z-index: 100000; color:red; width: 640px" id="nowebcam">
            <div style="margin-left: auto; margin-right:auto; padding:10px" class="uif">WEBCAM INPUT NOT AVAILABLE OR NOT SUPPORTED BY YOUR BROWSER</div>
            <div style="margin-left: auto; margin-right:auto; padding:10px; margin-top:390px" class="uif">PLAYING "Le papillon fantastique" by Georges Méliès</div>
          </div>
          <canvas id="source"></canvas>
        </div>
        <div style="width:50%; float: left">
          <canvas id="sink"></canvas>
        </div>
      </div>
      <div class="altcell yellow" style="height: 526px; width:1%; margin-right: 1%; border-radius: 0 5px 0 0;">
      </div>
    </div>
  </div>

  <div class="row">
    <div class="cell" id="stretchy">
      <div class="altcell blue" style="width:6%; min-height: 200px; height:100%; margin-left: 1%; border-radius:0 0 0 25px">

      </div>
      <div class="altcell" style="width:91%; height:calc(100% - 38px)">
        <div class="altcell" style="width:50%; height:100%">
          <div id="editor" style="min-height: 200px; height:calc(100% - 8px); width: calc(100% - 16px); margin:auto;"></div>
        </div>
        <div class="altcell" style="width:50%; height:100%; min-height:200px">
          <div style="min-height: 200px; height:calc(100% - 8px); width: calc(100% - 16px); margin:auto;">
            <div class="ui roundleft blue" style="margin-left: 4px; width: 10%;">TITLE</div>
            <input id="title" type="text" style="width:50%"></input>
            <button id="helpbtn" style="float:right">HELP</button>

            <div style="width: 100%; text-align: center; margin-bottom: 4px">
              <button id="runbtn" style="float:left">ENGAGE</button>
              <button id="savebtn">STORE</button>
              <button id="loadbtn" style="float:right">LOAD</button>
            </div>

            <div style="width: 100%; text-align: center; border-radius: 0 0 0 25px; height: calc(100% - 96px)" class="yellow">
              <div style="width: 10%; float: left; text-align: right">
                <span class="uif" style="position : relative; top: 6px; left: -6px">LOG</span>
              </div>
              <div id="logContainer" style="width: 90%; height: calc(100% - 10px); max-height: calc(100% - 10px); background-color: black; float: left; font-family: monospace; color: white;">
                <div id="log" style="overflow-y:scroll; overflow-x:hidden; width: calc(100% - 10px); text-align: left; margin-left:10px;">

                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="width:calc(50% - 7px); height: 38px; margin-bottom: 0px; text-align:right; float:left" class="blue">
          <span class="uif" style="position : relative; top: 6px; left: -6px">CODE</span>
        </div>
        <div style="width:calc(50% - 7px); height: 38px; margin-bottom: 0px; text-align:right; float:left; margin-left:14px" class="blue">
          <span class="uif" style="position : relative; top: 6px; left: -6px">CONTROLS</span>
        </div>
      </div>
      <div class="altcell blue" style="height: 100%; min-height:200px; width:1%; margin-right: 1%; border-radius: 0 0 5px 0;">
      </div>
    </div>
  </div>
  <div id="dialogBackground"></div>
  <div class="dialog" id="saveDialog">
    <div id="saveDialogInner">
      FILE IDENTIFIER: <span id="code"></span> 
      <br/>
      <br/>
      <button id="saveok" onclick="dismissSave()">ACKNOWLEDGE</button>
    </div>
  </div>
  <div class="dialog" id="loadDialog">
    <div id="loadDialogInner">
      ENTER FILE IDENTIFIER: <input type="text" id="codeInput"></input>
      <br/>
      <span id="loadError"></span>
      <br/>
      <button id="cancel" onclick="dismissLoad()">CANCEL</button>
      <button id="loadok" onclick="performLoad()">LOAD</button>
    </div>
  </div>
<!--   <div class="dialog" id="helpDialog">
    <div id="helpDialogInner">
      <button id="helpok" onclick="dismissHelp()">DISMISS</button>
    </div>
  </div> -->
</body>
</html>

