/*
 * Copyright © 2012 Mediovski.pl Sp. z o.o.
 * @author - Paweł Kaczmarek
 * 
 */

var SvgEditor = function(config){
    
    var config = config || {};
        config.width = config.width || 600;
        config.height = config.height || 400;
        config.data = config.data || [],
        paths = config.paths || [],
        points = config.points || [],
        zoom = 1,
        imgW = 0,
        imgH = 0;
        
    var attr = {
            fill: "#EE0425",
            opacity: 0.8,
            stroke: "#444",
            "stroke-width": 1,
            "stroke-linejoin": "miter"
        };
    
    function setPaperSize(w,h){
        var w = w || config.width;
        var h = h || config.height;
        $('#paper').animate({
            width: w,
            height: h
        }, 200);
    }
    setPaperSize();
    
    var R = Raphael("paper", config.width, config.height);

    $('#zoom-select').bind('change', function(){
        zoom = $(this).find('option:selected').attr('value');

        setPaperSize(config.width * zoom,config.height * zoom);
        R.setSize(config.width * zoom,config.height * zoom)
        R.setViewBox(0, 0, config.width, config.height, true);
        $('.uploaded-img').animate({
            width: imgW * zoom
        }, 200);

    }).change();


    $('#paper').bind('click', function(e){
        var offset = $(this).offset();
        var x = parseInt(e.pageX - offset.left, 10);
        var y = parseInt(e.pageY - offset.top, 10);
        if($('#tool-draw').hasClass('active')){
            drawCircle(parseInt(x/zoom, 10),parseInt(y/zoom, 10));
            preparePath(parseInt(x/zoom, 10),parseInt(y/zoom, 10));
            $('#temp-point').html('');
        }else if($('#tool-point').hasClass('active')){
            $('#temp-point').html(parseInt(x/zoom, 10) + '-' + parseInt(y/zoom, 10));
            
        }else if($('#tool-zoom').hasClass('active')){
            var selected = $('#zoom-select option:selected');
            if(zoom < $('#zoom-select option:last').attr('value')){
                $('#zoom-select option').removeAttr('selected');
                selected.next().attr('selected', 'selected');
            }else{
                $('#zoom-select option').removeAttr('selected');
                $('#zoom-select option:first').attr('selected', 'selected');
            }
            $('#zoom-select').change();
        }
        
    });
    
    
    var path = $('#svg-editor-console').html(); 
    function preparePath(x,y){ 
       path += x + ',' + y + 'L';
       return createFullPath(path);    
    }
    
    function clearPath(){
        path = '';
        return createFullPath(path);  
    }
    
    function createFullPath(path){
        var mPath = path.replace(/(\s+)?.$/, ""); // remove last chart
        var fullPath = 'M' + mPath + 'Z';
        $('#svg-editor-console').html(fullPath);
        return drawPath(fullPath);
    }
    
    var shape = $('.shape');
    function removePath(){
        shape.remove();
    }
    
    function clearAll(){
        R.remove();
        R = Raphael("paper", config.width*zoom, config.height*zoom);
        $('#zoom-select').change();
    }
    
    var dots = $('.dots');
    function drawCircle(x,y,r){
        var r = r || 2;
        dots = R.circle(x,y,r).attr(attr).attr({fill: "#0f0", opacity: 0.6});
    }
    
    function drawPoint(x,y,r){
        var r = r || 3;
        dots = R.circle(x,y,r).attr(attr).attr({fill: "#00f", opacity: 0.9});
    }
    
    function drawPath(path){
        removePath();
        shape = R.path(path).attr(attr).attr({fill: "#f60", opacity: 0.6});
    }
    
    (function insertData(){
        $('#select-data').html('<option></option>');
        for(var i=0; i<config.data.length; i++){
            $('#select-data').append('<option id="' + config.data[i].points.x + '-' + config.data[i].points.y + '" value="' + config.data[i].path +  '">' + config.data[i].name + '</option>');
            paths.push(config.data[i].path);
            var dataPoints = config.data[i].points.x + '-' + config.data[i].points.y;
            points.push(dataPoints);
        }
    })();
    
    (function addNewName(){
        $('#add-new-name').bind('click', function(){
            var newPath = $.trim($('#temp-path').text());
            var newPoint = $.trim($('#temp-point').text());
            var newName = $('#input-data').val();
            if(newName.length > 0){
                $('#select-data').append('<option id="' + newPoint + '" value="' + newPath + '">' + newName + '</option>');
                $('#input-data').val('');
                $('#dialog-box').fadeOut(200);
                savePath();
            }
        });
    })();
    
    
    var savedPaths = $('.savedPaths');
    function savePath(){
        var savedPath = $('#svg-editor-console').text();
        if(savedPath.length > 5) {
            paths.push(savedPath);
        }
        
        // console.log('paths:', paths)
        
        var savedPoint = $('#temp-point').text();
        for(var i=0;i<points.length;i++) {
            if(points[i]==savedPoint)
                points.splice(i,1);
        }
        if(savedPoint.length > 2) {
            points.push(savedPoint);
        }
                
        // console.log('points:', points)

        clearAll();

        for(var i=0; i<paths.length; i++){
            savedPaths = R.path(paths[i]).attr(attr);
        }
        
        for(var i=0; i<points.length; i++){
            var x = points[i].split('-')[0];
            var y = points[i].split('-')[1];
            drawPoint(x,y);
        }
        
        $('#zoom-select').change();
        
        // console.log('paths:', paths)
        
        R.forEach(function (el) {
            el.click(function(){
                var thisPath = el.attr('path').toString();
                if($('#tool-erase').hasClass('active')){
                    removeElementFromArray(paths, thisPath);
                    removePathFromSelect(thisPath);
                    
                    var thisPoint = el.attr('cx') + '-' + el.attr('cy');
                    removeElementFromArray(points, thisPoint);
                    removePointFromSelect(thisPoint);
                    $('#temp-point').html('');
                    el.remove();
                }else if($('#tool-point').hasClass('active')){
                    $('#temp-path').html(thisPath);
                    $('#input-data').val('');
                    $('#dialog-box').fadeIn(200);
                    assignPathToName();
                    drawPoint($('#temp-point').html().split('-')[0],$('#temp-point').html().split('-')[1]);
                }
            }).mouseover(function(){
                var thisPath = el.attr('path').toString();
                $('#select-data option').each(function(){
                    if($(this).attr('value') == thisPath){
                        $('#info-box').html($(this).text());
                    }
                });
            }).mouseout(function(){
                $('#info-box').html('');
            });
        });

	    //$('#temp-point').html('');
        clearPath();
    }
    savePath();
    
    function removePointFromSelect(point){
        $('#select-data option').each(function(){
            if($(this).attr('id') == point){
                $(this).attr('id', '');
            }
        });
    }
    
    function removePathFromSelect(path){
        $('#select-data option').each(function(){
            if($(this).attr('value') == path){
                $(this).attr('value', '');
            }
        });
    }

    $('#close-dialog').bind('click', function(){
        $('#dialog-box').fadeOut(200);
        savePath();
    });
    
  
    function assignPathToName(){
        $('#select-data option').removeAttr('selected');
        $('#select-data option:first').attr('selected', 'selected');
        $('#select-data option').each(function(){
            if($(this).attr('value') == $.trim($('#temp-path').html())){
                $(this).attr('selected', 'selected');
                var _that = $(this);
                var t = setTimeout(function(){
                    _that.attr('id', $('#temp-point').html());
                },500);
                
            }
        });
        
        $('#select-data').bind('change', function(){
            $(this).find('option:selected').attr('value', $('#temp-path').html());
            $(this).find('option:selected').attr('id', $('#temp-point').html());
            $('#dialog-box').hide();
            savePath();
        }).bind('click', function(){
            $('#select-data option').each(function(){
            if($(this).val().length > 0 && $(this).attr('id').length > 0){
                $(this).css({opacity: .5})
            }else{
                $(this).css({opacity: 1})
            }
        });
            
        });
        $('#temp-point').html('');
    }
    

    function removeElementFromArray(arrayName,arrayElement) {
        for(var i=0;i<arrayName.length;i++) {
            if(arrayName[i]==arrayElement)
                arrayName.splice(i,1);
        }
    }

    function dragPath(path){
        path.drag(movePath, startPath, upPath)
    }
    
    // draging path
    var startPath = function() {
        this.ox = 0;
        this.oy = 0;
    }, movePath = function(dx, dy) {
        var trans_x = dx - this.ox;
        var trans_y = dy - this.oy;
        this.translate(trans_x, trans_y);
        this.ox = dx;
        this.oy = dy;
    }, upPath = function() {
        // nothing
    };

    
    $('#tools-left a').bind('click', function(){
        $('#tools-left a').removeClass('active');
        $(this).addClass('active');
        $('#paper').attr('class', $(this).attr('id'));
    });
    
    $('#tool-clear').bind('click', function(){
        $('#temp-point').html('');
        clearPath();
        clearAll();
        savePath();
        return false;
    });
    
    $('#tool-remove').bind('click', function(){
        clearPath();
        clearAll();
        paths = [];
        points = [];
        $('#temp-point').html('');
        $('#select-data').html('');
        $('.uploaded-img').remove();
        return false;
    });
    
    $('#tool-save').live('click', function(){
        savePath();
        return false;
    });
    
    function ajaxFileUpload() {
        $("#loading").ajaxStart(function() {
            $(this).show();
        }).ajaxComplete(function() {
            $(this).hide();
        });
    
        imgW = null;
        imgH = null;
        $.ajaxFileUpload({
            url:'ajax/doajaxfileupload.php',
            secureuri:false,
            fileElementId:'fileToUpload',
            dataType:'json',
            success: function(data,status) {
                if( typeof (data.error)!='undefined') {
                    if(data.error!='') {
                        alert(data.error);
                    } else {
                        $('.uploaded-img').remove();
                        var img = new Image();
                        img.onload = function() {
                            var imgSrc = '<img class="uploaded-img" src="ajax/upload/' + data.msg + '" />'
                            $('#paper').append(imgSrc);
                            var t = setTimeout(function(){
                                imgW = $('.uploaded-img').width();
                                imgH = $('.uploaded-img').height();
                                config.width = imgW;
                                config.height = imgH;
                                savePath();
                            }, 500)
                        };
                        img.src = 'ajax/upload/' + data.msg;
                    }
                }
            },
            error: function(data,status,e) {
                alert(e);
            }
        })
    
        return false;
    
    }
    
    function insertPhoto(){
        $('.uploaded-img').remove();
        var img = new Image();
        img.onload = function() {
            var imgSrc = '<img class="uploaded-img" src="' + config.img + '" />'
            $('#paper').append(imgSrc);
            imgW = $('.uploaded-img').width();
            imgH = $('.uploaded-img').height();
            config.width = imgW;
            config.height = imgH;
            savePath();
        };
        img.src = config.img;
    }
    
    if(config.img){
        insertPhoto();
    }
    
    $('#buttonUpload').bind('click', function(){
        ajaxFileUpload();
        return false;
    });
    
    $('#btn-ok').bind('click', function(){
        if($('#input-data').val().length > 0 || $('#select-data option:selected').text().length > 0){
            $('#add-new-name').click();
            $('#dialog-box').fadeOut(200);
            savePath();
        }else{
            $('#tool-clear').click();
            $('#dialog-box').fadeOut(200);
        }
        
        return false;
    });
    
    
    $('#tool-send').bind('click', function(){
        
        var allData = {
            img: $('.uploaded-img').attr('src'),
            paths: paths,
            points: points,
            data: []
        }
        $('#select-data option:not(#select-data option:first)').each(function(){
            if($(this).val().length > 2){
                var dataObj = {
                    name: $(this).text(),
                    path: $(this).attr('value'),
                    points: {
                        x: $(this).attr('id').split('-')[0],
                        y: $(this).attr('id').split('-')[1]
                    }
                }
                allData.data.push(dataObj);
            }
            
        });

        console.log(allData)
    });
	
};


$(function() {
    SvgEditor( config = {
        // img: 'ajax/upload/map_store_01.png',
        // paths: ['M435,75L437,133L569,119L529,33L480,66L474,91Z', 'M197,17L195,83L258,83L319,45L277,14L225,48Z'],
        // data : [{
            // name : 'Leroy',
            // path : 'M428,119L409,148L345,146L364,118Z',
            // points : {
                // x : '387',
                // y : '120'
            // }
        // }, {
            // name : 'Tesco',
            // path : 'M464,118L485,139L473,148L413,149L432,119Z',
            // points : {
                // x : '447',
                // y : '123'
            // }
        // }, {
            // name : 'Empik',
            // path : 'M528,71L566,71L541,108L489,137L467,117L487,89L516,89Z',
            // points : {
                // x : '540',
                // y : '70'
            // }
        // }]
    });
});




