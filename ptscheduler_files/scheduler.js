
// list of classes that employees are taking (just for reference)
var ptclasses = {};

// list of schedule objects for all employees
var schedules = {};

// list of assignment objects for all employees
var assignments = {};
var assignNames = {};

// list of all the classes to consider
var classes = [
    110,
    111,
    113,
    121,
    206,
    221,
    222,
    312,
    313,
    314,
    315,
    350
];

var assignmentData = "";

// dictionary of all labs
var labs = {}

// date abbreviations
var MO = 'MO';
var TU = 'TU';
var WE = 'WE';
var TH = 'TH';
var FR = 'FR';

// class abbreviation
var DEPT = 'CSCE';

$(document).ready(function(e) {

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        $('body').find('').remove();
        $('body').append('<h1>Please try a newer browser</h1>');
        alert("Some features are not supported in this browser");
           
    }

    // cache some fields
    var showByEmployee = $('#showByEmployee'),
        showByLab = $('#showByLab'),
        output = $('#outputTable'),
        files = $('#files'),
        loadFiles = $('#loadFiles'),
        labFile = $('#labFile'),
        dataFile = $('#dataFile'),
        saveButton = $('#saveButton'),
        helpButton = $('#helpButton'),
        employeeList = $('#employeeList');

    // add event listener to load lab data
    labFile.change(function(e) {
        e.preventDefault();
        var files = $('#labFile').get(0).files;

        for (var i = 0, f; f = files[i]; ++i) {
            var reader = new FileReader();
            reader.onload = (function(e) {
                var output = $('#outputTable');
                var labText = new String(e.target.result);
                labs = processLabs(labText);

                output.find("tr").remove(); 
                output.append("<tr><td><h4>Labs loaded successfully</h4></td></tr>"); 

                updateSidebar();
            });
            reader.readAsText(f);
        }
    });


    // add event listeners for display
    showByEmployee.click(displayByEmployees);

    // add event listeners for display
    showByLab.click(displayByLabs);

    helpButton.click(displayHelp);

    // add event listener to load data
    dataFile.change(function(e) {
        e.preventDefault();
        var files = $('#dataFile').get(0).files;

        for (var i = 0, f; f = files[i]; ++i) {
            var reader = new FileReader();
            reader.onload = (function(e) {
                var output = $('#outputTable');
                var assignObj= JSON.parse(e.target.result);
                assignments = assignObj.times;
                assignNames = assignObj.aNames;
                schedules = assignObj.scheduleObj;
                labs = assignObj.labTimes;
                ptclasses = assignObj.ptClass;

                output.find("tr").remove(); 
                output.append("<tr><td><h4>Data loaded successfully</h4></td></tr>"); 

                updateSidebar();
            });
            reader.readAsText(f);
        }
    });

    // generate download information to save data with
    saveButton.click(function(e) {
        location.href='data:application/download,' + encodeURIComponent(assignmentData);
    });
    
    // add event listener for loading file
    files.change(handleFileSelect);

    // some style stuff
    var buttons = $('div.menu').find('li');
    buttons.css('background','#0d5');
    buttons.on('mouseover',function() {
        var $this = $(this);
        $this.children('a').css('color','#ddd');
    });
    buttons.on('mouseout',function() {
        var $this = $(this);
        $this.children('a').css('color','#fff');
    });

    helpButton.on('mouseover',function() {
        var $this = $(this);
        $this.css('color','#ddd');
    });
    helpButton.on('mouseout',function() {
        var $this = $(this);
        $this.css('color','#fff');
    });
    
});

// load csv files from directory
function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = $('#files').get(0).files;

    var output = [];
    for (var i = 0, f; f = files[i]; ++i) {
        var reader = new FileReader();
        reader.onload = (createReaderFunction(f.name));

        reader.readAsText(f);
    }
}

function createReaderFunction(name) {
    return function(e) {
        (createEmployeeFunction(name))(e.target.result);
    };
}

// callback to display help information
function displayHelp(e) {
    e.preventDefault();
    var output = $('#outputTable');
    output.find("tr").remove(); 
    output.append("<tr><td ><h2>Help</h2></td></tr>"); 
    output.append("<tr><td onClick='displayScheduleHelp();'><u>Loading Schedules</u></td></tr>");
    output.append("<tr><td onClick='displayLabDataHelp();'><u>Loading Lab Data</u></td></tr>");
    output.append("<tr><td onClick='displaySavingRestoringHelp();'><u>Saving and Restoring Progress</u></td></tr>");
}

