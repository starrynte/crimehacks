$(document).ready(function() {

	var settings = {
		percent : {
			ceiling : 95,
			floor : 5,			
		},
		decimal : {
			ceiling : 1.0,
			floor : 0.0,			
		},
		number : {
			ceiling : 100,
			floor : 0
		},
		sat : "100%",
		light : "40%",
		hue_top : 130,
		format : "percent",
		dir : "top"
	};

	var normalize = function(num) {
		if (num > 1)
			return 1;
		if (num < 0)
			return 0;
		return num;
	};

	var constructHsl = function(percent) {
		var hsl = "hsl(" + percent * settings.hue_top + ", " + settings.sat + ", " + settings.light + ")";
		return hsl;
	};

	$('.DNC').each(function(){
		var content = $(this).html();
		var format = $(this).attr("format");
		var dir = $(this).attr("dir");
		var most = parseFloat($(this).attr("most"));
		var least = parseFloat($(this).attr("least"));

		if (!format)
			format = settings.format;

		if (!dir)
			dir = settings.dir;

		if (!most)
			most = settings[format].ceiling;
		if (!least)
			least = settings[format].floor;

    	if (format == "percent") 
    		content = content.substring(0, content.length - 1);

    	var num = parseFloat(content);
    	var range = most - least;
    	if (range > 0) {
    		var percent = (num - least) / range;
    		percent = normalize(percent);

    		if (dir == "down")
    			percent = 1 - percent;

    		var hsl = constructHsl(percent);
    		$(this).css("color", hsl);
    	}
	});
});