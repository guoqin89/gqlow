'use strict';

controllers.controller('controlController', ['$rootScope', '$scope', '$location', '$attrs', 'Config', 'tabStorage', 'loginCredentials', function($rootScope, $scope, $location, $attrs, Config, tabStorage, loginCredentials) {

  var myIndex;
 
  $scope.init = function(obj) {
    myIndex = obj;
    var tab = tabStorage.getTab(myIndex);
    $scope.client = tab.client;
    $scope.config = tab.config;
    $scope.tables = tab.tables;
    $scope.lists = tab.lists;
    $scope.loops = tab.loops;
    $scope.credentials = tab.credentials;
    var promise = tab.mcinfo.then(function(d) {
      $scope.mcinfo = d.mcinfo;
    });
  };

  $attrs.$observe('args', function(obj) {
    $scope.init(obj);
  });

  $scope.$watch('config', function() {
    if(myIndex != undefined)
    {
      var tab = tabStorage.getTab(myIndex);
      for(var i = 0; i < tab.config.length; i++)
      {
        if(tab.config[i].isopen == true)
        {
          if(tab.isopen[i] == false)
          {
            $location.path("/"+tab.config[i].item.toLowerCase());
          }  
        }
        tab.isopen[i] = tab.config[i].isopen;
      }
    }
  }, true);

  $scope.checkAllowed = function(table) {
    var tab = tabStorage.getTab(myIndex);
    return tab.tableAllowed.hasOwnProperty(table);
  };

  $scope.checkRights = function(table) {
    var tab = tabStorage.getTab(myIndex);
    return tab.rights[table];
  };

  $scope.checkLoop = function(table) {
    var tab = tabStorage.getTab(myIndex);
    return tab.loops.hasOwnProperty(table);
  };

  $scope.toggleSelection = function($event, table, group) {
    var tab = tabStorage.getTab(myIndex);
    var checkbox = $event.target;
    if(group == "Views") {
      if(checkbox.checked) {
        for(var i = 0; i < tab.viewports.length; i++) {
          if(tab.viewports[i] == null) {
            tab.viewports[i] = table.channel;
            $rootScope.$broadcast('takeViewport', table, i);
            break;
          }
        }
      }
      else {
        for(var i = 0; i < tab.viewports.length; i++) {
          if(tab.viewports[i] == table.channel) {
            tab.viewports[i] = null;
            $rootScope.$broadcast('freeViewport', table, i);
            break;
          }
        }
      }
    }
    else if(group == "Lists") {
      for(var prop in tab.checklist) {
        if(tab.checklist.hasOwnProperty(prop)) {
          if(tab.checklist[prop]) {
            tab.checklist[prop] = false;
          }
        }
      }
      tab.checklist[table] = !tab.checklist[table];
    }
    else if(group == "Loop") {
      $rootScope.$broadcast('takeLoopViewport', table);
    }
  };

  $scope.$on('updateClientInfo', function(event, info) {
    $scope.client = info;
  });

  $scope.$on('tabSelected', function(event, name) {
    if(loginCredentials.getLoginStatus('/controls') == false) {
      return;
    }
    else {
      var tabc = tabStorage.getActiveTab();
      if(tabc.title != "Controls")
        return;
      tabc.tableAllowed = {};
      $scope.lists = tabc.listsAfterLogin;
    }
    if(name == "Controls" && $scope.tables.length == 0) {
      var tab = tabStorage.getTabByTitle("Configuration");
      var mytab = tabStorage.getTabByTitle("Controls");
      var portmap = {};
      var mountmap = {};
      var mastermap = [];
      var framelength, framerate;
      for(var k = 0; k < tab.mounts.length; k++) {
        mountmap[tab.mounts[k].disk_id] = tab.mounts[k].localpath;
      }
      for(var j = 0; j < tab.connections.length; j++) {
        portmap[tab.connections[j].channel_port] = tab.connections[j].protocol_port;
      }
    
      var dropframe = false;

      for(var i = 0; i < tab.channels.length; i++) {
        if(tab.channels[i].slave_port != -1) {
          mastermap[tab.channels[i].slave_port] = i;
        }
        else {
          mastermap[tab.channels[i].slave_port] = -1;
        }
      }

      for(var i = 0; i < tab.channels.length; i++) {
        dropframe = false;
        switch(tab.channels[i].raster) {
          case "PAL":
          case "SMPTE274_25I":
          case "PAL608":
            framelength = 40;
            framerate = 25;
            break;
          case "SMPTE274_24P":
          case "SMPTE274_23P":
            framelength = 41;
            framerate = 24;
            break;
          case "SMPTE296_59P":
            framelength = 16;
            framerate = 59.94;
            dropframe = true;
            break;
          case "SMPTE296_60P":
            framelength = 16;
            framerate = 60;
          case "SMPTE296_50P":
            framelength = 20;
            framerate = 50;
          default:
            framelength = 33.33;
            framerate = 29.97;
            dropframe = true;
            break;
        }

        var subdir = "";
        for(var j = 0; j < tab.profiles.length; j++) {
          if(tab.profiles[j].id == tab.channels[i].profile) {
            subdir = tab.profiles[j].name;
            break;
          }
        }
        $scope.tables.push({"channel": tab.channels[i].name, 
                            "port": tab.channels[i].port,
                            "protocol_port": portmap[tab.channels[i].port],
                            "localpath": mountmap[tab.channels[i].disk_primary_id],
                            "disk_fixed": tab.channels[i].disk_fixed,
                            "zero_starttime": tab.channels[i].zero_starttime,
                            "framelength": framelength,
                            "framerate": framerate,
                            "dropframe": dropframe,
                            "mode": tab.channels[i].mode,
                            "loop_window": tab.channels[i].loop_window,
                            "loop_chunk": tab.channels[i].loop_chunk,
                            "master_port": mastermap[tab.channels[i].port],
                            "subdir": subdir,
                            "use_subdir": tab.channels[i].use_subdir
                          });
        mytab.tableAllowed[tab.channels[i].name] = true;
        mytab.rights[tab.channels[i].name] = "rw";
        if(tab.channels[i].mode == "Loop_Ingest") {
          if(tabc.loops_enabled) {
            var firmware_version = $scope.mcinfo.version.split('-');
            if(firmware_version.length > 1 && firmware_version[1].indexOf("master") > -1) {
              $scope.loops.push(tab.channels[i].name);
            }
          }
        }
      }
      mytab.tables = $scope.tables;
      mytab.loops = $scope.loops;
    }

    var tab = tabStorage.getActiveTab();
    if(Object.keys(tab.tableAllowed).length == 0) {
      for(var k = 0; k < tab.tables.length; k++) {
        tab.tableAllowed[tab.tables[k].channel] = true;
      }
    }

  });

}]);



