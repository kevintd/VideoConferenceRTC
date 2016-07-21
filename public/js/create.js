'use strict';

var datePickerDownload;
var timeBoxDownload;
var datePickerEmail;
var timeBoxEmail;
var emailTokenField;
var roomUrl;
var host = HOST_ADDRESS; // HOST_IP gets injected into create.ejs from the server side when it is rendered

/*
$( document ).ready(function() {
    generateRoomUrl();

}); // end of document.ready
*/

$( document ).ready(function() {
	var currentDate = new Date();
    datePickerDownload = new JSDatePicker('datePickerEvent', currentDate.getMonth(), currentDate.getFullYear());
    datePickerDownload.onPickedDate(function(day,month,year) {
	   toggleDownloadButton(day);
    });
    
	timeBoxDownload = new JSTimeBox('timeStart');
    
    datePickerEmail = new JSDatePicker('datePickerEmail', currentDate.getMonth(), currentDate.getFullYear());
    datePickerEmail.onPickedDate(function(day,month,year) {
	   toggleSendInvitationButton();
    });
	timeBoxEmail = new JSTimeBox('timeStartEmail');
    
    emailTokenField = new JSTokenField('emailTokenField');
    emailTokenField.onChange(function(content) {
        toggleSendInvitationButton();
    });
    
    // add validator to verify if a token text is an email address
    emailTokenField.setValidator(function(text) {
	    return validateEmail(text);
    });
    
    $("#eventDownloadButton").on("click",function callback(e) {
        createCalendarEvent();
    });
    
    $("#attachCalendarCheckBox").on("change",function callback(e) {
	   	toggleEmailCalendar();
	});
    
    $("#sendInvitationButton").on("click",function callback(e) {
        sendInvitations();
	});

    toggleEmailCalendar();
    
    generateRoomUrl();

}); // end of document.ready

/**
 * Toggles the datepicker, time and event description when the user chooses to
 * attach an iCalendar event with the invitation email.
 * Triggered by the checkbox.
 *
 */
function toggleEmailCalendar() {
	if($("#attachCalendarCheckBox").is(':checked')==true) {
	    $("#emailCalendarWrapper").addClass("visible");
    } else {
	    $("#emailCalendarWrapper").removeClass("visible");
    }
    toggleSendInvitationButton();
}

/**
 * If not day is selected in the Event Creation datepicker (day == -1)
 * disable the download button. Otherwise enable it.
 * 
 * @param day The day received from the datePickerDownload.
 */
function toggleDownloadButton(day) {
	if (day!=-1) {
	   $("#eventDownloadButton").removeClass("disabled"); 
    } else {
	   $("#eventDownloadButton").addClass("disabled");
    }
}

/**
 * Disable the send button when no email addresses are available.
 * If if email addresses are available but the user chose to include an event
 * with no day selected in the datepicker (day == -1)
 * disable the send button.
 * 
 *
 */
function toggleSendInvitationButton() {
    var emails = emailTokenField.getContent();
    var day = datePickerEmail.getSelectedDate()[0];
    var checkDate = $("#attachCalendarCheckBox").is(':checked');
    
	if (emails.length == 0 || (checkDate && day == -1)) {
        $("#sendInvitationButton").addClass("disabled");
    } else {
        $("#sendInvitationButton").removeClass("disabled"); 
    }
}

/**
 * Creates an event for download when the user clicks on the download event button.
 * 
 * 
 *
 */