function displayScheduleHelp(e) {
    var output = $('#outputTable');
    output.find("tr").remove(); 
    output.append("<tr><td ><h2>Schedule Help</h2></td></tr>"); 
    output.append("<tr><td style='padding-bottom: 1em;' onClick='displayHelp({preventDefault: function() {} })'><u>&lt; Back to Help</u></td></tr>");
    output.append("<tr><td><h3>Schedule Format</h3></td></tr>");
    output.append("<tr><td>To download schedules in the correct format, first login to Howdy and go the the My Record Tab and click on My Schedule</td></tr>");
    output.append("<tr><td><img src='ptscheduler_files/imgs/my_schedule.png' width=500 height=400/></td></tr>");
    output.append("<tr><td>Make sure you are viewing the Student Schedule. It should like like this:</td></tr>");
    output.append("<tr><td><img src='ptscheduler_files/imgs/my_schedule_view.png' width=500 height=400/></td></tr>");
    output.append("<tr><td>On Windows, use Ctrl+A to select all the text on the page, then use Ctrl+C to copy the text. On Mac, use Command+A followed by Command+C.</td></tr>");
    output.append("<tr><td><img src='ptscheduler_files/imgs/my_schedule_selected.png' width=500 height=400/></td></tr>");
    output.append("<tr><td>On Windows, open Notepad and paste the text using Ctrl+V. On Mac, use open TextEdit and paste the text using Command+V</td></tr>");
    output.append("<tr><td><img src='ptscheduler_files/imgs/ScheduleText.png' width=500 height=400/></td></tr>");
    output.append("<tr><td>If you're using Mac and you see this in TextEdit, press Command+Shift+T so that it looks as above.</td></tr>");
    output.append("<tr><td><img src='ptscheduler_files/imgs/ScheduleWrong.png' width=500 height=400/></td></tr>");
    output.append("<tr><td>Save the file as yourname.txt</td></tr>");
    output.append("<tr><td><img src='ptscheduler_files/imgs/ScheduleSave.png' width=500 height=400/></td></tr>");
}

function displayLabDataHelp(e) {
    var output = $('#outputTable');
    output.find("tr").remove(); 
    output.append("<tr><td ><h2>Lab Data Help</h2></td></tr>"); 
    output.append("<tr><td style='padding-bottom: 1em;' onClick='displayHelp({preventDefault: function() {} })'><u>&lt; Back to Help</u></td></tr>");
    output.append("<tr><td>Hello</td></tr>");
}

// callback to display schedule by employee
function displaySavingRestoringHelp(e) {
    var output = $('#outputTable');
    output.find("tr").remove(); 
    output.append("<tr><td ><h2>Saving/Restoring Progress Help</h2></td></tr>"); 
    output.append("<tr><td style='padding-bottom: 1em;' onClick='displayHelp({preventDefault: function() {} })'><u>&lt; Back to Help</u></td></tr>");
    output.append("<tr><td>Hello</td></tr>");
}

// callback to display schedule by employee
function displayByEmployees(e) {
    e.preventDefault();
    var output = $('#outputTable');
    output.find("tr").remove(); 
    output.append("<tr><td colspan='2'><h2>Availability by PT</h2></td></tr>"); 
    for (var name in schedules) {
        output.append("<tr><td colspan='2'><h4>" + name + "</h4></td></tr>");
        for (var course in labs) {
            var conf = false;
            var assignconf = false;

            // add a checked checkbox if this class is already assigned
            if (assignNames[name].indexOf(course) > -1) {
                output.append("<tr><td><input type='checkbox' /><td>" + course + "</td></tr>");
                output.find('input').last().prop('checked',true);
                continue;
            }

            // loop through all the days for this lab
            var single = labs[course];
            for (var key in single) {

                // single[j][0] is the timeobj and single[j][1] is the day
                if (conflicts(schedules[name], single[key]["0"], single[key]["1"]))
                    conf = true;
                if (conflicts(assignments[name], single[key]["0"], single[key]["1"]))
                    assignconf = true;
            }
            if (!conf) {
                output.append("<tr><td><input type='checkbox' /></td><td class='cname'>" + course + "</td></tr>");
                if (assignconf) {
                    output.find('input').last().prop('disabled',true);    
                    output.find('.cname').last().css('color', '#808080');
                }
            }
        }
    }

    // add assignment checkbox event listener
    output.find('input').click(function(e) {
        var $this = $(this);

        // find out which person and course this checkbox pertains to
        var course = $this.parent().parent().find('td').last().text();
        var name = $this.parent().parent().prev();
        var i = 0;
        while (name.find('h4').text() == "" || i++ > 1000)
            name = name.prev();
        name = name.find('h4').text();


        // add or remove assignment
        if (this.checked) {
            // add name entry
            assignNames[name].push(course);

            // add time entry
            var single = labs[course];
            for (var key in single) {
                var time = single[key]["0"];
                var day = single[key]["1"];

                // add the timeobj associated with this day
                if (!assignments[name][day]) assignments[name][day] = [];
                assignments[name][day].push(time);
            }

        }
        else {
            // remove name entry
            var index = assignNames[name].indexOf(course);
            if (index > -1)
                assignNames[name].splice(index,1);

            // remove time entry
            var single = labs[course];
            for (var key in single) {
                var time = single[key]["0"];
                var day = single[key]["1"];

                // remove the timeobj associated with this day
                var index = -1;
                for (var j = 0, timeobj; timeobj = assignments[name][day][j]; j++) {
                    var match = 1;
                    for (var k = 0, v; v = timeobj[k]; k++) {
                        if (v != time[k])    
                            match = 0;
                    }
                    if (Boolean(match)) {
                        index = j;
                        break;
                    }
                }
                if (index > -1)
                    assignments[name][day].splice(index,1);
            }


        }

        updateSidebar();
        displayByEmployees(e);
    });


}