controllers.controller('controlViewsController', ['$rootScope', '$scope', 'Media', 'tabStorage', 'WebSock','modalService', function($rootScope, $scope, Media, tabStorage, WebSock, modalService) {

  $scope.portinfo = [null, null, null, null];
  $scope.viewportstatus = [{}, {}, {}, {}];
  var tickler = [{}, {}, {}, {}];
  var status = [];
  status[128] = "Cue/Init Done";
  status[65] = "Port Busy";
  status[32] = "Variable Play";
  status[16] = "Jog";
  status[8] = "Still";
  status[4] = "Play or Record";
  status[2] = "Cue/Init";
  status[1] = "Idle";
  var player = [null, null, null, null];

  $scope.viewportstatus[0].shuttlespeed = 10;
  $scope.viewportstatus[1].shuttlespeed = 10;
  $scope.viewportstatus[2].shuttlespeed = 10;
  $scope.viewportstatus[3].shuttlespeed = 10;
  $scope.viewportstatus[0].jogstep = 100;
  $scope.viewportstatus[1].jogstep = 100;
  $scope.viewportstatus[2].jogstep = 100;
  $scope.viewportstatus[3].jogstep = 100;

  $scope.$on('takeViewport', function(event, obj, index) {
    var tab = tabStorage.getActiveTab();
    $scope.portinfo[index] = obj.channel;

    var title = document.getElementById("viewport_"+index+"_title");
    if(obj.mode == "Playout") {
      title.style.background = "lightblue";
    }
    else if(obj.mode == "Ingest" || obj.mode == "Loop_Ingest"){
      title.style.background = "lightpink";
    }
    else {
      title.style.background = "lightgrey";
    }

    Media.getportinfo(tab.host,obj.protocol_port,obj.localpath).$promise.then(function(data) {

      //console.log(data);

      // process vdcp id

      processid(data.result.id, data.result.cuedId, index);

      // process metadata

      if(data.result.metadata != undefined) {
        processMetadata(data.result.metadata, index);
      }

      // process position

      if(data.result.position.indexOf("Error") == 0) {
        var pos = data.result.position.indexOf("[Errno");
        $scope.viewportstatus[index].currenttime = data.result.position.substr(pos);
      }
      else if(data.result.position.length < 5) {
        $scope.viewportstatus[index].currenttime = "00:00:00:00";
      }
      else {
        var tc = data.result.position.substr(0,8);
        $scope.viewportstatus[index].currenttime = tc.substr(6,2) + ":" + tc.substr(4,2) + ":" +
              tc.substr(2,2) + ";" + tc.substr(0,2);
        if(typeof data.result.metadata == "undefined") {
          $scope.viewportstatus[index].startframe = 0;
          $scope.viewportstatus[index].duration = 100000;
        }
        //if(data.result.metadata != undefined) {
          tickler[index].timecode = Timecode.init(
                {"framerate": obj.framerate, 
                 "drop_frame": $scope.viewportstatus[index].dropframe == "True" ? true : false,
                "timecode": $scope.viewportstatus[index].currenttime}
          );
          tickler[index].endtime = Timecode.init(
                {"framerate": obj.framerate, 
                 "drop_frame": $scope.viewportstatus[index].dropframe == "True" ? true : false,
                "timecode": $scope.viewportstatus[index].currenttime}
          );
          if(obj.zero_starttime) {
            tickler[index].endtime.set(parseInt($scope.viewportstatus[index].duration) - 1);
          }
          else {
            tickler[index].endtime.set(parseInt($scope.viewportstatus[index].startframe) + 
                  parseInt($scope.viewportstatus[index].duration) - 1);
          }
        //}
        if(!$scope.viewportstatus[index].hasOwnProperty("duration") ) {
          $scope.viewportstatus[index].endtime = "Unknown";
        }
        else if(parseInt($scope.viewportstatus[index].duration) > 717200000) { 
          $scope.viewportstatus[index].endtime = "Unknown";
        }
        else {
          $scope.viewportstatus[index].endtime = tickler[index].endtime.toString();
        }
        tickler[index].framerate = obj.framerate;
        $scope.$broadcast('tcticker', 
            index, 
            $scope.viewportstatus[index].currenttime,
            obj.framelength,
            obj.framerate
        );
      }

      // process status

      if(data.result.portstatus.indexOf("Error") == 0) {
        var pos = data.result.portstatus.indexOf("[Errno");
        $scope.viewportstatus[index].state = data.result.portstatus.substr(pos);
      }
      else if(data.result.portstatus.length < 5) {
        $scope.viewportstatus[index].state = "Not Reported";
      }
      else {
        var rc = data.result.portstatus.substr(10,2);
        var val = parseInt(rc, 16);
        var temp = "";
        var mask = 0;
        for(var i = 0; i < 8; i++) {
          mask = Math.pow(2,i);
          if((val & mask) != 0) {
            if(temp.length > 0) {
              temp += "/";
            }
            temp += status[mask];
          }
        }
        $scope.viewportstatus[index].state = temp;
        tickler[index].status = temp;
      }

      // register for status update

      var request = {
        type: "statusChanged"
      };
      request.callbackId = WebSock.getCallbackId();
      request.port = obj.protocol_port;
      tab.callbackId[index] = request.callbackId;
      var rc = WebSock.push(request);
      if(rc != null) {
        rc.then(function(data) {
          console.log("Resolved :: " + data);
        },
        function(reason) {
        },
        function(data) {
          if(data.hasOwnProperty("Error") == false) {
            if(data.hasOwnProperty("status")) {
              var rc = data.status.substr(10,2);
              var val = parseInt(rc, 16);
              var temp = "";
              var mask = 0;
              for(var i = 0; i < 8; i++) {
                mask = Math.pow(2,i);
                if((val & mask) != 0) {
                  if(temp.length > 0) {
                    temp += "/";
                  }
                  temp += status[mask];
                }
              }
              $scope.viewportstatus[index].state = temp;
              tickler[index].status = temp;
              handlestatus(index);
              if(temp == "Idle") {
                clearMetadata(index);
                $scope.viewportstatus[index].currenttime = "00:00:00:00";
                $scope.viewportstatus[index].endtime = "00:00:00:00";
              }
            }
            if(data.hasOwnProperty("metadata")) {
              processMetadata(data.metadata, index);
            }
            if(data.hasOwnProperty("timecode")) {
              //if(data.hasOwnProperty("metadata")) {
                var tables = tabStorage.getActiveTab().tables;
                var obj;
                for(var i = 0; i < tables.length; i++) {
                  if(tables[i].protocol_port == data.port) {
                    obj = tables[i];
                    break;
                  }
                }
                var tc = data.timecode.substr(0,8);
                $scope.viewportstatus[index].currenttime = tc.substr(6,2) + ":" + tc.substr(4,2) + ":" +
                      tc.substr(2,2) + ";" + tc.substr(0,2);
                tickler[index].timecode = Timecode.init(
                      {"framerate": obj.framerate, 
                       "drop_frame": $scope.viewportstatus[index].dropframe == "True" ? true : false,
                      "timecode": $scope.viewportstatus[index].currenttime}
                );
                tickler[index].endtime = Timecode.init(
                      {"framerate": obj.framerate, 
                       "drop_frame": $scope.viewportstatus[index].dropframe == "True" ? true : false,
                      "timecode": $scope.viewportstatus[index].currenttime}
                );
                if(obj.zero_starttime) {
                  tickler[index].endtime.set(parseInt($scope.viewportstatus[index].duration) - 1);
                }
                else {
                  tickler[index].endtime.set(parseInt($scope.viewportstatus[index].startframe) + 
                        parseInt($scope.viewportstatus[index].duration) - 1);
                }
                if(!$scope.viewportstatus[index].hasOwnProperty("duration") ) {
                  $scope.viewportstatus[index].endtime = "Unknown";
                }
                else if(parseInt($scope.viewportstatus[index].duration) > 717200000) { 
                  $scope.viewportstatus[index].endtime = "Unknown";
                }
                else {
                  $scope.viewportstatus[index].endtime = tickler[index].endtime.toString();
                }
                tickler[index].framerate = obj.framerate;
              //}
              if(player[index] != null) {
                var curr;
                var playercurr = player[index].currentTime();
                if(obj.zero_starttime) {
                  curr = 
                    tickler[index].timecode.frame_count / tickler[index].framerate;
                }
                else {
                  curr = 
                    (tickler[index].timecode.frame_count - $scope.viewportstatus[index].startframe) /
                    tickler[index].framerate;
                }
                var diff = playercurr - curr;
                if(Math.abs(diff) > 0.25) {
                  console.log("Playout time is off by ", playercurr - curr);
                  player[index].currentTime(curr);
                }
              }
            }
            processid(data.id, data.cuedId, index);
            if(data.hasOwnProperty("fullname")) {
              handlevideo(data.fullname, index, tab.host);
            }
          }
        })
      };

      // handle the video

      if($scope.viewportstatus[index].hasOwnProperty("id")) {
        if( ($scope.viewportstatus[index].id.length > 0) &&
            ($scope.viewportstatus[index].id.substring(0, 4) != "[Err") ) {

          if(data.result.hasOwnProperty("fullname")) {
              handlevideo(data.result.fullname, index, tab.host);
          }
        }
      }

    });

  });

  $scope.$on('freeViewport', function(event, obj, index) {

    var tab = tabStorage.getActiveTab();

    $scope.portinfo[index] = null;
    var request = {
      "type": "unsubscribe"
    };
    request.callbackId = tab.callbackId[index];
    request.port = obj.protocol_port;
    WebSock.unpush(request);

    clearInterval(tickler[index].interval);
    if(tickler[index].hasOwnProperty("timecode")) {
      delete tickler[index].timecode;
    }

    if(player[index]) {
      player[index].pause();
      player[index] = null;
    }

  });

  $scope.$on('$destroy', function cleanup() {

    var tab = tabStorage.getTabByTitle("Controls");

    var request = {
      "type": "unsubscribe"
    };
    
    for(var i = 0; i < tab.callbackId.length; i++) {
      if(tab.callbackId[i] != -1) {
        request.callbackId = tab.callbackId[i];
        WebSock.unpush(request);
      }
    }

    for(var j = 0; j < tickler.length; j++) {
      clearInterval(tickler[j].interval);
      if(tickler[j].hasOwnProperty("timecode")) {
        delete tickler[j].timecode;
      }
    }

    for(var k = 0; k < player.length; k++) {
      player[k] = null;
    }

  });

  $scope.$on('tcticker', function(event, index, timecode, framelength, framerate) {
    //tickler[index].timecode = Timecode.init({"framerate": framerate, "timecode": timecode});
    tcinterval(index, framelength);
  });

  $scope.test = function(value) {
    console.log("clicked");
  };

/*
 *  Internal functions
 *
*/

  function tcinterval(index, framelength) {
    var adjust = 0.0;
    tickler[index].interval = setInterval(function() {
        var tc = tickler[index].timecode;
        if(tickler[index].status.indexOf("Still") != -1) {
          player[index].pause();
        }
        else if(tickler[index].status.indexOf("Play or Record") != -1) {
          if( (tickler[index].status.indexOf("Variable Play") == -1) && 
              (tickler[index].status.indexOf("Still") == -1) ) {
            if(tc.frame_count < tickler[index].endtime.frame_count -1) {
              adjust += 0.34;
              if(adjust > 33.0) {
                adjust = 0.0;
              }
              else {
                tc.add(1);
              }
              if(player[index]) {
                if(player[index].paused()) {
                  player[index].play();
                }
              }
            }
            else {
              if(player[index] && !player[index].paused()) {
                player[index].currentTime(tickler[index].endtime.frame_count 
                  / tickler[index].framerate);
                player[index].pause();
              }
            }
          }
        }
        if($scope.viewportstatus[index].state != "Idle" && typeof tc != 'undefined') {
          $scope.viewportstatus[index].currenttime = tc.toString();
          $scope.$apply();
        }
    }, framelength);
  }

  function handlestatus(index) {
    if(tickler[index].status.indexOf("Still") != -1) {
      player[index].pause();
    }
    else if(tickler[index].status.indexOf("Play or Record") != -1) {
      if( (tickler[index].status.indexOf("Variable Play") == -1) && 
          (tickler[index].status.indexOf("Still") == -1) ) {
          if(player[index]) {
            if(player[index].paused()) {
              player[index].play();
            }
          }
      }
      else {
        if(player[index] && !player[index].paused()) {
          player[index].pause();
        }
      }
    }
    else if(tickler[index].status.indexOf("Idle") != -1) {
      if(player[index] && !player[index].paused()) {
        player[index].pause();
      }
    }
  }

  function processMetadata(indata,index) {

    try {
      var metadata = JSON.parse(indata);
    }
    catch(e) {
      console.log("Error in parsing metadata", metadata);
    }
    $scope.viewportstatus[index].creator = 
            metadata.Preface.identification_list[0].Identification.application_supplier_name;
    $scope.viewportstatus[index].application = 
            metadata.Preface.identification_list[0].Identification.application_name;
    $scope.viewportstatus[index].version = 
            metadata.Preface.identification_list[0].Identification.application_version_string;
    var tindex = metadata.Preface["container_last_modification_date_&_time"].indexOf('.');

    $scope.viewportstatus[index].date = 
            metadata.Preface["container_last_modification_date_&_time"].substr(0, tindex);

    var descriptors = 
            metadata.Preface.ContentStorage.packages[1].SourcePackage.MultipleDescriptor.file_descriptors;

    var materialpackage = metadata.Preface.ContentStorage.packages[0].MaterialPackage;
    $scope.viewportstatus[index].startframe = 
            materialpackage.tracks[0].TimelineTrack.Sequence.components_in_sequence[0].TimecodeComponent.start_timecode;
    $scope.viewportstatus[index].duration = 
            materialpackage.tracks[0].TimelineTrack.Sequence.components_in_sequence[0].TimecodeComponent.element_duration;
    $scope.viewportstatus[index].dropframe = 
            materialpackage.tracks[0].TimelineTrack.Sequence.components_in_sequence[0].TimecodeComponent.drop_frame;

    var vfound = false;
    var afound = -1;
    var audiotracks = "";
    var keys;
    var numvideo = 0;
    var numaudio = 0;
    for(var i = 0; i < descriptors.length; i++) {
      keys = Object.keys(descriptors[i]);
      if(!vfound && (keys[0] == "MPEG2VideoDescriptor" || keys[0] == "CDCIEssenceDescriptor")) {
        //$scope.viewportstatus[index].vtrack = "Track " + descriptors[i][keys[0]].essence_track_id;
        numvideo++;
        var t = descriptors[i][keys[0]].sample_rate;
        var tokens = t.split('/');
        if(tokens.length > 1) {
          $scope.viewportstatus[index].vsamplerate = parseFloat(tokens[0] / tokens[1]).toFixed(2);
        }
        else {
          $scope.viewportstatus[index].vsamplerate = descriptors[i][keys[0]].sample_rate;
        }
        $scope.viewportstatus[index].vwidth = descriptors[i][keys[0]].stored_width;
        if(descriptors[i][keys[0]].frame_layout == "1") {
          $scope.viewportstatus[index].vheight = descriptors[i][keys[0]].stored_height * 2;
        }
        else {
          $scope.viewportstatus[index].vheight = descriptors[i][keys[0]].stored_height;
        } 
        $scope.viewportstatus[index].vdepth = descriptors[i][keys[0]].component_depth + " bits";
        $scope.viewportstatus[index].vbitrate = descriptors[i][keys[0]].bit_rate + " bps";;
        vfound = true;
      }
      else if(keys[0] == "AES3PCMDescriptor" || keys[0] == "GenericSoundEssenceDescriptor") {
        numaudio++;
        audiotracks += " " + descriptors[i][keys[0]].essence_track_id;
        if(afound == -1) {
          afound = i;
        }
      }
    }
    if(afound != -1) {
      //$scope.viewportstatus[index].atrack = "Track " + audiotracks;
      $scope.viewportstatus[index].atrack = numaudio;
      var t = descriptors[afound][keys[0]].audio_sample_rate;
      var tokens = t.split('/');
      if(tokens.length > 1) {
        $scope.viewportstatus[index].asamplerate = parseFloat(tokens[0]/tokens[1]).toFixed(0);
      }
      else {
        $scope.viewportstatus[index].asamplerate = descriptors[afound][keys[0]].audio_sample_rate;
      }
      $scope.viewportstatus[index].abits = descriptors[afound][keys[0]].bits_per_audio_sample + " bits";
      $scope.viewportstatus[index].abps = descriptors[afound][keys[0]].average_bytes_per_second + " bps";
    }
    $scope.viewportstatus[index].vtrack = numvideo;
  }

  function clearMetadata(index) {
    $scope.viewportstatus[index].creator = "";
    $scope.viewportstatus[index].application = "";
    $scope.viewportstatus[index].version = ""; 
    $scope.viewportstatus[index].date = "";
    $scope.viewportstatus[index].startframe = "";
    $scope.viewportstatus[index].duration = "";
    $scope.viewportstatus[index].dropframe = "";
    $scope.viewportstatus[index].vtrack = "";
    $scope.viewportstatus[index].vsamplerate = "";
    $scope.viewportstatus[index].vwidth = "";
    $scope.viewportstatus[index].vheight = "";
    $scope.viewportstatus[index].vdepth = "";
    $scope.viewportstatus[index].vbitrate = "";
    $scope.viewportstatus[index].atrack = "";
    $scope.viewportstatus[index].asamplerate = "";
    $scope.viewportstatus[index].abits = "";
    $scope.viewportstatus[index].abps = "";
  }

  function processid(id, cuedId, index) {
    if(typeof id != 'undefined') {
      if(id.indexOf("Error") == 0) {
        var pos = id.indexOf("[Errno");
        $scope.viewportstatus[index].id = id.substr(pos);
      }
      else {
        $scope.viewportstatus[index].id = id;
      }
    }
    if(typeof cuedId != 'undefined') {
      $scope.viewportstatus[index].cuedId = cuedId;
    }
    else {
      $scope.viewportstatus[index].cuedId = "None";
    }
  }

  function handlevideo(fullname, index, host) {
    var ptr = fullname.indexOf("/evertz");
    if(player[index]) {
      player[index].src("http://" + host + fullname.substr(ptr));
      setTimeout(function() {
        player[index].currentTime(
          (tickler[index].timecode.frame_count - 
            $scope.viewportstatus[index].startframe + tickler[index].framerate) /
            tickler[index].framerate);
          //(tickler[index].timecode.frame_count + tickler[index].framerate) /
                    //tickler[index].framerate);
        handlestatus(index);
      },
      1000);
    }
    else {
      player[index] = videojs(document.getElementById('viewport_'+index+'_video'), {}, function() {
        this.src("http://" + host + fullname.substr(ptr));
        this.controls(false);
        setTimeout(function() {
          player[index].currentTime(
            (tickler[index].timecode.frame_count - 
              $scope.viewportstatus[index].startframe + tickler[index].framerate) /
              tickler[index].framerate);
            //(tickler[index].timecode.frame_count + tickler[index].framerate) /
            //tickler[index].framerate);
          handlestatus(index);
        },
        1000);
      });
    }
  }

  
  function findobj(tab, name) {
    var obj = null;
    for(var i = 0; i < tab.tables.length; i++) {
      if(tab.tables[i].channel == name) {
        obj = tab.tables[i];
        break;
      }
    }
    return obj;
  }

  function getplayer() {
    return player;
  }

/*
 *
 *  Media Player button handlers
 *
 */

  $scope.play = function(name) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      if(obj.mode == "Ingest" || obj.mode == "TS_Ingest" || obj.mode == "Loop_Ingest") {
        Media.sendcommand(tab.host,obj.protocol_port,'record').$promise.then(function(data) {
        });
      }
      else {
        Media.sendcommand(tab.host,obj.protocol_port,'play').$promise.then(function(data) {
        });
      }
    }
  };

  $scope.stop = function(name) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      Media.sendcommand(tab.host,obj.protocol_port,'stop').$promise.then(function(data) {
      });
    }
  };

  $scope.pause = function(name) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      Media.sendcommand(tab.host,obj.protocol_port,'pause').$promise.then(function(data) {
      });
    }
  };

  $scope.fastforward = function(name, speed) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      Media.sendcommand(tab.host,obj.protocol_port,'ff',speed).$promise.then(function(data) {
      });
    }
  };

  $scope.fastbackward = function(name, speed) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      Media.sendcommand(tab.host,obj.protocol_port,'fb',speed).$promise.then(function(data) {
      });
    }
  };

  $scope.step = function(name, index) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      Media.sendcommand(tab.host,obj.protocol_port,'step').$promise.then(function(data) {
        var curr = player[index].currentTime();
        player[index].currentTime(curr+(obj.framelength/1000));
      });
    }
  };

  $scope.jog = function(name, frames) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      Media.sendcommand(tab.host,obj.protocol_port,'jog',frames).$promise.then(function(data) {
      });
    }
  };

  $scope.fullscreen = function(index) {
    if(player[index] != null)
      player[index].requestFullscreen();
  };

  $scope.cue = function(name, index) {
    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;
    var obj = findobj(tab, name);
    if(typeof obj != 'undefined') {
      var id = $scope.viewportstatus[index].selectedfile;
      if(typeof id == "undefined" || id == "")
        return;
      var start = "00000000";
      var duration = "00000000";
      if(typeof $scope.viewportstatus[index].cue_starttime != "undefined" &&
          $scope.viewportstatus[index].cue_starttime != "") { 
        start = $scope.viewportstatus[index].cue_starttime.toString();
        start = start.replace(/:/g,'').replace(/;/g,'');
      }
      if(typeof $scope.viewportstatus[index].cue_duration != "undefined" &&
          $scope.viewportstatus[index].cue_duration != "") {
        duration = $scope.viewportstatus[index].cue_duration.toString();
        duration = duration.replace(/:/g,'').replace(/;/g,'');
      }
      var option = start + duration + id;
      if(obj.mode == "Ingest" || obj.mode == "TS_Ingest") {
        if($scope.viewportstatus[index].id == $scope.viewportstatus[index].selectedfile) {
          var modalOptions = {
                modalheader : "Operation Refused",
                modalbody : "The same ID is being ingested. Record Init not allowed.",
                modalfooter: "  "
          };
          modalService.showModal({},modalOptions,false).then(function(result) {
          });
        }
        else {
          var p = obj.localpath;
          if(obj.use_subdir == false) {
            p += "/" + obj.subdir;
          }
          Media.checkexists(tab.host,p,id,obj.use_subdir).$promise.then(function(data) {
            var result = data.result;
            if(result.error == "File already exists") {
              var modalOptions = {
                    modalheader : "Duplication Detected",
                    modalbody : "The same ID already exists. Overwrite ?",
                    modalfooter: "  "
              };
              modalService.showModal({},modalOptions,false).then(function(result) {
                Media.sendcommand(tab.host,obj.protocol_port,'recordinit',option).$promise.then(function(data) {
                  //$scope.viewportstatus[index].cue_starttime = "";
                  //$scope.viewportstatus[index].cue_duration = "";
                  //$scope.viewportstatus[index].selectedfile = "";
                });
              });
            }
            else if(result.result == "File not found") {
              Media.sendcommand(tab.host,obj.protocol_port,'recordinit',option).$promise.then(function(data) {
                //$scope.viewportstatus[index].cue_starttime = "";
                //$scope.viewportstatus[index].cue_duration = "";
                //$scope.viewportstatus[index].selectedfile = "";
              });
            }
          });
        }
      }
      else {
        Media.sendcommand(tab.host,obj.protocol_port,'cue',option).$promise.then(function(data) {
          //$scope.viewportstatus[index].cue_starttime = "";
          //$scope.viewportstatus[index].cue_duration = "";
          //$scope.viewportstatus[index].selectedfile = "";
        });
      }
    }
  };

}]);