function createCalendarEvent() {
	var pickedDate = datePickerDownload.getSelectedDate();
    var year = pickedDate[2];
    var month = pickedDate[1];
    var day = pickedDate[0];
    var hours = timeBoxDownload.getHours();
    var minutes = timeBoxDownload.getMinutes();
    var start = new Date(year, month, day, hours, minutes, 0, 0);

	var location = roomUrl;
	var summary = "UberTok meeting";
	var description = $("#eventDescription").val();

    var event = new JSEvent(description, start, start, location, summary);
    var link = event.getADownloadElement('UberTok meeting', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Send invitations. Create an event (if neccessary) and send the information to the server.
 *
 */
function sendInvitations() {
	var sckt = io.connect(host);
	
	sckt.on ('email-success', function (msg) {
		document.getElementById('responseMessage').setAttribute('class', 'visible');
        document.getElementById('responseMessage').innerHTML = msg;
		setTimeout("document.getElementById('responseMessage').innerHTML =''; document.getElementById('responseMessage').setAttribute('class', 'hide');",5000);
	});

	// Content
    var receivers = emailTokenField.getValidContent().join(", ");
    var message = $("#emailMessage").val();
    
    // Check if we need to include an iCalendar event
    var checkDate = $("#attachCalendarCheckBox").is(':checked');
	if (checkDate) {
	    // Event Information
		var pickedDate = datePickerEmail.getSelectedDate();
	    var year = pickedDate[2];
	    var month = pickedDate[1];
	    var day = pickedDate[0];
	    var hours = timeBoxEmail.getHours();
	    var minutes = timeBoxEmail.getMinutes();
	    var start = new Date(year, month, day, hours, minutes, 0, 0);
		var location = roomUrl;
		var summary = "UberTok meeting";
		var description = $("#eventDescriptionEmail").val();
		
		sckt.emit('invitation', {	message: message, 
	    							roomUrl: roomUrl, 
									to: receivers,
									eventDescription: description,
									eventSummary: summary,
									eventStart: start
	    						});
	} else {	
	    sckt.emit('invitation', {message: message, roomUrl: roomUrl, to: receivers});
	}
}

/**
 * Returns true if value is a valid email address
 *
 * @params value A text value that should be validated if it corresponds to a valid email address.
 */
function validateEmail(value) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
} 


/**
 * Generates a random string of length 6. Example: qyvf2x 
 *
 * We need this for the room URL (e.g. http://www.ubertok.com/room/qyvf2x)
 *
 */
function shortUrl() {
    return ("000000" + (Math.random()*Math.pow(36,6) << 0).toString(36)).slice(-6)
}

function haiku(){
	var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
	"dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
	"winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
	"blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
	"long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
	"red", "rough", "still", "small", "sparkling", "shy",
	"wandering", "withered", "wild", "black", "young", "holy", "solitary",
	"fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
	"polished", "ancient", "purple", "lively", "nameless"];
	
	var nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
	"morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
	"glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
	"brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
	"firefly", "feather", "grass", "haze", "mountain", "night", "pond",
	"darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
	"thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
	"sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
	"frog", "smoke", "star"];
	
	var unix = Math.round(+new Date()/1000)+Math.floor(Math.random()*(Math.round(+new Date()/1000)));  
	var stamp = (""+unix).slice(-5);
	
	return adjs[Math.floor(Math.random()*(adjs.length-1))]+"-"+nouns[Math.floor(Math.random()*(nouns.length-1))]+"-"+stamp;
}

/**
 * Set the href for the room
 *
 *
 */
function generateRoomUrl() {
    var room = haiku();
	var link = document.getElementById("room-url");
	roomUrl =  'http://'+window.location.host+'/'+room;
	link.href = roomUrl;
	link.innerHTML = roomUrl;
}

'use strict';