// callback to display by lab section when button clicked
function displayByLabs(e) {
    e.preventDefault();
    var output = $('#outputTable');
    output.find("tr").remove(); 
    output.append("<tr><td colspan='2'><h2>Availability by Lab</h2></td></tr>");
    for (var course in labs) {
        output.append("<tr>/tr>");
        var row = output.find('tr').last();
        row.append("<td colspan='2'><h4>" + course + "</h4></td>");

        // check all days
        for (var name in schedules) {

            // add a checked checkbox if this class is already assigned
            if (assignNames[name].indexOf(course) > -1) {
                output.append("<tr><td><input type='checkbox' /><td>" + name + "</td></tr>");
                output.find('input').last().prop('checked',true);
                continue;
            }

            var conf = false;
            var assignconf = false;
            var single = labs[course];

            // loop through all the days for this lab
            for (var key in single) {
                // single[j][0] is the timeobj and single[j][1] is the day
                if (conflicts(schedules[name], single[key]["0"], single[key]["1"]))
                    conf = true;
                if (conflicts(assignments[name], single[key]["0"], single[key]["1"]))
                    assignconf = true;
            }

            // display class if it doesn't conflict
            if (!conf) {
                output.append("<tr><td><input type='checkbox' /><td class='pname'>" + name + "</td></tr>");
                if (assignconf) {
                    output.find('input').last().prop('disabled',true);    
                    output.find('.pname').last().css('color', '#808080');
                }

            }
        }
    }

    // add assignment checkbox event listener
    output.find('input').click(function(e) {
        var $this = $(this);

        // find out which person and course this checkbox pertains to
        var name = $this.parent().parent().find('td').last().text();
        var course = $this.parent().parent().prev();
        var i = 0;
        while (course.find('h4').text() == "" || i++ > 1000)
            course = course.prev();
        course = course.find('h4').text();


        // add or remove assignment
        if (this.checked) {
            // add name entry
            assignNames[name].push(course);

            // add time entry
            var single = labs[course];
            for (var key in single) {
                var time = single[key]["0"];
                var day = single[key]["1"];

                // add the timeobj associated with this day
                if (!assignments[name][day]) assignments[name][day] = [];
                assignments[name][day].push(time);
            }

        }
        else {
            // remove name entry
            var index = assignNames[name].indexOf(course);
            if (index > -1)
                assignNames[name].splice(index,1);

            // remove time entry
            var single = labs[course];
            for (var key in single) {
                var time = single[key]["0"];
                var day = single[key]["1"];

                // remove the timeobj associated with this day
                var index = -1;
                for (var j = 0, timeobj; timeobj = assignments[name][day][j]; j++) {
                    var match = 1;
                    for (var k = 0, v; v = timeobj[k]; k++) {
                        if (v != time[k])    
                            match = 0;
                    }
                    if (Boolean(match)) {
                        index = j;
                        break;
                    }
                }
                if (index > -1)
                    assignments[name][day].splice(index,1);
            }


        }

        updateSidebar();
        displayByLabs(e);
    });
}

