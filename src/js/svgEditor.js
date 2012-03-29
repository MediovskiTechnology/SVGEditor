/*
 * Copyright © 2012 Mediovski.pl Sp. z o.o.
 * @author - Paweł Kaczmarek
 *
 */

(function($) {
    $.fn.svgEditor = function(options) {
        var settings = $.extend({
            width : 640,
            height : 400,
            data : [],
            paths : [],
            points : [],
            upload : {
                url : null,
                secureurl : false
            },
            afterSend : function() {}
        }, options);
        
        settings = jQuery.extend(settings, options || {});
        var config = settings;
        var $this = this;

        // upload template
        $.ajax({
            url : 'svg-template.html',
            success : function(data) {
                $this.html(data);

                var t = setTimeout(function() {
                    initEditor();
                    $this.find('.loading').remove();
                }, 2000)
            }
        });

        function initEditor() {
            return $this.each(function() {
                var zoom = 1, imgW = 0, imgH = 0;

                var attr = {
                    fill : "#EE0425",
                    opacity : 0.8,
                    stroke : "#444",
                    "stroke-width" : 1,
                    "stroke-linejoin" : "miter"
                };

                function setPaperSize(w, h) {
                    var w = w || config.width;
                    var h = h || config.height;
                    $this.find('#paper').animate({
                        width : w,
                        height : h
                    }, 200);
                    $this.find('#svg-editor').animate({
                        // width : w < 740 ? 740 : w + 120,
                        // height : h < 360 ? 360 : h + 160,
                    }, 200);
                }

                setPaperSize();

                var R = Raphael("paper", config.width, config.height);

                $this.find('#zoom-select').bind('change', function() {
                    zoom = $(this).find('option:selected').attr('value');

                    setPaperSize(config.width * zoom, config.height * zoom);
                    R.setSize(config.width * zoom, config.height * zoom)
                    R.setViewBox(0, 0, config.width, config.height, true);
                    $this.find('.uploaded-img').animate({
                        width : imgW * zoom
                    }, 200);

                }).change();

                $this.find('#paper').bind('click', function(e) {
                    var offset = $(this).offset();
                    var x = parseInt(e.pageX - offset.left, 10);
                    var y = parseInt(e.pageY - offset.top, 10);
                    if($this.find('#tool-draw').hasClass('active')) {
                        drawCircle(parseInt(x / zoom, 10), parseInt(y / zoom, 10));
                        preparePath(parseInt(x / zoom, 10), parseInt(y / zoom, 10));
                        $this.find('#temp-point').html('');
                    } else if($this.find('#tool-point').hasClass('active')) {
                        $this.find('#temp-point').html(parseInt(x / zoom, 10) + '-' + parseInt(y / zoom, 10));

                    } else if($this.find('#tool-zoom').hasClass('active')) {
                        var selected = $this.find('#zoom-select option:selected');
                        if(zoom < $this.find('#zoom-select option:last').attr('value')) {
                            $this.find('#zoom-select option').removeAttr('selected');
                            selected.next().attr('selected', 'selected');
                        } else {
                            $this.find('#zoom-select option').removeAttr('selected');
                            $this.find('#zoom-select option:first').attr('selected', 'selected');
                        }
                        $this.find('#zoom-select').change();
                    }

                });
                var path = $this.find('#svg-editor-console').html();
                function preparePath(x, y) {
                    path += x + ',' + y + 'L';
                    return createFullPath(path);
                }

                function clearPath() {
                    path = '';
                    return createFullPath(path);
                }

                function createFullPath(path) {
                    var mPath = path.replace(/(\s+)?.$/, "");
                    // remove last chart
                    var fullPath = 'M' + mPath + 'Z';
                    $('#svg-editor-console').html(fullPath);
                    return drawPath(fullPath);
                }

                var shape = $this.find('.shape');
                function removePath() {
                    shape.remove();
                }

                function clearAll() {
                    R.remove();
                    R = Raphael("paper", config.width * zoom, config.height * zoom);
                    $this.find('#zoom-select').change();
                }

                var dots = $this.find('.dots');
                function drawCircle(x, y, r) {
                    var r = r || 2;
                    dots = R.circle(x, y, r).attr(attr).attr({
                        fill : "#0f0",
                        opacity : 0.6
                    });
                }

                function drawPoint(x, y, r) {
                    var r = r || 3;
                    dots = R.circle(x, y, r).attr(attr).attr({
                        fill : "#00f",
                        opacity : 0.9
                    });
                }

                function drawPath(path) {
                    removePath();
                    shape = R.path(path).attr(attr).attr({
                        fill : "#f60",
                        opacity : 0.6
                    });
                }(function insertData() {
                    $this.find('#select-data').html('<option></option>');
                    for(var i = 0; i < config.data.length; i++) {
                        $this.find('#select-data').append('<option id="' + config.data[i].points.x + '-' + config.data[i].points.y + '" value="' + config.data[i].path + '">' + config.data[i].name + '</option>');
                        config.paths.push(config.data[i].path);
                        var dataPoints = config.data[i].points.x + '-' + config.data[i].points.y;
                        config.points.push(dataPoints);
                    }
                })();
                (function addNewName() {
                    $this.find('#add-new-name').bind('click', function() {
                        var newPath = $.trim($('#temp-path').text());
                        var newPoint = $.trim($('#temp-point').text());
                        var newName = $('#input-data').val();
                        if(newName.length > 0) {
                            $this.find('#select-data').append('<option id="' + newPoint + '" value="' + newPath + '">' + newName + '</option>');
                            $this.find('#input-data').val('');
                            $this.find('#dialog-box').fadeOut(200);
                            savePath();
                        }
                    });
                })();

                var savedPaths = $this.find('.savedPaths');
                function savePath() {
                    var savedPath = $this.find('#svg-editor-console').text();
                    if(savedPath.length > 5) {
                        config.paths.push(savedPath);
                    }

                    // console.log('paths:', paths)

                    var savedPoint = $this.find('#temp-point').text();
                    for(var i = 0; i < config.points.length; i++) {
                        if(config.points[i] == savedPoint)
                            config.points.splice(i, 1);
                    }
                    if(savedPoint.length > 2) {
                        config.points.push(savedPoint);
                    }

                    // console.log('points:', points)

                    clearAll();

                    for(var i = 0; i < config.paths.length; i++) {
                        savedPaths = R.path(config.paths[i]).attr(attr);
                    }

                    for(var i = 0; i < config.points.length; i++) {
                        var x = config.points[i].split('-')[0];
                        var y = config.points[i].split('-')[1];
                        drawPoint(x, y);
                    }

                    $this.find('#zoom-select').change();

                    // console.log('paths:', paths)

                    R.forEach(function(el) {
                        el.click(function() {
                            var thisPath = el.attr('path').toString();
                            if($('#tool-erase').hasClass('active')) {
                                removeElementFromArray(config.paths, thisPath);
                                removePathFromSelect(thisPath);

                                var thisPoint = el.attr('cx') + '-' + el.attr('cy');
                                removeElementFromArray(config.points, thisPoint);
                                removePointFromSelect(thisPoint);
                                $this.find('#temp-point').html('');
                                el.remove();
                            } else if($('#tool-point').hasClass('active')) {
                                $this.find('#temp-path').html(thisPath);
                                $this.find('#input-data').val('');
                                $this.find('#dialog-box').fadeIn(200);
                                assignPathToName();
                                drawPoint($this.find('#temp-point').html().split('-')[0], $this.find('#temp-point').html().split('-')[1]);
                            }
                        }).mouseover(function() {
                            var thisPath = el.attr('path').toString();
                            $this.find('#select-data option').each(function() {
                                if($(this).attr('value') == thisPath) {
                                    $this.find('#info-box').html($(this).text());
                                }
                            });
                        }).mouseout(function() {
                            $this.find('#info-box').html('');
                        });
                    });
                    //$('#temp-point').html('');
                    clearPath();
                }

                savePath();

                function removePointFromSelect(point) {
                    $this.find('#select-data option').each(function() {
                        if($(this).attr('id') == point) {
                            $(this).attr('id', '');
                        }
                    });
                }

                function removePathFromSelect(path) {
                    $this.find('#select-data option').each(function() {
                        if($(this).attr('value') == path) {
                            $(this).attr('value', '');
                        }
                    });
                }


                $this.find('#close-dialog').bind('click', function() {
                    $this.find('#dialog-box').fadeOut(200);
                    savePath();
                });
                function assignPathToName() {
                    $this.find('#select-data option').removeAttr('selected');
                    $this.find('#select-data option:first').attr('selected', 'selected');
                    $this.find('#select-data option').each(function() {
                        if($(this).attr('value') == $.trim($this.find('#temp-path').html())) {
                            $(this).attr('selected', 'selected');
                            var _that = $(this);
                            var t = setTimeout(function() {
                                _that.attr('id', $this.find('#temp-point').html());
                            }, 500);
                        }
                    });

                    $this.find('#select-data').bind('change', function() {
                        $(this).find('option:selected').attr('value', $this.find('#temp-path').html());
                        $(this).find('option:selected').attr('id', $this.find('#temp-point').html());
                        $this.find('#dialog-box').hide();
                        savePath();
                    }).bind('click', function() {
                        $this.find('#select-data option').each(function() {
                            if($(this).val().length > 0 && $(this).attr('id').length > 0) {
                                $(this).css({
                                    opacity : .5
                                })
                            } else {
                                $(this).css({
                                    opacity : 1
                                })
                            }
                        });
                    });
                    $this.find('#temp-point').html('');
                }

                function removeElementFromArray(arrayName, arrayElement) {
                    for(var i = 0; i < arrayName.length; i++) {
                        if(arrayName[i] == arrayElement)
                            arrayName.splice(i, 1);
                    }
                }

                function dragPath(path) {
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

                $this.find('#tools-left a').bind('click', function() {
                    $this.find('#tools-left a').removeClass('active');
                    $this.find(this).addClass('active');
                    $this.find('#paper').attr('class', $(this).attr('id'));
                });

                $this.find('#tool-clear').bind('click', function() {
                    $this.find('#temp-point').html('');
                    clearPath();
                    clearAll();
                    savePath();
                    return false;
                });

                $this.find('#tool-remove').bind('click', function() {
                    clearPath();
                    clearAll();
                    paths = [];
                    points = [];
                    $this.find('#temp-point').html('');
                    $this.find('#select-data').html('');
                    $this.find('.uploaded-img').remove();
                    return false;
                });

                $this.find('#tool-save').live('click', function() {
                    savePath();
                    return false;
                });
                function ajaxFileUpload() {
                    $this.find("#loading").ajaxStart(function() {
                        $(this).show();
                    }).ajaxComplete(function() {
                        $(this).hide();
                    });
                    imgW = null;
                    imgH = null;
                    $.ajaxFileUpload({
                        url : config.upload.url,
                        secureuri : config.upload.secureuri,
                        fileElementId : 'fileToUpload',
                        dataType : 'json',
                        success : function(data, status) {
                            if( typeof (data.error) != 'undefined') {
                                if(data.error != '') {
                                    alert(data.error);
                                } else {
                                    $this.find('.uploaded-img').remove();
                                    var img = new Image();
                                    img.onload = function() {
                                        var imgSrc = '<img class="uploaded-img" src="ajax/upload/' + data.msg + '" />'
                                        $('#paper').append(imgSrc);
                                        var t = setTimeout(function() {
                                            imgW = $this.find('.uploaded-img').width();
                                            imgH = $this.find('.uploaded-img').height();
                                            config.width = imgW;
                                            config.height = imgH;
                                            savePath();
                                        }, 500)
                                    };
                                    img.src = 'ajax/upload/' + data.msg;
                                }
                            }
                        },
                        error : function(data, status, e) {
                            alert(e);
                        }
                    })

                    return false;

                }

                function insertPhoto() {
                    $this.find('.uploaded-img').remove();
                    var img = new Image();
                    img.onload = function() {
                        var imgSrc = '<img class="uploaded-img" src="' + config.img + '" />'
                        $this.find('#paper').append(imgSrc);
                        imgW = $this.find('.uploaded-img').width();
                        imgH = $this.find('.uploaded-img').height();
                        config.width = imgW;
                        config.height = imgH;
                        savePath();
                    };
                    img.src = config.img;
                }

                if(config.img) {
                    insertPhoto();
                }

                $this.find('#buttonUpload').bind('click', function() {
                    ajaxFileUpload();
                    return false;
                });

                $this.find('#btn-ok').bind('click', function() {
                    if($this.find('#input-data').val().length > 0 || $this.find('#select-data option:selected').text().length > 0) {
                        $this.find('#add-new-name').click();
                        $this.find('#dialog-box').fadeOut(200);
                        savePath();
                    } else {
                        $this.find('#tool-clear').click();
                        $this.find('#dialog-box').fadeOut(200);
                    }

                    return false;
                });

                $this.find('#tool-send').bind('click', function() {

                    var allData = {
                        img : $this.find('.uploaded-img').attr('src'),
                        paths : config.paths,
                        points : config.points,
                        data : []
                    }
                    $this.find('#select-data option:not(#select-data option:first)').each(function() {
                        if($(this).val().length > 2) {
                            var dataObj = {
                                name : $(this).text(),
                                path : $(this).attr('value'),
                                points : {
                                    x : $(this).attr('id').split('-')[0],
                                    y : $(this).attr('id').split('-')[1]
                                }
                            }
                            allData.data.push(dataObj);
                        }

                    });

                    return config.afterSend(allData)

                });
            });
        }

    };
})(jQuery);
