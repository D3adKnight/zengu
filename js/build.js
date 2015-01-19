$(function() {
	var isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent),
		isAndroid = /Android/i.test(navigator.userAgent);

	// Show video if desktop
	if(!isIOS && !isAndroid){
		var $video = $('.video_player');

		$('<source src="./assets/tengu.mp4" type="video/mp4">').appendTo($video);
		$('<source src="./assets/tengu.webm" type="video/webm">').appendTo($video);

		$video.css('visibility', 'hidden');

		$video.prop({
			autoplay: true,
            loop: true,
            volume: 1,
            muted: true,
            playbackRate: 1
		});

		$video.on('loadedmetadata', function(){
			$video.css("visibility", "visible");
		})
	}

	var music = document.getElementById('music'); // id for audio element
	var pButton = document.getElementById('pButton');
	
	var meditation_lines = $('p', "#meditationtext").hide().filter(":first").show().end();
	setTimeout(function() {
		var index = 0;
		setInterval(function() {
			meditation_lines.filter(":eq(" + index + ")").fadeOut(1000, function() {
				index++;
				if (index >= meditation_lines.length) {
					index=0;
				}
				meditation_lines.filter(":eq(" + index + ")").fadeIn(1000);
			});
		}, 3500);
	}, 1000);
	
	if (($.cookie('music')) == 'pause') {
		 pButton.className = "ion-android-volume-mute";
		 music.pause();
	} else {
		music.play();
	}
	
	$(pButton).click(function() {
		 // start music
		 if (music.paused) {
			 music.play();
			 // remove play, add pause
			 pButton.className = "ion-volume-high";
			 $.cookie('music', 'play');
		 } else { // pause music
			 music.pause();
			 $.cookie('music', 'pause');
			 pButton.className = "ion-android-volume-mute";
		 }
	});
	
    var _usd = 0.0183;
    var _euro = 0.015;
    var _plex = 1199;
    var _whisky = 8346;// http://winestyle.ru/products/Johnnie-Walker-Red-Label-with-box-swing.html
    var _rubRateInterval = null; // for retry

    /*
        olololo
     */
    var realRubRate = function(){
        $.getJSON('https://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22RUBUSD,RUBEUR%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=', function(json){
            if(_rubRateInterval)
            	clearInterval(_rubRateInterval);

            _usd = json.query.results.rate[0].Rate;
            _euro = json.query.results.rate[1].Rate;
            getRate();
        }).fail(function(){
            getRate();
            _rubRateInterval = setInterval(realRubRate, 300000); // try again 
        });
    };

	var getRate = function() {
        var url = "http://api.eve-central.com/api/marketstat/json?typeid=29984&typeid=29971&typeid=30050&typeid=30139&typeid=30124&typeid=30090"; // ship and subs
        url += "&typeid=10190&typeid=2048"; // 3xMagStabs, DC
        url += "&typeid=12058&typeid=3841&typeid=2301&typeid=2281"; // 10mn ab, 2xLSE, EM, 2xInvul
        url += "&typeid=3082"; // 6x250mm
        url += "&typeid=31796"; // rigs
        url += "&typeid=29668"; // plex

        //url = "http://api.eve-central.com/api/marketstat/json?typeid=1230"
		$.getJSON(url, function(json) {
			var price = json[0].sell.avg+json[1].sell.avg+json[2].sell.avg+json[3].sell.avg+json[4].sell.avg+json[5].sell.avg; // ship && subs
            price += 3*json[6].sell.avg+json[7].sell.avg; // low slots
            price += json[8].sell.avg+2*json[9].sell.avg+json[10].sell.avg+2*json[11].sell.avg; // mid
            price += 6*json[12].sell.avg; // high
            price += 3*json[13].sell.avg; // rigs
            var plex = json[14].sell.avg; // PLEX
            
            var r = (price * _plex) / plex;
            var RUB = (r).toFixed(2);
            RUB = RUB.replace('.', ",");

            var EURO = (r * _euro);
            EURO = Math.round(100/EURO).toString();
            EURO = EURO.replace('.', ",");
            var USD = (r * _usd);
            USD = Math.round(100/USD).toString();
            USD = USD.replace('.', ",");

            var BAR = Math.round(_whisky/r).toString();
            BAR = BAR.replace('.', ",");
			$.cookie('RUB', RUB);
			$.cookie('EURO', EURO);
			$.cookie('USD', USD);
			$.cookie('BAR', BAR);


			$('.course__item--rub').html(RUB + '<span>RUB for one unit</span>');
			$('.course__item--eur').html(EURO + '<span>units for 100 USD</span>');
			$('.course__item--usd').html(USD + '<span>units for 100 EURO</span>');
			$('.course__item--bar').html(BAR + '<span>units for Red Label (4.5L)</span>');
		});
	};
	
	setInterval(getRate, 60000);
	realRubRate();
});


/*
1 = 11.47
x = 100

 */