// creates an individual function to display assignment information for employee
function createDisplayEmployee(name) {
    return (function(e) {
        var output = $('#outputTable');
        output.find("tr").remove(); 
        output.append("<tr><td><h3>" + name + "</h3></td></tr>");
        output.append("<tr><td><h4>Assigned Courses</h4></td></tr>");
        if (assignNames[name].length == 0) {
            output.append("<tr><td>None so far</td></tr>");
        }
        for (var course in assignNames[name])
            output.append("<tr><td class='cname'>" + assignNames[name][course] + "</td></tr>");

        output.append("<br />");
        output.append("<tr><td><h4>Current Schedule</h4></td></tr>");
        for (var i = 0, course; course = ptclasses[name][i]; ++i) {
            output.append("<tr><td>" + course + "</td></tr>");
        }

    });

}

// display current information about peer teacher assignments
function updateSidebar() {
    var employeeList = $('#employeeList');

    // load employee names and number of assignments
    employeeList.find("tr:gt(0)").remove(); 
    for (var name in schedules) {
        employeeList.append('<tr></tr>');
        var row = employeeList.find('tr').last();
        row.append('<td>'+name+'</td>');
        row.append('<td>'+assignNames[name].length+'</td>');
row.click(createDisplayEmployee(name)); }

    // update json object for storage
    var assignObj = {times:assignments, aNames:assignNames, scheduleObj:schedules, labTimes:labs, ptClass:ptclasses};
    assignmentData = JSON.stringify(assignObj);
    
}

// creates a callback function that adds information to the schedules object when employees are loaded
function createEmployeeFunction(fileName) {
    return function(data) {
            var SC = processFile(new String(data));
            var schedule = SC.sched;
            var iclasses = SC.iclass;
            var name = /\w+_\w+/g;
            console.log(fileName);
            var fullName = name.exec(fileName)[0];
            var splitter = fullName.split('_');
            var firstName = splitter[0];
            var lastName = splitter[1];
            ptclasses[firstName + " " + lastName] = iclasses;
            schedules[firstName + " " + lastName] = schedule;
            assignments[firstName + " " + lastName] = {};
            assignNames[firstName + " " + lastName] = [];
        updateSidebar();
    };
}

// process a CSV file and return a schedule object
function processFile(allText) {

    // regex to find a single line of data
    var dataLine = /((\w\w\w\w.*\d\d\d.*\d\d\d)\s+(.*)\s+(\(Syllabus\)\s+)?)?\d\d.*\w\w\w.*\d\d.*\d\d.*\w\w\w.*\d\d\s+(\d\d).*(\d\d).*([AP]M).*(\d\d).*(\d\d).*([AP]M)\s+([a-zA-Z,]*)\s+[\w\d\s]*(LAB|LEC|SEM)/g;

    // data structures to hold temporary class information
    var iclasses = [];     // list of classes that students are taking
    var schedule = {};

    var matches = allText.match(dataLine);
	console.log(matches);
    for (var i = 0; i < matches.length; ++i) {
	console.log("Reading next data");
	console.log(matches[i]);
        var single = /((\w\w\w\w.*\d\d\d.*\d\d\d)\s+(.*)\s+(\(Syllabus\)\s+)?)?\d\d.*\w\w\w.*\d\d.*\d\d.*\w\w\w.*\d\d\s+(\d\d).*(\d\d).*([AP]M).*(\d\d).*(\d\d).*([AP]M)\s+([a-zA-Z,]*)\s+[\w\d\s]*(LAB|LEC|SEM)/g;
	var match = single.exec(matches[i]);
	console.log(match);

        var classNumGroup = match[2];
        var classNameGroup = match[3];
	if (classNumGroup)
	    iclasses.push(classNumGroup + ": " + classNameGroup);
        var startHour = parseInt(match[5]);
        var startMin = parseInt(match[6]);
        var startAPM = match[7];
        var endHour = parseInt(match[8]);
        var endMin = parseInt(match[9]);
        var endAPM = match[10];
	var dayGroup = match[11];

        var isPM = /P/g;
        if (isPM.test(startAPM))
	    startHour += 12;
        if (startHour == 12) startHour=0;
        if (startHour == 24) startHour=12;
        if (isPM.test(endAPM))
	    endHour += 12;
        if (endHour == 12) endHour=0;
        if (endHour == 24) endHour=12;

        var days = dayGroup.split(',');
        for (var j = 0; j < days.length; ++j) {
	    var day = $.trim(days[j]);
	    if (!schedule[day])
	        schedule[day] = [];
	    schedule[day].push([startHour, startMin, endHour, endMin]);
        }
    }

    var SC = {sched:schedule, iclass:iclasses};
    return SC;
}