var JSDatePicker = function(calendarId, month, year) {
    var exports = {};
    var _onPickedDateCallback;
    var _calendar;
    var _month;
    var _year = year;
    var _weekDays;
    var _months;
    var _lastSelectedDay = -1;
    var _lastSelectedMonth = -1;
    var _lastSelectedYear = -1;
    var _currentDate;
    
    _weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    _months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    _currentDate = new Date();
    _calendar = document.getElementById(calendarId);
    _month = month;
    
    // Setup calendar
    addHeader(_month,_year);
    addWeekDays();
    showMonth(_month,_year);
    
    /**
     * Add the calendar header which includes the 'back', 'title' and 'next' cells.
     *
     * Bind an onclick event to the 'back' and 'next' buttons.
     *
     * @param month the month to display
     * @param year  the year to display
     */
    function addHeader(month, year) {
        var headerElement = document.createElement("div");
        headerElement.className = "header";
        
        var backCellElement = document.createElement("div");
        backCellElement.className = "headerCell backCell";
        var backElement = document.createElement("div");
        backElement.className = "back";
        backElement.addEventListener("click",function() {
            _month--;
            if (_month<0) {
                _month = 11;
                _year--;
            }
            showMonth(_month,_year);
        });
        backCellElement.appendChild(backElement);
        headerElement.appendChild(backCellElement);
        
        var titleCellElement = document.createElement("div");
        titleCellElement.className = "headerCell titleCell";
        
        var titleElement = document.createElement("div");
        titleElement.className = "title";
        titleElement.appendChild(document.createTextNode(_months[month]+', '+year));    
        titleCellElement.appendChild(titleElement);
        headerElement.appendChild(titleCellElement);
        
        var nextCellElement = document.createElement("div");
        nextCellElement.className = "headerCell nextCell";
        
        var nextElement = document.createElement("div");
        nextElement.className = "next";
        nextElement.addEventListener("click",function() {
            _month++;
            if (_month>11) {
                _month = 0;
                _year++;
            }
            showMonth(_month,_year);
        });
        
        nextCellElement.appendChild(nextElement);
        headerElement.appendChild(nextCellElement);
        
        _calendar.appendChild(headerElement);
    }
    
    /**
     * Display the week days (Mon, Tue, etc).
     *
     * 
     *
     */
    function addWeekDays() {
        var weekElement = document.createElement("div");
        weekElement.className = "week";
        
        for (var i=0; i<_weekDays.length; i++) {
            var weekDayWrapperElement = document.createElement("div");
            weekDayWrapperElement.className = "weekDayWrapper";
            
            var weekDayElement = document.createElement("div");
            weekDayElement.className = "weekDay";
            weekDayElement.appendChild(document.createTextNode(_weekDays[i]));
            
            weekDayWrapperElement.appendChild(weekDayElement);
            weekElement.appendChild(weekDayWrapperElement);
        }
        _calendar.appendChild(weekElement);
    }
    
    /**
     * Shows the days of the month (e.g.: 1..31).
     *
     * Bind an onclick event to every 'day' element that triggers the '_onPickedDateCallback' callback function
     *
     * @param month the month to display
     * @param year  the year
     */
    function showMonth(month, year) {
        console.log('Showing month '+month+' of year '+year);
        
        // onclick event handler
        var onclickWrapper = function(day, month, year) {
            return function callback() {
                var d = day;
                var m = month;
                var y = year;
                pickedDate(this, d, m, y);
            }
        }
            
        // Update header title to show correct month
        var title = _calendar.getElementsByClassName('title');
        title[0].innerHTML = _months[month]+', '+year;
        
        // Remove current day elements
		removeDays();
        
        // Find out what day of the week the first of the month is. Sunday is day 0, Monday is day 1, and so on.
        var first = (new Date(year, month, 1)).getDay();
        first = (first + 6)%7;
        var previousYear = year;
        var previousMonth = month - 1;
        if (previousMonth < 0) {
            previousMonth = 11;
            previousYear = previousYear--;
        }  

        // When the 1st of the requested month is day 5, we need to fill days 0-4 with the
        // last 5 days of the previous month.
        var daysPreviousMonth = 32 - new Date(previousYear, previousMonth, 32).getDate();
        for (var i=first-1; i>=0; i--) {
            var dayWrapperElement = document.createElement("div");
            dayWrapperElement.className = "dayWrapper";
            
            var dayElement = document.createElement("div");
            dayElement.className = "day previousMonth";

            var day = daysPreviousMonth - i;
            dayElement.appendChild(document.createTextNode(day));

			// Check if we have selected this date before changing months. If so selected it again.
	        if (day==_lastSelectedDay && previousMonth == _lastSelectedMonth && previousYear == _lastSelectedYear) {
		        dayElement.classList.add('selected');
	        }
        
			if (day==_currentDate.getDate() && previousMonth == _currentDate.getMonth() && previousYear == _currentDate.getFullYear()) {
		        dayElement.classList.add('currentDay');
	        }
	        
            dayElement.addEventListener("click",onclickWrapper(day,previousMonth,previousYear));           
            dayWrapperElement.appendChild(dayElement);
            _calendar.appendChild(dayWrapperElement);
        }
        
		// Fill in the day for the requested month
        var daysCurrentMonth = 32 - new Date(year, month, 32).getDate();
        for (var day=1; day<=daysCurrentMonth; day++) {
            var dayWrapperElement = document.createElement("div");
            dayWrapperElement.className = "dayWrapper";
            
            var dayElement = document.createElement("div");
            dayElement.className = "day";
            dayElement.appendChild(document.createTextNode(day));
            
            if (day==_lastSelectedDay && month == _lastSelectedMonth && year==_lastSelectedYear) {
				dayElement.classList.add('selected');
        	}
        
			if (day==_currentDate.getDate() && month == _currentDate.getMonth() && year == _currentDate.getFullYear()) {
		        dayElement.classList.add('currentDay');
	        }
	        
            dayElement.addEventListener("click",onclickWrapper(day, month, year));
            dayWrapperElement.appendChild(dayElement);
            _calendar.appendChild(dayWrapperElement);
        }
        
        // Fill rest of grid with the days of the next month
        var nextYear = year;
        var nextMonth = month + 1;
        if (nextMonth>11) {
            nextMonth = 0;
            nextYear++;
        }
        var rows = 6; // Number of rows we want to show in our grid 
        var gridSize = rows*_weekDays.length;        
		var rest = gridSize  - (daysCurrentMonth + Math.max(0,first));
        for (var day=1; day<=rest; day++) {
            var dayWrapperElement = document.createElement("div");
            dayWrapperElement.className = "dayWrapper";
            
            var dayElement = document.createElement("div");
            dayElement.className = "day nextMonth";
            
            dayElement.appendChild(document.createTextNode(day));
            
            if (day==_lastSelectedDay && nextYear == _lastSelectedMonth && nextYear==_lastSelectedYear) {
				dayElement.classList.add('selected');
        	}
        	
        	if (day==_currentDate.getDate() && nextMonth == _currentDate.getMonth() && nextYear == _currentDate.getFullYear()) {
		        dayElement.classList.add('currentDay');
	        }
	        
            dayElement.addEventListener("click",onclickWrapper(day,nextMonth,nextYear));  
            dayElement.appendChild(document.createTextNode('')); 
            dayWrapperElement.appendChild(dayElement);
            _calendar.appendChild(dayWrapperElement);
        }
    }
    
    ////////////////////////////////////////////////
    // HELPERS
    ////////////////////////////////////////////////
    
    /**
     * Delete any current 'day' elements in the _calendar
     *
     * 
     *
     */
    function removeDays() {
	    // Remove any existing days
        var days = _calendar.getElementsByClassName('dayWrapper');
        while(days[0]) {
            days[0].parentNode.removeChild(days[0]);
        }

    }
    
    /**
     * Unselectd any current selected 'day' elements in the _calendar
     *
     * 
     *
     */
    function clearSelections() {
        var days = _calendar.getElementsByClassName('day');
        for (var i=0; i<days.length; i++) {
            if (days[i].classList.contains('selected')) {
                days[i].classList.remove('selected');   
            }
        } 
    }
     
    ////////////////////////////////////////////////
    // HANDLERS
    //////////////////////////////////////////////// 

    /**
     * Called in onClick() of a 'day' element.
     *
     * @param element the DOM element
     * @param day the picked day (1,2,3,4, etc)
     * @param month the picked month (0..11)
     * @param year the picked year
     */
    function pickedDate(elem, day, month, year) {
        clearSelections();
        if (day != _lastSelectedDay || month != _lastSelectedMonth || year != _lastSelectedYear) {
	        elem.classList.add('selected');
	        _lastSelectedDay = day;
	        _lastSelectedMonth = month;
	        _lastSelectedYear = year;
        } else {
	    	_lastSelectedDay = -1;
	    	_lastSelectedMonth = -1;
	    	_lastSelectedYear = -1;
	    }
        _onPickedDateCallback(_lastSelectedDay, _lastSelectedMonth, _lastSelectedYear);
    }   
    
    ////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////
    
    /**
     * Public method used for setting a callback method that should be called when a
     * day gets selected.
     * 
     *
     */
    function onPickedDate(callback) {
        _onPickedDateCallback = callback;
    }   
     
    /**
     * Returns an array ([day, month, year]) representation of the current selected date.
     * 
     * If no date is selected array value is [-1, -1, -1]
     *
     */
    function getSelectedDate() {
	    return [_lastSelectedDay, _lastSelectedMonth, _lastSelectedYear];
    }
    
    ////////////////////////////////////////////////
    // EXPORT PUBLIC METHODS
    ////////////////////////////////////////////////
    
    exports.onPickedDate    = onPickedDate;
    exports.getSelectedDate = getSelectedDate;
    return exports;
}