controllers.controller('controlBrowseModalController', ['$rootScope', '$scope', '$modal', 'Media', 'tabStorage', function($rootScope, $scope, $modal, Media, tabStorage) {

  $scope.open = function(size, index, name) {

    var tab = tabStorage.getActiveTab();
    if(tab.readonly)
      return;

    var obj = null;
    for(var i = 0; i < tab.tables.length; i++) {
      if(tab.tables[i].channel == name) {
        obj = tab.tables[i];
        break;
      }
    }
    if(obj != null) {
      if(obj.mode == "Ingest" || obj.mode == "Loop_Ingest" || obj.mode == "TS_Ingest")
        return;
    }

    if((typeof $scope.$parent.viewportstatus[index].selectedfile != 'undefined') && 
          ($scope.$parent.viewportstatus[index].selectedfile.length > 0)) {  
      if($scope.$parent.viewportstatus[index].selectedfile.length > 0) {
        if(obj != null) {
          var fullname = $scope.$parent.viewportstatus[index].selectedfile;
          var p = obj.localpath;
          if(obj.use_subdir == false) {
            p += "/" + obj.subdir;
          }
          Media.getmetadata(tab.host,p,fullname,obj.use_subdir).$promise.then(function(d) {
            if(angular.isDefined(d.result.metadata)) {
              var data = JSON.parse(d.result.metadata);
              var materialpackage = data.Preface.ContentStorage.packages[0].MaterialPackage;
              var startframe =
                materialpackage.tracks[0].TimelineTrack.Sequence.components_in_sequence[0].TimecodeComponent.start_timecode;
              var dropframe =
                materialpackage.tracks[0].TimelineTrack.Sequence.components_in_sequence[0].TimecodeComponent.drop_frame;
              var duration =
                materialpackage.tracks[0].TimelineTrack.Sequence.components_in_sequence[0].TimecodeComponent.element_duration;
              var descriptors =
                data.Preface.ContentStorage.packages[1].SourcePackage.MultipleDescriptor.file_descriptors;

              var vsamplerate, vwidth, vheight, vdepth, vbitrate;
              var keys;
              var temp;
              for(var i = 0; i < descriptors.length; i++) {
                keys = Object.keys(descriptors[i]);
                if(keys[0] == "MPEG2VideoDescriptor" || keys[0] == "CDCIEssenceDescriptor") {
                  temp = descriptors[i][keys[0]].sample_rate;
                  var tokens = temp.split('/');
                  vsamplerate = parseFloat(tokens[0]) / parseFloat(tokens[1]);
                  vsamplerate = vsamplerate.toFixed(2);
                  vwidth = descriptors[i][keys[0]].stored_width;
                  vheight = descriptors[i][keys[0]].stored_height;
                  vdepth = descriptors[i][keys[0]].component_depth + " bits";
                  vbitrate = descriptors[i][keys[0]].bit_rate + " bps";;
                  break;
                }
              }

              var starttime = Timecode.init(
                    {"framerate": vsamplerate,
                     "drop_frame": dropframe == "True" ? true : false,
                     "timecode": parseInt(startframe)}
              );
              var endtime = Timecode.init(
                    {"framerate": vsamplerate,
                     "drop_frame": dropframe == "True" ? true : false,
                     "timecode": parseInt(duration)}
              );

              $scope.$parent.viewportstatus[index].cue_starttime = starttime.toString();
              $scope.$parent.viewportstatus[index].cue_duration = endtime.toString();
            }
            else {
              $scope.$parent.viewportstatus[index].selectedfile = fullname + " NOT FOUND";
              $scope.$parent.viewportstatus[index].cue_starttime = "00:00:00;00";
              $scope.$parent.viewportstatus[index].cue_duration = "00:00:00;00";
            }

          });
        }
      }
    }
    else {
      var modalInstance = $modal.open({
        templateUrl: 'partials/filesmodal.html',
        controller: modalInstanceController,
        size: size,
        resolve: {
          tab: function() {
            return null;
          },
          playlist: function() {
            return null;
          }
        }
      });

      modalInstance.result.then( function(selectedItem) {
        $scope.$parent.viewportstatus[index].selectedfileFullpath = selectedItem.displayedNode;
        var tokens = selectedItem.displayedNode.split("//");
        var last = tokens.length - 1;
        var id;
        if(tokens[last].indexOf(tokens[last-1]) == 0) { 
          id = tokens[last-1] + "/" + tokens[last].replace('.mxf','');
        }
        else {
          id = tokens[last].replace('.mxf','');
        }
        $scope.$parent.viewportstatus[index].selectedfile = id;
        $scope.$parent.viewportstatus[index].cue_starttime = selectedItem.starttime.toString();
        $scope.$parent.viewportstatus[index].cue_duration = selectedItem.duration.toString();
      }, function() {
        console.log("Modal dismissed");
      });
    }
  };

}]);