// returns true if schedule object inteferes with time
function conflicts(schedule, timeObj, day) {
    if (!schedule[day]) return false;       // no classes on this day, cannot possibly conflict

    // extract info from object
    var startHour = timeObj[0],
        startMin = timeObj[1],
        endHour = timeObj[2],
        endMin = timeObj[3];

    // turn time into a comparative integer
    var startTime = startHour*60 + startMin;
    var endTime = endHour*60 + endMin;

    for (var i = 0; i < schedule[day].length; ++i) {

        // extract info from object
        var entry = schedule[day][i];
        var schedStartHour = entry[0],
            schedStartMin = entry[1],
            schedEndHour = entry[2],
            schedEndMin = entry[3];

        // turn time into a comparative integer
        var schedStartTime = schedStartHour*60 + schedStartMin;
        var schedEndTime = schedEndHour*60 + schedEndMin;

        // check if times overlap
        if (startTime <= schedStartTime && endTime >= schedStartTime)
            return true;
        if (schedStartTime <= startTime && schedEndTime >= startTime)
            return true;

    }

    // we didn't find a conflict
    return false;

}

// parse data from labs file and return an array of labs an associated times
function processLabs(file) {
    var lines = file.split('\n');

    var labs = {}

    var skip = true;
    var courseName = '000 - 000';
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        // check to see if this is new course info
        var patt = new RegExp(DEPT,'g');
        var preq = new RegExp('PRE','g');
        var reCourse = /\d\d\d\s+-\s+\d\d\d/g;
        if (patt.test(line) && ! preq.test(line)) {
            var course = reCourse.exec(line);
            var courseNum = parseInt(course);

            // make sure we care about this course
            if (classes.indexOf(courseNum) > -1)  {
                skip = false;
                courseName = course;
            }
            else { // we don't care about this course
                skip = true;
            }
            continue;
        }
        if (skip) continue;

        // look for lab periods
        var labStr = /^\s*Laboratory/g;
        if (labStr.test(line)) {
            
            // extract time information
            console.log("Extracting time information for " + courseName)
            var timePatt = /\d?\d:\d\d\s*[ap]m\s*-\s*\d?\d:\d\d\s*[ap]m/ig;
            var timeText = timePatt.exec(line);
            if (timeText && timeText.length > 0)
                timeText = timeText[0];
            else
                continue;
            var time = /\d?\d/g;
            var startHour = parseInt(time.exec(timeText));
            var startMin = parseInt(time.exec(timeText));
            var endHour = parseInt(time.exec(timeText));
            var endMin = parseInt(time.exec(timeText));

            // do checks for pm times
            var isPM1 = /\d?\d:\d\d\s*pm\s*-\s*\d?\d:\d\d\s*[ap]m/ig;
            var isPM2 = /\d?\d:\d\d\s*[ap]m\s*-\s*\d?\d:\d\d\s*pm/ig;
            if (isPM1.test(line))
                startHour += 12;
            if (isPM2.test(line))
                endHour += 12;
            if (startHour == 12) startHour=0;
            if (startHour == 24) startHour=12;
            if (endHour == 12) endHour=0;
            if (endHour == 24) endHour=12;

            // find day information
            var timePatt = /\d?\d:\d\d\s*[ap]m\s*-\s*\d?\d:\d\d\s*[ap]m\s*[MTWRF]+/ig;
            var timeInfo = timePatt.exec(line)[0];
            var dayPatt = /[ap]m\s*[MTWRF]+/ig;
            var dayInfo = dayPatt.exec(timeInfo)[0];
            var daysArr = dayInfo.split(' ');
            var days = daysArr[daysArr.length-1];

            // add time information to labs object
            var key = courseName + " | " + timeInfo;
            if (!labs[key]) labs[key] = {};
            for (var j = 0; j < days.length; ++j) {
                var dayChar = days.charAt(j);
                var day = 'SUN';
                switch(dayChar) {
                    case 'M':
                        day = MO;
                        break;
                    case 'T':
                        day = TU;
                        break;
                    case 'W':
                        day = WE;
                        break;
                    case 'R':
                        day = TH;
                        break;
                    case 'F':
                        day = FR;
                        break;
                }
                if (day != 'SUN')
                    labs[key][Object.keys(labs[key]).length] = {0:[startHour, startMin, endHour, endMin], 1:day};
            }
        }
    }
    return labs;
}