'use strict';

var JSEvent = function(description, start, end, location, summary) {
	var exports = {};
	
	var _event = createEvent(description, start, end, location, summary);
	
	function createEvent(description, start, end, location, summary) {
		var _SEPARATOR = "\r\n";
		var _CALENDARSTART = ["BEGIN:VCALENDAR", "VERSION:2.0"].join(_SEPARATOR);
		var _CALENDAREND = ["END:VCALENDAR"].join(_SEPARATOR);
	
        var start_date      = start;
        var end_date        = new Date(end);
        var start_year      = ("0000" + (start_date.getFullYear().toString())).slice(-4);
        var start_month     = ("00" + ((start_date.getMonth() + 1).toString())).slice(-2);
        var start_day       = ("00" + ((start_date.getDate()).toString())).slice(-2);
        var start_hours     = ("00" + (start_date.getHours().toString())).slice(-2);
        var start_minutes   = ("00" + (start_date.getMinutes().toString())).slice(-2);
        var start_seconds   = ("00" + (start_date.getMinutes().toString())).slice(-2);
        var end_year        = ("0000" + (end_date.getFullYear().toString())).slice(-4);
        var end_month       = ("00" + ((end_date.getMonth() + 1).toString())).slice(-2);
        var end_day         = ("00" + ((end_date.getDate()).toString())).slice(-2);
        var end_hours       = ("00" + (end_date.getHours().toString())).slice(-2);
        var end_minutes     = ("00" + (end_date.getMinutes().toString())).slice(-2);
        var end_seconds     = ("00" + (end_date.getMinutes().toString())).slice(-2);
        
        var start_time = '';
        var end_time = '';
        if (start_minutes + start_seconds + end_minutes + end_seconds != 0) {
            start_time = 'T' + start_hours + start_minutes + start_seconds;
            end_time = 'T' + end_hours + end_minutes + end_seconds;
        }
        
        var dtstart = start_year + start_month + start_day + start_time;
        var dtend = end_year + end_month + end_day + end_time;
    
		var event = [
                'BEGIN:VEVENT',
                'CLASS:PUBLIC',
				'DESCRIPTION:' + description,
                'DTSTART;VALUE=DATE-TIME:' + dtstart,
                'DTEND;VALUE=DATE-TIME:' + dtend,
                'LOCATION:' + location,
                'SUMMARY;LANGUAGE=en-us:' + summary,
                'TRANSP:TRANSPARENT',
                'END:VEVENT'
            ].join(_SEPARATOR);
            
        return _CALENDARSTART + _SEPARATOR + event + _SEPARATOR + _CALENDAREND;
	}

	////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////
    
    /**
     * Returns a download URL which can be opened using 'window.open(event.downloadLink());' 
     *
     * 
     *
     */
    function downloadLink() {
	    return  "data:text/calendar;charset=utf8," + escape(_event);
    }	
    
    /**
     * Returns an HTML <a download='fileName'>linkName</a> element
     * One can use this method to create a download link, click it to trigger the download
     * and then remove it again from the DOM. This method appends the extension ".ics" to fileName.
     * 
     * Example usage:
     * var link = event.getADownloadElement('foobubble_event', 'Import event to Calendar');
     * document.body.appendChild(link);
     * link.click();
     * document.body.removeChild(link);
     *
     * @param fileName the file name to show when the user clicks to download 
     * @param linkName the link text
     *
     */
    function getADownloadElement(fileName, linkName) {
		var link = document.createElement("a");
		link.href = downloadLink();
		link.download = fileName + ".ics";
        return link;
    }	
    
	////////////////////////////////////////////////
    // EXPORT PUBLIC METHODS
    ////////////////////////////////////////////////
    
    exports.downloadLink        = downloadLink;
    exports.getADownloadElement = getADownloadElement;
    
	return exports;
}

