             // set default image source as "library"
            var imageSource = localStorage.getItem("imageSource");
            if (imageSource == undefined || imageSource == null) {
                imageSource = "library";
                localStorage.setItem('imageSource', imageSource);
            }
             // set default color setting to "color"
            var colorSetting = localStorage.getItem("colorSetting");
            if (colorSetting == undefined || imageSource == null) {
                colorSetting = "colored";
                localStorage.setItem('colorSetting', colorSetting);
            }
            var colorSettingButton = localStorage.getItem("colorSetting");
            if (colorSettingButton == "bw") {
                $('#blacksetting').addClass('highlight');
                $('#colorsetting').removeClass('highlight');
            }
            if (colorSettingButton == "colored") {
                $('#blacksetting').removeClass('highlight');
                $('#colorsetting').addClass('highlight');
            }

            var camSource = localStorage.getItem("imageSource");
            if (camSource == "camera") {
                $('#source').removeClass('highlight');
                $('#source').removeClass('highlight');
                $('#camerasource').addClass('highlight');
            }
            if (camSource == "library") {
                $('#camerasource').removeClass('highlight');
                $('#promptsource').removeClass('highlight');
                $('#librarysource').addClass('highlight');
            }
            if (camSource == "prompt") {
                $('#camerasource').removeClass('highlight');
                $('#librarysource').removeClass('highlight');
                $('#promptsource').addClass('highlight');
            }

             // all 4 ID's must do the same thing because the z-index will be changing and you always want the top one to fire.
            $('#border').click(function() {
                reLayer(getRandNumb());
                remixOpacity();
            });
            $('#scratches').click(function() {
                reLayer(getRandNumb());
                remixOpacity();
            });
            $('#burn').click(function() {
                reLayer(getRandNumb());
                remixOpacity();
            });
            $('#vignette').click(function() {
                reLayer(getRandNumb());
                remixOpacity();
            });

            var jQT = new $.jQTouch({
              preloadImages: []
            });

            var image = Caman("#canvasImage", function() {});

            var animate = "off";
            animateOn();
            var app = {
                initialize: function() {
                    this.bindEvents();
                    if (!window.cordova) {
                        this.onDeviceReady();
                    }
                },
                bindEvents: function() {
                    if (window.cordova) {
                        document.addEventListener('deviceready', this.onDeviceReady, false);
                    }
                },

                // Device ready actions
                onDeviceReady: function() {
                    app.receivedEvent('deviceready');

                    // Don't forget to add the anlytics tracker here
                    if (window.analytics && analytics.startTrackerWithId) {
                        analytics.startTrackerWithId('UA-3989583-28'); // grungy = UA-3989583-28
                    }
                },
                receivedEvent: function(id) {
                    // put things that will happen when app is loaded here.
                }
            };

             // Analytics function

            function trackpage(pagename) {
                if (window.analytics && analytics.trackView) {
                    analytics.trackView(pagename);
                }
            }

             // This prevents the app from scrolling on an element. To use apply ontouchmove="BlockMove(event);" to the div you don't want to scroll

            function BlockMove(event) {
                event.preventDefault();
            }

            function onBodyLoad() {
                document.addEventListener("deviceready", onDeviceReady, false);
            }

            function onDeviceReady() {
                // pictureSource = navigator.camera.PictureSourceType;
                // destinationType = navigator.camera.DestinationType;
                // ScreenShot = ScreenShot.install();
            }

            function alertDismissed() {
                // do nothing
            }

            function showSuccessMessage(message) {
                if (navigator.notification && navigator.notification.alert) {
                    navigator.notification.alert(
                        message,
                        alertDismissed,
                        'Success!',
                        'OK'
                    );
                } else {
                    alert(message);
                }
            }

            function ensureUploadInput() {
                var input = document.getElementById('grungy-upload-input');
                if (!input) {
                    input = document.createElement('input');
                    input.type = 'file';
                    input.id = 'grungy-upload-input';
                    input.accept = 'image/*';
                    input.style.display = 'none';
                    input.addEventListener('change', function(event) {
                        var file = event.target.files && event.target.files[0];
                        if (!file) {
                            return;
                        }

                        var reader = new FileReader();
                        reader.onload = function(loadEvent) {
                            onPhotoURISuccess(loadEvent.target.result);
                        };
                        reader.readAsDataURL(file);

                        // Allow selecting the same file twice in a row.
                        event.target.value = '';
                    });
                    document.body.appendChild(input);
                }
                return input;
            }

            function chooseLocalImage() {
                ensureUploadInput().click();
            }

            function isCordovaCameraAvailable() {
                return !!(navigator.camera && window.Camera);
            }

            function parseBackgroundImageUrl(backgroundImage) {
                if (!backgroundImage || backgroundImage === 'none') {
                    return null;
                }

                var urlMatch = backgroundImage.match(/url\((['"]?)(.*?)\1\)/);
                return urlMatch ? urlMatch[2] : null;
            }

            function renderCompositionToCanvas(callback) {
                var sourceImage = document.getElementById('canvasImage');
                var outputCanvas = document.getElementById('currentphotoholder');
                var context = outputCanvas.getContext('2d');
                var width = sourceImage.naturalWidth || sourceImage.width || 612;
                var height = sourceImage.naturalHeight || sourceImage.height || 612;

                outputCanvas.width = width;
                outputCanvas.height = height;
                context.clearRect(0, 0, width, height);
                context.drawImage(sourceImage, 0, 0, width, height);

                var layerIds = ['vignette', 'burn', 'scratches', 'border'];
                var layers = [];

                for (var i = 0; i < layerIds.length; i++) {
                    var layerEl = document.getElementById(layerIds[i]);
                    if (!layerEl) {
                        continue;
                    }

                    var style = window.getComputedStyle(layerEl);
                    var imageUrl = parseBackgroundImageUrl(style.backgroundImage);
                    var alpha = parseFloat(style.opacity);
                    var zIndex = parseInt(style.zIndex, 10);

                    if (!imageUrl || isNaN(alpha) || alpha <= 0) {
                        continue;
                    }

                    layers.push({
                        src: imageUrl,
                        opacity: alpha,
                        zIndex: isNaN(zIndex) ? 0 : zIndex
                    });
                }

                layers.sort(function(a, b) {
                    return a.zIndex - b.zIndex;
                });

                function drawLayerAt(index) {
                    if (index >= layers.length) {
                        callback();
                        return;
                    }

                    var layer = layers[index];
                    var overlay = new Image();

                    overlay.onload = function() {
                        context.save();
                        context.globalAlpha = layer.opacity;
                        context.drawImage(overlay, 0, 0, width, height);
                        context.restore();
                        drawLayerAt(index + 1);
                    };

                    overlay.onerror = function() {
                        drawLayerAt(index + 1);
                    };

                    overlay.src = layer.src;
                }

                drawLayerAt(0);
            }

            function downloadCanvasImage() {
                var canvas = document.getElementById('currentphotoholder');
                var dataUrl = canvas.toDataURL('image/png');
                var filename = 'grungy-' + Date.now() + '.png';
                var link = document.createElement('a');
                link.href = dataUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            function captureScreen() {
                // Cordova path: keep original behavior for mobile builds.
                if (navigator.screenshot && navigator.screenshot.save && window.canvas2ImagePlugin) {
                    navigator.screenshot.save(function(error, res) {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('ok', res.filePath);
                            jpgToCanvas(res.filePath); // After the screencapture, convert then save.
                        }
                    }, 'jpg', 50);
                    return;
                }

                // Browser path: render composition to canvas and download.
                renderCompositionToCanvas(function() {
                    downloadCanvasImage();
                    showSuccessMessage('Grungy photo downloaded.');
                });
            }

            function jpgToCanvas(imagepath) {
                var canvas = document.getElementById('currentphotoholder');
                var context = canvas.getContext('2d');
                var imageObj = new Image();

                imageObj.onload = function() {
                    context.drawImage(imageObj, 0, 0);
                    saveToLibrary();
                };
                imageObj.src = imagepath;
            }

            function saveToLibrary() {
                window.canvas2ImagePlugin.saveImageDataToLibrary(
                    function(msg) {
                        console.log(msg);
                    },
                    function(err) {
                        console.log(err);
                    },
                    document.getElementById('currentphotoholder')
                );
                showSuccessMessage('Grungy photo saved.');
            }

             // function returnScreenshotImage(imageData) {
             //     localStorage.setItem('screenshot', imageData); // save the screenshot to local storage overwriting previous data
             //     // alert ('Image Saved');
             //     navigator.notification.alert(
             //         'Grungy image saved.',  // message
             //         alertDismissed,         // callback
             //         'Success!',            // title
             //         'OK'                  // buttonName
             //     );

             // }

            function newGrunge() {
                // Browser path: always choose a local image file.
                if (!isCordovaCameraAvailable()) {
                    chooseLocalImage();
                    return;
                }

                if (imageSource == "library") {
                    getPhoto();
                }
                if (imageSource == "camera") {
                    capturePhotoEdit();
                }
                if (imageSource == "prompt") {
                    navigator.notification.confirm('', // message
                        imageSourceChoice, // callback to invoke with index of button pressed
                        'Select image source:', // title
                        'Camera,Library' // buttonLabels
                    );
                }
            }

            function imageSourceChoice(button) {
                if (!isCordovaCameraAvailable()) {
                    chooseLocalImage();
                    return;
                }

                if (button == "1") {
                    capturePhotoEdit();
                }
                if (button == "2") {
                    getPhoto();
                }
            }

             // Camera

            function onCameraSuccess(imageURI) {
                // Uncomment to view the image file URI 
                console.log(imageURI);

                // Get image handle
                var canvasImage = document.getElementById('canvasImage');

                // Unhide image elements
                canvasImage.style.display = 'block';

                // Show the captured photo
                canvasImage.src = imageURI;
                Caman(imageURI, "#canvasImage", function() {

                    var colorSetting = localStorage.getItem("colorSetting");
                    if (colorSetting == "bw") {
                        this.greyscale();
                    }

                    this.render();
                });
                localStorage.setItem('currentPhoto', imageURI);
                // PhoneGap.exec("SaveImage.saveImage", imageURI); // this doesn't work
            }

             // Photo Library

            function onPhotoURISuccess(imageURI) {
                console.log(imageURI);

                // Get image handle
                var canvasImage = document.getElementById('canvasImage');

                // Unhide image elements
                canvasImage.style.display = 'block';

                // Show the captured photo
                canvasImage.src = imageURI;
                Caman(imageURI, "#canvasImage", function() {

                    var colorSetting = localStorage.getItem("colorSetting");
                    if (colorSetting == "bw") {
                        this.greyscale();
                    }

                    this.render();
                });
                localStorage.setItem('currentPhoto', imageURI);
                // PhoneGap.exec("SaveImage.saveImage", imageURI);
            }

            function capturePhotoEdit() {
                navigator.camera.getPicture(onPhotoURISuccess, onFail, {
						    quality : 50,
							  destinationType : Camera.DestinationType.FILE_URI,
							  sourceType : Camera.PictureSourceType.CAMERA,
							  allowEdit : true,
							  encodingType: Camera.EncodingType.JPEG,
							  targetWidth: 612,
							  targetHeight: 612,
							  saveToPhotoAlbum: false 
                });
            }

            function getPhoto() {
                // Retrieve image file location from specified source
                navigator.camera.getPicture(onPhotoURISuccess, onFail, {
						    quality : 50,
							  destinationType : Camera.DestinationType.FILE_URI,
							  sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
							  allowEdit : false,
							  encodingType: Camera.EncodingType.JPEG,
							  targetWidth: 612,
							  targetHeight: 612,
							  saveToPhotoAlbum: false 
                });
            }

             // Called if something bad happens.

            function onFail(message) {
                // alert('Failed because: ' + message);
            }

            function setColor(choice) {
                // alert (choice);
                localStorage.setItem('colorSetting', choice);
                if (choice == "bw") {
                    $('#colorsetting').removeClass('highlight');
                    $('#blacksetting').addClass('highlight');
                    bw();
                }
                if (choice == "colored") {
                    $('#blacksetting').removeClass('highlight');
                    $('#colorsetting').addClass('highlight');
                    color();
                }
            }

            function bw() {
                // this adds the "loading" overlay
                $.blockUI({
                    centerY: false,
                    message: '<img src="images/ajax-loader.gif" /> <br />Converting to black and white...',
                    css: {
                        width: '240px',
                        top: '100px',
                        left: '20px',
                        border: 'none',
                        padding: '15px',
                        backgroundColor: '#000',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        opacity: .9,
                        color: '#fff'
                    }
                });
                setTimeout($.unblockUI, 22000); // if the upload takes longer than 22 seconds, turn off the loading screen.
                Caman("#canvasImage", function() {
                    this.greyscale();
                    this.render(function() {
                        $.unblockUI(); // turn off overlay
                    });
                });
            }

            function color() {
                // this adds the "loading" overlay
                $.blockUI({
                    centerY: false,
                    message: '<img src="images/ajax-loader.gif" /> <br />Converting to color...',
                    css: {
                        width: '240px',
                        top: '100px',
                        left: '20px',
                        border: 'none',
                        padding: '15px',
                        backgroundColor: '#000',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        opacity: .9,
                        color: '#fff'
                    }
                });
                setTimeout($.unblockUI, 22000); // if the upload takes longer than 22 seconds, turn off the loading screen.
                var colorimage = localStorage.getItem('currentPhoto');
                Caman(colorimage, "#canvasImage", function() {
                    this.render(function() {
                        $.unblockUI(); // turn off overlay
                    });
                });
            }

            function animateOn() {
                animate = "on";
                grungeAnimate();
            }

            function grungeAnimate() {
                if (animate == "on") {
                    setTimeout(function() {
                        grungify();
                        setTimeout(function() {
                            grungeAnimate2();
                        }, 3000);
                    }, 1000);
                }
            }

            function grungeAnimate2() {
                if (animate == "on") {
                    setTimeout(function() {
                        ungrungify();
                        setTimeout(function() {
                            grungeAnimate();
                        }, 10);
                    }, 1000);
                }
            }

            function animateOff() {
                animate = "off";
            }


            function showNav() {
                $('#photonav').fadeIn('slow');
                $('#start').fadeOut('slow');
            }

            function hideNav() {
                $('#photonav').fadeOut('slow');
            }

            function getRandNumb() {
                var layer = Math.floor(Math.random() * 23);
                return (layer);
            }

            function onConfirm(button) {
                if (button == "1") {
                    localStorage.clear();
                    window.location.reload();
                }
                if (button == "2") {}
            }

            function resetApp() {
                if (navigator.notification && navigator.notification.confirm) {
                    navigator.notification.confirm('Settings will be reset.', // message
                        onConfirm, // callback to invoke with index of button pressed
                        'Are you sure?', // title
                        'OK,Cancel' // buttonLabels
                    );
                } else if (confirm('Settings will be reset.')) {
                    onConfirm("1");
                }
            }