var modalInstanceController = function($scope, $modalInstance, tab, playlist) {

  $scope.ok = function() {
    var selectedItem = {};
    selectedItem.displayedNode = $scope.displayedNode;
    selectedItem.starttime = this.starttime;
    selectedItem.duration = this.duration;
    selectedItem.vsamplerate = this.vsamplerate;
    selectedItem.vwidth = this.vwidth;
    selectedItem.vheight = this.vheight;
    selectedItem.vdepth = this.vdepth;
    selectedItem.vbitrate = this.vbitrate;
    selectedItem.date = this.date;

    var plist = playlist;
  
    if(plist == null) {
      $modalInstance.close(selectedItem);
    }
    else {
      var tokens = selectedItem.displayedNode.split('/');
      var id = tokens[tokens.length - 1].replace('.mxf','');
      var info = {};
      info.start = selectedItem.starttime.toString();
      info.duration = selectedItem.duration.toString();
      info.width = selectedItem.vwidth;
      info.height = selectedItem.vheight;
      info.bitdepth = selectedItem.vdepth;
      info.bitrate = selectedItem.vbitrate;
      info.rate = selectedItem.vsamplerate;
      info.date = selectedItem.date;
      info.id = id;
      var list = {};
      list.id = info;
      var url = "http://" + tab.host + "/evertz/" + selectedItem.displayedNode;
      list.image = url.replace('.mxf', '.jpg');
      list.starttime = info.start;
      list.duration = info.duration;
      list.order = playlist.length + 1;
      playlist.push(list);
    }
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

};