'use strict';

/**
 * Constructor for our JSTimeBox.
 *
 * @param timeBoxId The DOM id of the element (e.g. a 'div') that should hold our JSTimeBox elements.
 */
var JSTimeBox = function(timeBoxId) {
	var exports = {};
	var _timeBox = document.getElementById(timeBoxId);
	var _placeHolder = "Time";
    var _hours = null;
    var _minutes = null;
    var _ampm = null;
	var _input = document.createElement("input");
	_input.type = "text";
	_input.placeholder = _placeHolder
	_input.className = "timeBoxInput"; // set the CSS class
	
	_input.onfocus = function() {
		if (this.value == "") {
			this.placeholder = "";
		}
	}

	_input.onblur = function() {
		if (this.value == "") {
			this.placeholder = _placeHolder;
			_hours = null;
			_minutes = null;
			_ampm = null;
		} else {
			var time = formatTime(this.value);
			if (time == "") {
				this.placeholder = _placeHolder;
				_hours = null;
				_minutes = null;
				_ampm = null;
			}
			this.value = time;
		}
	}
	
	_timeBox.appendChild(_input); // put it into the DOM
	
	/**
	 * Converts from a 24-hour clock to 12-hour clock format.
	 *
	 * Takes a time value in the format H:M, HH:M, HH:  MM, HH:M PM, HH:MAM, HHMM, HH:, H, HH, :MM, etc and formats it to HH:MM AM/PM
	 *
	 * @param value The text value to parse to a valid time format
	 */
	function formatTime(value) {
		console.log("Info: Value= '"+value+"'");
		
		var error = false;
		var NOON = 12; // less than NOON is 'am'. Equal or greater NOON is 'pm'
		
		// remove leading and trailing whitespaces first
		value = value.trim();
		
		// remove spaces within value
		value = value.replace(/\s/g, '');
		
		if (value == "") {
			console.log("Error: Value is empty");
			error = true;
		} else {
		
			if (value.indexOf(":") != -1)	{
				console.log("Info: Value is of the format _hours:_minutes");
				
				var parts = value.split(":");
				console.log("Info: First part '"+parts[0]+"' second part '"+parts[1]+"'");
				
				// Process first part
				if (isNaN(parts[0])) {
					console.log("Error: First part is NaN!");
					error = true;
				} else {	
					_hours = Number(parts[0]);
				} //fi isNaN(parts[0])
				
				// Process (possible) second part
				if (parts.length > 1) {	
					
					var ampmIndex = parts[1].indexOf("a");
					if (ampmIndex > -1) {
						_ampm = "am";
					} else if (parts[1].indexOf("p") > -1) {
						ampmIndex = parts[1].indexOf("p");
						_ampm = "pm";
					}
					
					if (ampmIndex > -1) {
						_minutes = parts[1].substring(0, Math.min(ampmIndex, 2));
					} else {
						_minutes = parts[1].substring(0, 2);
					}
					
					if (isNaN(_minutes)) {
						console.log("Error: Second part '"+parts[1]+"' is NaN!");
						error = true;
					}
				} else {
					_minutes = 0;
				}
				
			} else {
				console.log("Info: Value does not contain the split character ':'");
								
				// Value can may in the following format HHM, HHMM, 0000HHM, 00HHMM, HHMMpm, HHM pm, etc
				var ampmIndex = value.indexOf("a");
				if (ampmIndex > -1) {
					_ampm = "am";
				} else if (value.indexOf("p") > -1) {
					ampmIndex = value.indexOf("p");
					_ampm = "pm";
				}
				
				
				// If we have an "am", "a.m", "pm" or "p.m", etc we have to strip it out
				if (ampmIndex > -1) {
					value = value.substring(0, ampmIndex);
				}
				
				if (isNaN(value) == false) {
					// Remove leading zeros
					var strip;
					if (value.length == 3) {
						strip = '0' + Number(value);
					} else { 
						strip = '' + Number(value);
					}
					_hours = strip.substring(0, 2);
					_minutes = strip.substring(2, 4);
					if (_minutes == '') {
						_minutes = 0;
					}
					
				} else {
					console.log("Error: Value is NaN");
					error = true;
				}
			}// fi indexOf(':')
			
			
			if (_hours != null && _minutes != null) {
				_minutes = Number(_minutes);
				_hours = Number(_hours);
				
				console.log("Info: _hours: '"+_hours+"'  _minutes: '"+_minutes+"'");
				
				// _hours
				if (_hours > 24 || _hours < 0) {
					console.log("Error: _hours are not in the interval [0, 23]")	;
					_hours = 11;
					_minutes = 59;
					_ampm = "am";
				} else {
					if (_hours > NOON) {
						_hours = _hours - 12;
						_ampm  = "pm"; 
					} else if (_hours == NOON) {
						_ampm  = "pm";
					} else if (_hours == 0) {
						_hours = 12;
						_ampm  = "am";	
					} else {
						if (_ampm == null) {
							_ampm  = "am";
						}
					}	
				} // fi (_hours>24 ...)	
				
				
				
				// _minutes
				if (_minutes > 59 || _minutes < 0) {
					console.log("Error: _minutes are not in the interval [0, 59]")	;
					_minutes = 59;
				} else {
					if (_minutes < 10) {
						_minutes = "0" + _minutes;
					}
				}
				
				return _hours+":"+_minutes+" "+_ampm;
			}
			
			if (error) {
				return "";	
			}
		} // fi == ""
	}
	
    ////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////
    
    function getTime() {
        return _input.value;
    }
    
    function getHours() {
        return _hours;
    }
    
    function getMinutes() {
        return _minutes;
    }
    
	////////////////////////////////////////////////
    // EXPORT PUBLIC METHODS
    ////////////////////////////////////////////////
	exports.getTime     = getTime;
    exports.getHours    = getHours;
    exports.getMinutes  = getMinutes;
	return exports;
}


