    // Device detection     
// the touchswitch variable below is used because iPhones bork on the click event sometimes. 
    var touchswitch = "onclick";
    var touchswitchend = "onclick";
    if (navigator.userAgent.match(/iPhone/i) != null) {
        var touchswitch = "ontouchstart";
        var touchswitchend = "ontouchend";
    }
    if (window.devicePixelRatio >= 2) {
        // var touchswitch = "ontouchstart";
        // var touchswitchend = "ontouchend";
    }
    if (navigator.userAgent.match(/iPad/i) != null) {
        var touchswitch = "ontouchstart";
        var touchswitchend = "ontouchend";
    }

    // alert(touchswitch);
