
/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
The Web Sockets Node.js sample application distributed within Intel® XDK IoT Edition under the IoT with Node.js Projects project creation option showcases how to use the socket.io NodeJS module to enable real time communication between clients and the development board via a web browser to toggle the state of the onboard LED.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing/updating MRAA & UPM Library on Intel IoT Platforms with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

OR
In Intel XDK IoT Edition under the Develop Tab (for Internet of Things Embedded Application)
Develop Tab
1. Connect to board via the IoT Device Drop down (Add Manual Connection or pick device in list)
2. Press the "Settings" button
3. Click the "Update libraries on board" option

Review README.md file for in-depth information about web sockets communication

*/

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console
//var myOnboardLed = new mraa.Gpio(3, false, true); //LED hooked up to digital pin (or built in pin on Galileo Gen1)
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led



var servoModule = require("jsupm_servo");


var servoLeft = new servoModule.ES08A(3);
var servoRight = new servoModule.ES08A(5);
var servoLevel = new servoModule.ES08A(6);

var angleLeft = 0;
var angleRight = 0;
var lastAngle= 0;
var levelAngle = 180;
var counter = 0;

var rangle = 150;
var langle = 65;
var cera = 0;

var crossL = 80;
var crossR = 100;

var crossLL = 30;
var crossRR = 60;

var smileyR = 125;
var smileyL = 60;

servoLeft.setAngle(0);
servoRight.setAngle(0);
servoLevel.setAngle(175);

//Подсветка
var analogPin0 = new mraa.Aio(0);
var analogValue = analogPin0.read();
var myOnboardLed = new mraa.Gpio(13); //red
myOnboardLed.dir(mraa.DIR_OUT);
var blueLed = new mraa.Gpio(12); //blue
blueLed.dir(mraa.DIR_OUT);

var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectedUsersArray = [];
var userId;

app.get('/', function(req, res) {
    //Join all arguments together and normalize the resulting path.
    res.sendFile(path.join(__dirname + '/client', 'index.html'));
});

//Allow use of files in client folder
app.use(express.static(__dirname + '/client'));
app.use('/client', express.static(__dirname + '/client'));

//Socket.io Event handlers
io.on('connection', function(socket) {
    console.log("\n Add new User: u"+connectedUsersArray.length);
    if(connectedUsersArray.length > 0) {
        var element = connectedUsersArray[connectedUsersArray.length-1];
        userId = 'u' + (parseInt(element.replace("u", ""))+1);
    }
    else {
        userId = "u0";
    }
    console.log('a user connected: '+userId);
    io.emit('user connect', userId);
    connectedUsersArray.push(userId);
    console.log('Number of Users Connected ' + connectedUsersArray.length);
    console.log('User(s) Connected: ' + connectedUsersArray);
    io.emit('connected users', connectedUsersArray);
    
    socket.on('user disconnect', function(msg) {
        console.log('remove: ' + msg);
        connectedUsersArray.splice(connectedUsersArray.lastIndexOf(msg), 1);
        io.emit('user disconnect', msg);
    });
    
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
        console.log('message: ' + msg.value);
    });
    
    socket.on('toogle led', function(msg) {
        blueLed.write(1);
        rise();
        io.emit('toogle led', msg);
        
    });
    
    socket.on('smileee', function(msg) {
        blueLed.write(1);
        riserr();
        
        
    });
    
     socket.on('seensor', function(msg) {
        msg.value = analogValue;
         console.log("Got sensor Request");
         triggerLight();
         io.emit('seensor', msg);
        
        
    });
    
});


http.listen(3000, function(){
    console.log('Web server Active listening on *:3000');
});



function rise() {

    servoLevel.setAngle(levelAngle);
    levelAngle = levelAngle - 5;
    counter = counter + 1;
    console.log(counter);
    
    if (counter == 22) {
        servoLeft.setAngle(65);
        servoRight.setAngle(150); 
        console.log("ENDED");
        setTimeout(fall, 5000);
        console.log("Moving to Fall");
    }
    if (counter < 22) {
        setTimeout(rise,100);
        
    }
    
}

function fall() {
    
    servoLevel.setAngle(levelAngle);
    levelAngle = levelAngle + 5;
    counter = counter + 1;
    console.log(counter);
    
    if (counter==23) {
        counter=0;
    }
    if (counter < 22) {
        setTimeout(fall,100);
    }
    if (counter == 22) {
        console.log("ENDED  %d",levelAngle);
        levelAngle = 180;
        setTimeout(moveFromEraser, 1000);
        
    }
}


function moveFromEraser () {
    console.log("We're in moveFromEraser");
    servoRight.setAngle(rangle);
    servoLeft.setAngle(langle);
    
    if (langle > 3 ) {
        langle = langle - 5;
       
    }
    if (rangle > 3) {
        rangle = rangle - 5;
        setTimeout(moveFromEraser,100);
        console.log("langle = %d ||| Rangle = %d",langle,rangle);
    }
    
    if (rangle == 0) {
        setTimeout(eraser,1500);
        console.log("121212");
    }
    
}