'use strict';

/**
 * Constructor for our JSTokenField.
 *
 * @param tokenFieldId The DOM id of the element (e.g. a 'div') that should hold our JSTokenField elements.
 */
var JSTokenField = function(tokenFieldId) {
	var exports = {};
	
	var _tokenField;
	var _input;
	var _SEPARATOR = ",";
    var _onChangeCallback = null;
    var _validatorFunction = null;
    
	_tokenField = document.getElementById(tokenFieldId);
	_input = document.createElement("input");
	_input.type = "text";
      
    ////////////////////////////////////////////////
    // INPUT FIELD EVENT HANDLING
    ////////////////////////////////////////////////
    
    _tokenField.onclick = function() {
        _input.focus();
    }
	
	_input.onfocus = function() {
		_tokenField.classList.add("focus");
	}

	_input.oninput = function(e) {
		var value = e.target.value;
		var tokens = value.split(_SEPARATOR);
		if (tokens.length>1) {
			this.value = "";
			createTokens(tokens);
		}
	}
	
    _input.onkeydown = function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) { //Enter keycode
            var value = e.target.value;
            var tokens = value.split(_SEPARATOR);
            this.value = "";
            createTokens(tokens);
        } else if( code == 8 || code == 46 ) { // Backspace or Delete keycode
            if (this.value == '') {
                // remove last token
                var remaining = _tokenField.getElementsByClassName('tokenWrapper');
                var last = remaining[remaining.length-1];
                if (typeof last != 'undefined') {
                    removeToken(last);
                }
            }
        }
    }
    
	_input.onblur = function(e) {
		_tokenField.classList.remove("focus");
		var value = e.target.value;
		var tokens = value.split(_SEPARATOR);
		this.value = "";
		createTokens(tokens);
		
	}

    ////////////////////////////////////////////////
    // APPEARANCE AND MAIN LOGIC
    ////////////////////////////////////////////////
    
	_tokenField.appendChild(_input); // put it into the DOM
	
	/**
	 * Generates and display token elements out of a given array of text elements
	 *
	 * 
	 * @param tokens An array containing the text values for each token to be created. Example: ['joe@email.com', 'alice@bob.com']
	 */
	function createTokens(tokens) {
		for (var i=0; i<tokens.length; i++) {
			var text = tokens[i];
			if (text != '') {
                var tokenWrapper = document.createElement("div");
				tokenWrapper.classList.add("tokenWrapper");

				var token = document.createElement("div");
				token.classList.add("token");
				
				// Validate text to see if we should mark the token as valid/invalid
				if (_validatorFunction != null && _validatorFunction(text)==false) {
					token.classList.add("invalid");
				} else {
					token.classList.add("valid");
				}
				
                tokenWrapper.appendChild(token);
                
				var close = document.createElement("div");
				close.classList.add("close");
				close.appendChild(document.createTextNode('âœ•')); 
				var onclickWrapper = function(w) {
		            return function callback() {
		                var ftokenWrapper = w;	
	                    removeToken(ftokenWrapper);
					}
		        }
                close.onclick = onclickWrapper(tokenWrapper);

				var tokenText = document.createElement("span");
				tokenText.classList.add("tokenText");
				tokenText.appendChild(document.createTextNode(text)); 
                
                token.appendChild(tokenText); 
				token.appendChild(close);    
				_tokenField.insertBefore(tokenWrapper, _input); 
                
                // Resize input field accordingly
                resizeInput(tokenWrapper);
			}
		}
        
        // Inform that number of tokens has changed
        if (_onChangeCallback != null) {
            _onChangeCallback(getContent());
        }
	}

    ////////////////////////////////////////////////
    // UTIL METHODS
    ////////////////////////////////////////////////
    
    /**
	 * Removes a token (tokenWrapper) and adjusts the width of the text input field.
	 *
	 * 
	 * @param tokenWrapper The tokenWrapper element to remove
	 */
    function removeToken(tokenWrapper) {					
        var ftokenWrapper = tokenWrapper;
        ftokenWrapper.parentNode.removeChild(ftokenWrapper);

        // find last token in list
        var remaining = _tokenField.getElementsByClassName('tokenWrapper');
        var last = remaining[remaining.length-1];
        if (typeof last != 'undefined') {
            resizeInput(last);
        } else {
            _input.style.width = 100+"%";
        }

        if (_onChangeCallback != null) {
            _onChangeCallback(getContent());
        }
    }
    
    /**
	 * Adjusts the width of the text input field based on the last tokenWrapper element.
	 *
	 * 
	 * @param tokenWrapper The last tokenWrapper element in the JSTokenField.
	 */
    function resizeInput(tokenWrapper) {
	    var xoffset = tokenWrapper.offsetLeft + tokenWrapper.offsetWidth - _tokenField.offsetLeft;
        var newWidth = (_tokenField.offsetWidth - xoffset - 20);
        if (newWidth<20) {
            newWidth = 100+"%";
            _input.style.width = newWidth;
        } else {
            _input.style.width = (newWidth/_tokenField.offsetWidth)*100+"%";
        }
    }
    
    ////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////
    
    /**
	 * Returns an array containing the text value of all the tokens in _tokenField.
	 *
	 * e.g. ['joe@mail.com', 'mike@awesome.com', 'alice@bob.com']
	 *
	 */
    function getContent() {
        var content = [];
        var tokens = _tokenField.getElementsByClassName('tokenText');
        for (var i=0; i<tokens.length; i++) {
            content.push(tokens[i].textContent);
        } 
        
        return content;
    }
    
    /**
	 * Returns an array containing the text value of all the tokens in _tokenField that are valid.
	 *
	 * e.g. ['joe@mail.com', 'mike@awesome.com', 'alice@bob.com']
	 *
	 */
    function getValidContent() {
        var content = [];
        var validTokens = _tokenField.getElementsByClassName('valid');
        for (var i=0; i<validTokens.length; i++) {
	        var tokenText = validTokens[i].getElementsByClassName('tokenText');
            content.push(tokenText[0].textContent);
        } 
        
        return content;
    }
    
    /**
	 * Returns an array containing the text value of all the tokens in _tokenField that are invalid.
	 *
	 * e.g. ['jddeeee', 'ssysgd']
	 *
	 */
    function getInvalidContent() {
        var content = [];
        var validTokens = _tokenField.getElementsByClassName('invalid');
        for (var i=0; i<validTokens.length; i++) {
	        var tokenText = validTokens[i].getElementsByClassName('tokenText');
            content.push(tokenText[0].textContent);
        } 
        
        return content;
    }
    
    /**
     * Public method used for setting a callback method that should be called when a
     * the values of the field get 'tokenized' (oninput, on enter-keydown, onblur, closing a token).
     * 
     * callback is of type function(content) where content represents the tokens in form of an array
     *
     * @param callback The callback function to call when the value of the JSTokeField changes
     */
    function onChange(callback) {
        _onChangeCallback = callback;
    }   
    
    /**
     * Set validator method that is called for every token generated.
     *
     * validator:
     * Type function(text)
     * validator should return true if text is valid, false otherwise.
     *
     * If validator returns true, tokens will appear normal, else tokens are represented as invalid.
     *
     * @param validator The validator function to call when each token is generated.
     */
    function setValidator(validator) {
	    _validatorFunction = validator;
    }
    
	////////////////////////////////////////////////
    // EXPORT PUBLIC METHODS
    ////////////////////////////////////////////////
    
    exports.getContent 			= 	getContent;
    exports.getValidContent 	=   getValidContent;
    exports.getInvalidContent 	= 	getInvalidContent;
    exports.onChange    		= 	onChange;
    exports.setValidator 		= 	setValidator;
    
	return exports;
}