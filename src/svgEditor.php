<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <link href="./css/svgEditor.css?v=7" rel="stylesheet" type="text/css" />
        <script type="text/javascript" src="./js/jquery.js"></script>
        <script type="text/javascript" src="./js/raphael.js"></script>
        <script type="text/javascript" src="./js/ajaxfileupload.js"></script>
        <script type="text/javascript" src="./js/svgEditor.js"></script>
        <title>SVG editor</title>
    </head>
    <body>
        
        <div id="svg-editor">
            <div id="workpane">
                <div id="paper">
                    
                </div>
            </div>
            <div id="svg-editor-logo">
                <img src="./img/svg-editor-logo.png" alt="SVG editor" />
            </div>
            <div id="tools-top">
                <a id="tool-remove" class="btn" href="#">Delete all</a>
                <a id="tool-send" class="btn" href="#">Send data</a>
                
                <form name="form" action="" method="POST" enctype="multipart/form-data">
                    <input id="fileToUpload" type="file" size="10" name="fileToUpload" class="input" value="upload" />
                    <a id="buttonUpload" class="btn" href="#">Upload</a>
                    <img id="loading" src="./img/loading.gif" alt="loading" />
                </form>

            </div>
            
            <div id="top-btn">
                <a id="tool-clear" href="#" title="Delete unsaved">&nbsp;</a>
                <a id="tool-save" href="#" title="Save shape">&nbsp;</a>
            </div>
            
            <div id="tools-left">
                <a id="tool-pointer" class="ico active" href="#">&nbsp;</a>
                <a id="tool-draw" class="ico" href="#" title="Draw shape">&nbsp;</a>
                <a id="tool-point" class="ico" href="#" title="Point">&nbsp;</a>
                <a id="tool-erase" class="ico" href="#" title="Delete">&nbsp;</a>
                <a id="tool-zoom" class="ico" href="#" title="Zoom">&nbsp;</a>
            </div>
            <div id="zoom-wrap">
                <select id="zoom-select">
                    <option value="0.25">25%</option>
                    <option value="0.5">50%</option>
                    <option value="1" selected="selected">100%</option>
                    <option value="2">200%</option>
                    <option value="3">300%</option>
                    <option value="4">400%</option>
                    <option value="5">500%</option>
                </select>
            </div>
            <div id="info-box"></div>
            <div id="svg-editor-console"></div>
        </div>
        
        <div id="dialog-box">
            <div id="close-dialog">X</div>
            <p>Przypisz obszar do nazwy</p>
            <select id="select-data">
                
            </select>
            lub
            <p>Dodaj nową nazwę</p>
            <input id="input-data" type="text" /><a id="add-new-name" class="btn" href="#">+ dodaj</a>
            <span id="temp-path"></span>
            <span id="temp-point"></span>
            <p class="center">
                <a id="btn-ok" class="btn" href="#">OK</a>
            </p>
        </div>
        
        
    </body>
</html>