function eraser() {
    servoRight.setAngle(angleRight);
    servoLeft.setAngle(angleLeft);
    console.log("Right: %d ||| Left: %d", angleRight, angleLeft)
    
    angleLeft = angleLeft + 10;
    angleRight = angleRight + 10;
    
    
    if (angleRight > 140) {
        angleRight = lastAngle + 5;
        lastAngle = angleRight;
        angleLeft = 0
        console.log("Last Angle: %d", lastAngle);
        
        if (angleRight == 60){     //доходим до стерки
            console.log("Done!");
            angleLeft=60;
            angleRight=150;
            lastAngle=0;
            cera = 1;
            setTimeout(riser,500);
        }
        
    } 
    if (cera==0) {
        setTimeout(eraser,300);
    }
}

function riser() {
    
    if (levelAngle == 70) {
        servoLeft.setAngle(0);
        servoRight.setAngle(0); 
        console.log("ENDED");
        setTimeout(faller, 5000);
        console.log("Moving to Faller");
    }
    if (levelAngle > 70) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle - 5;
        setTimeout(riser,100);
        
    }
    
}

function faller() {
    
    if (levelAngle==180) {
        console.log("Moving to smile... %d", levelAngle);
        resetValues();
        setTimeout(waitForBlueLight, 5000);
    }
    if (levelAngle < 180) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle + 5;
        console.log(levelAngle);
        console.log("+5");
        setTimeout(faller,100);
    }
}

function waitForBlueLight() {
    blueLed.write(0);
}

// СМАЙЛ СКРИПТ СТАРТУЕТ ЗДЕСЬ
function riserr() {
    
    if (levelAngle == 70) {
        servoLeft.setAngle(crossL);
        servoRight.setAngle(crossR); 
        console.log("ENDED");
        smileyR = 125;
        setTimeout(fallerr, 1000);
        console.log("Rise 1 stopped");
    }
    if (levelAngle > 70) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle - 5;
        setTimeout(riserr,100);
        
    }
    
}

function fallerr() {
    
    if (levelAngle==180) {
        console.log("Fall 1 ended - moving to smile %d", levelAngle);
        setTimeout(smile,1000);
    }
    if (levelAngle < 180) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle + 5;
        setTimeout(fallerr,100);
    }
}


function smile() {
    console.log("Beginning to draw the smile...");
    setTimeout(crossLine,1000);
    //servoRight.setAngle(60);
    //servoLeft.setAngle(30);
}

function crossLine() {
    if (crossR > 70) {
        console.log("R pos: %d", crossR);
        servoRight.setAngle(crossR);
        servoLeft.setAngle(crossL);
    
        crossL = crossL + 5;
        crossR = crossR - 5;
        
        setTimeout(crossLine,65);
    }
    if (crossR == 70) {
        console.log("DONE LINE LEFT!");
        console.log("Moving to right... %d", crossR);
        setTimeout(riserrr,80);
    } 
}

function riserrr() {
    
    if (levelAngle == 70) {
        servoLeft.setAngle(crossLL);
        servoRight.setAngle(crossRR); 
        
        console.log("Rise 2 is over");
        console.log("Moving to Fall 2...");
        
        setTimeout(fallerrr, 5000);
    }
    if (levelAngle > 70) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle - 5;
        setTimeout(riserrr,100);
    }
    
}

function fallerrr() {
    
    if (levelAngle==180) {
        console.log("Fall 2 is over");
        console.log("Moving to SMIIIIIIILE>>>>>");
        setTimeout(crossRight, 500);
    }
    if (levelAngle < 180) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle + 5;
        setTimeout(fallerrr,100);
    }
}

function crossRight() {
    if (crossRR > 35) {
        servoRight.setAngle(crossRR);
        servoLeft.setAngle(crossLL);
    
        crossLL = crossLL + 5;
        crossRR = crossRR - 5;
    
        setTimeout(crossRight,100);
    }
    if (crossRR == 35) {
        console.log("DONE LINE RIGHT!");
        console.log("Moving to mouth... %d", crossRR);
        setTimeout(oneRise,100);
    }
}

function oneRise() {
    
    if (levelAngle == 70) {
        servoLeft.setAngle(smileyL);
        servoRight.setAngle(smileyR); 
        console.log("ENDED");
        console.log("Moving to Faller");
        setTimeout(oneFall, 1000);
    }
    if (levelAngle > 70) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle - 5;
        setTimeout(oneRise,100);
        
    }
    
}

function oneFall() {
    
    if (levelAngle==180) {
        console.log("Moving to MOUTH???");
        setTimeout(smiley, 1000);
    }
    if (levelAngle < 180) {
        servoLevel.setAngle(levelAngle);
        levelAngle = levelAngle + 5;
        setTimeout(oneFall,100);
    }
}

function smiley() {
    if (smileyR > 65) {
        servoRight.setAngle(smileyR);
        servoLeft.setAngle(smileyL);
    
        smileyL = smileyL - 5;
        smileyR = smileyR - 5;
    
        setTimeout(smiley,100);
    }
    if (smileyR == 65) {
        console.log("You're Awesome!");
        resetValues();
        setTimeout(waitForBlueLight, 5000);
    }
}
    
function resetValues() {
        angleLeft = 0;
        angleRight = 0;
        lastAngle= 0;
        levelAngle = 180;
        counter = 0;

        rangle = 150;
        langle = 65;
        cera = 0;

        crossL = 60;
        crossR = 120;

        crossLL = 30;
        crossRR = 60;

        smileyL = 60;
}

function triggerLight() {
        if (analogValue < 512) {
            myOnboardLed.write(1);
        } else { 
            myOnboardLed.write(0);
        }
}
    

