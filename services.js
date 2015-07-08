'use strict';

/* Services */
var services = angular.module('myApp.services', []);


// a simple value service.
services.value('version', 'JAN.27');

services.factory('tabStorage', ['Config', 'loginCredentials', 'getxml', function(Config, loginCredentials, getxml) {

  var tabStorage = {};
  var tabs = new Array;
  var activetab = 2;

  tabStorage.addconfig = function(hostname, host) {
    var obj = new Object;
    obj.config = [
      {"item":"Configurations", "isopen": true},
      {"item":"XMLs", "isopen": false},
      {"item":"Files", "isopen": false}
    ];
    obj.isopen = [true, false, false]; 

    obj.tableAllowedAfterLogin = {
      "cards": false,  
      "channels": true, 
      "clients": false,  
      "connections": false,  
      "features": true, 
      "mounts": true, 
      "profiles": false,
      "serialports": false,  
      "storagelocation": false,  
      "version": false,
      "eco": false
    };
    obj.tableAllowed = {};
    obj.rights = {
      "cards": "rw",  
      "channels": "rw", 
      "clients": "rw",  
      "connections": "rw",  
      "features": "rw", 
      "mounts": "rw", 
      "profiles": "rw",
      "serialports": "rw",  
      "storagelocation": "rw",  
      "version": "rw",
      "eco": "rw"
    };

    obj.title = hostname;
    obj.host = host;
    obj.active = true;
    obj.disabled = false;

    obj.tables = Config.tables(obj.host);
    obj.client = Config.client(obj.host);
    obj.mcinfo = getxml.getmcinfo(host);

    obj.readonly = false;
    obj.credentials = loginCredentials.getLoginRecord();

    tabs.push(obj);
  };

  tabStorage.addstats = function(tabname, host) {
    var obj = new Object;
    obj.config = [];
    obj.title = tabname;
    obj.host = host;
    obj.active = false;
    obj.disabled = true;
    tabs.push(obj);
  };

  tabStorage.addcontrol = function(tabname, host) {
    var obj = new Object;
    obj.config = [
      {"item":"Views", "isopen": true},
      {"item":"Lists", "isopen": false}
//      {"item":"Loop", "isopen": false}
    ];
    obj.isopen = [true, false, false]; 
    obj.title = tabname;
    obj.host = host;
    obj.active = false;
    obj.disabled = false;
    obj.client = Config.client(obj.host);
    obj.mcinfo = getxml.getmcinfo(host);
    obj.tableAllowed = {};
    obj.loops = [];
    obj.tables = [];
    obj.rights = {};
    obj.viewports = [null, null, null, null];
    obj.loopviewport = null;
    obj.callbackId = [-1, -1, -1, -1];
    obj.callbackIdNowPlaying = [-1, -1, -1, -1, -1, -1, -1, -1, -1 , 1];
    obj.callbackIdMonLoopIngest = -1;
    obj.listsAfterLogin = ["Now Playing", "Libraries", "Playlists", "Ingest lists"];
    obj.lists = [];
    obj.checklist = {"Playlists": false, "Ingest lists": false, "Libraries": false, "Now Playing": false};
    obj.loops_enabled = true;
    obj.readonly = false;
    obj.credentials = loginCredentials.getLoginRecord();
    tabs.push(obj);
  };

  tabStorage.addadmin = function(tabname, host) {
    var obj = new Object;
    obj.config = [
      {"item":"Users", "isopen": true},
      {"item":"Monitors", "isopen": false},
      {"item":"Upgrade", "isopen": false},
      {"item":"Snapshot", "isopen": false}
    ];
    obj.tables = [
      {"table": "accounts"},
      {"table": "privileges"},
      {"table": "log"}
    ];
    obj.tableAllowedAfterLogin = {
      "accounts": true,
      "privileges": true,
      "log": false,
      "top": true,
      "bmon": true,
      "nfs": true,
      "upgrade": true,
      "snapshot": true
    };
    obj.tableAllowed = {
      "accounts": true,
      "privileges": true,
      "log": false,
      "top": true,
      "bmon": true,
      "nfs": true,
      "upgrade": true,
      "snapshot": true
    };
    obj.rights = {
      "accounts": "rw",
      "privileges": "rw",
      "log": "rw",
      "top": "rw",
      "bmon": "rw",
      "nfs": "rw",
      "snapshot": "rw"
    };
    obj.monitorsAfterLogin = [
      {"monitors": "top"},
      {"monitors": "bmon"},
      {"monitors": "nfs"}
    ];
    obj.monitors = [];
    obj.buttonStatus = {
      "polltop": true,
      "pollbmon": true,
      "pollnfsmon": true
    };
    obj.role_type = ['admin', 'support', 'install', 'operator', 'guest'];

    obj.readonly = false;
    obj.upgrade = false;
    obj.credentials = loginCredentials.getLoginRecord();
    obj.isopen = [true, false];
    obj.title = tabname;
    obj.host = host;
    obj.active = false;
    obj.disabled = false;
    obj.client = Config.client(obj.host);
    obj.mcinfo = getxml.getmcinfo(host);
    tabs.push(obj);
  };

  tabStorage.addInstallation = function(tabname, host) {
    var obj = new Object;
    obj.config = [
      {"item":"Initial Install", "isopen": true}
    ];
    obj.tables = [
      {"table": "information"},
      {"table": "network"},
      {"table": "hosts"},
      {"table": "ntp"}
    ];
    obj.tableAllowedAfterLogin = {
      "information": true,
      "network": true,
      "hosts": true,
      "ntp": true
    };
    obj.tableAllowed = {};
    obj.isopen = [true];
    obj.title = tabname;
    obj.host = host;
    obj.active = false;
    obj.disabled = false;
    obj.client = Config.client(obj.host);
    obj.mcinfo = getxml.getmcinfo(host);
    obj.credentials = loginCredentials.getLoginRecord();
    tabs.push(obj);
  };

  tabStorage.getAllTabs = function() {
    return tabs;
  };

  tabStorage.getTab = function(index) {
    return tabs[index];
  };

  tabStorage.getTabByTitle = function(title) {
    for(var i = 0; i < tabs.length; i++) {
      if(tabs[i].title == title) {
        return tabs[i];
      }
    }
    return null;
  };

  tabStorage.getHost = function(index) {
    return tabs[index].host;
  };

  tabStorage.addXmlFiles = function(index, files) {
    tabs[index].xmlfiles = files;
  };

  tabStorage.getXmlFiles = function(index) {
    return tabs[index].xmlfiles;
  };

  tabStorage.getCredentials = function() {
    return loginCredentials.getCredentials();
  };

  tabStorage.saveCredentials = function(data) {
    return loginCredentials.saveCredentials(data);
  };

  tabStorage.setActiveTab = function(index) {
    activetab = index;
  };

  tabStorage.getActiveTab = function() {
    return tabs[activetab];
  };

  tabStorage.getUpgrades = function() {
    return [
      {
        "date": "2014-10-06",
        "ECO": "master-3489393-3948.34893",
        "source": "hardcoded from tab factory",
        "notes": "Notes with this release:\r\n\t(1) Point 1\r\n\t(2) Point 2"
      },
      {
        "date": "2014-05-06",
        "ECO": "master-7067960-760.7056",
        "source": "hardcoded from tab factory",
        "notes": "Notes with this release:\r\n\t(1) Point 1\r\n\t(2) Point 2\r\n\t(3) Point 3"
      }
    ];
  };

  return tabStorage;

}]);


services.factory('getxml', ['$http', 'loginCredentials', function($http, loginCredentials) {

  var url = "evertz";
  var getxml = {};

  getxml.directory = function(host, dir) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/'+url+dir+'?user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.async = function(host, file) {
    var record = loginCredentials.getLoginRecord();
    //var promise = $http.get('http://'+host+'/evertz/config/'+file).then(function(response) {
    var promise = $http.get('http://'+host+'/api/getxml.php/'+file+'?user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.convert = function(xml) {

    var x2js = new X2JS();

    var jsonObj = x2js.xml_str2json(xml);
    return jsonObj;
  }

  getxml.getmetadata = function(host, file) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/mxfmetadata.py?filename='+'../evertz/'+file+'&user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getsnapshot = function(host, file) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/snapshot.py?filename='+'../evertz/'+file+'&user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getjsonfile = function(host, file) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/jsonfile.py?filename='+'../evertz/'+file+'&user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getsysinfo = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/systeminfo.py'+'?user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getnetconfig = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/netinfo.py'+'?user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getnetinterface = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/installop.py'+'?user='+record.login+'&command=getnetinterfaces').then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.putnetinterface = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.put('http://'+host+'/cgi-bin/updatenetinterfaces.py'+'?user='+record.login+'&command=putnetinterfaces', data);
  }

  getxml.gettop = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/top.py'+'?user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getbmon = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/bmon.py?option=start'+'&user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.stopbmon = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/bmon.py?option=stop'+'&user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getnfsmon = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/nfsmon.py'+'?user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getAccountsLogs = function(host, filename) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/getaccountslogs.py'+'?filename='+filename+'&user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.getAccessLogs = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/getaccesslogs.py'+'?user='+record.login).then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.restartNetwork = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/installop.py?user='+record.login+'&command=restartnetwork').then(function(response) {
      return response.data;
    });
    return promise;
  };

  getxml.gethosts = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/installop.py'+'?user='+record.login+'&command=gethosts').then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.puthosts = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.put('http://'+host+'/cgi-bin/updatehosts.py'+'?user='+record.login+'&command=puthosts', data);
  }

  getxml.getntp = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/installop.py'+'?user='+record.login+'&command=getntp').then(function(response) {
      return response.data;
    });
    return promise;
  }

  getxml.putntp = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.put('http://'+host+'/cgi-bin/updatentp.py'+'?user='+record.login+'&command=putntp', data);
  }

  getxml.restartNtp = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/installop.py?user='+record.login+'&command=restartntp').then(function(response) {
      return response.data;
    });
    return promise;
  };

  getxml.getmcinfo = function(host) {
    var record = loginCredentials.getLoginRecord();
    var promise = $http.get('http://'+host+'/cgi-bin/getmcinfo.py?user='+record.login+'&command=getmcinfo').then(function(response) {
      return response.data;
    });
    return promise;
  };


  return getxml;

}]);


services.factory('getconfig', ['$scope', '$resource', function($scope, $resource) {

  var getconfig = {};

  getconfig.getdb = function() {
    var res = $resource('http://localhost:8000/api/index.php/channels');
    $scope.channels = res.get();
  }
 
  return getconfig;

}]);


services.factory('Config', ['$resource', 'loginCredentials', function($resource, loginCredentials) {
  var Config = {};

  var haveData = [];

  Config.resetHaveData = function() {
    for( var d in haveData) {
      if(haveData.hasOwnProperty(d)) {
        delete haveData[d];
      }
    }
  }

  Config.cards = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["cards"] = 1;
    var res = $resource('http://'+host+'/api/index.php/cards'+'?user='+record.login);
    return res.query();
  }

  Config.client = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["client"] = 1;
    var res = $resource('http://'+host+'/api/index.php/client'+'?user='+record.login);
    return res.query();
  }

  Config.connections = function(host, quiet) {
    if(quiet === undefined) {
      quiet = false;
    }
    var record = loginCredentials.getLoginRecord();
    if(!quiet) {
      haveData["connections"] = 1;
    }
    var res = $resource('http://'+host+'/api/index.php/connections'+'?user='+record.login);
    return res.query();
  }

  Config.channels = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["channels"] = 1;
    var res = $resource('http://'+host+'/api/index.php/channels'+'?user='+record.login);
    return res.query();
  }

  Config.profiles = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["profiles"] = 1;
    var res = $resource('http://'+host+'/api/index.php/profiles'+'?user='+record.login);
    return res.query();
  }

  Config.features = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["features"] = 1;
    var res = $resource('http://'+host+'/api/index.php/features'+'?user='+record.login);
    return res.query();
  }

  Config.mounts = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["mounts"] = 1;
    var res = $resource('http://'+host+'/api/index.php/mounts'+'?user='+record.login);
    return res.query();
  }

  Config.version = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["version"] = 1;
    var res = $resource('http://'+host+'/api/index.php/version'+'?user='+record.login);
    return res.query();
  }

  Config.profile = function(host, id) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/index.php/profiles/'+id+'?user='+record.login);
    return res.query();
  }

  Config.serialports = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["serialports"] = 1;
    var res = $resource('http://'+host+'/api/index.php/serialports'+'?user='+record.login);
    return res.query();
  }

  Config.storagelocation = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["storagelocation"] = 1;
    var res = $resource('http://'+host+'/api/index.php/storagelocation'+'?user='+record.login);
    return res.query();
  }

  Config.eco = function(host) {
    var record = loginCredentials.getLoginRecord();
    haveData["eco"] = 1;
    var res = $resource('http://'+host+'/api/index.php/eco'+'?user='+record.login);
    return res.query();
  }

  Config.tables = function(host) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/index.php/tables'+'?user='+record.login);
    return res.query();
  }

  Config.checkData = function(table) {
    return haveData[table];
  }

  Config.profilesTrans = function() {
    var res = $resource('api/index.php/profilesTrans');
    return res.get();
  }

  Config.tagchannels = function(host) {
    var res = $resource('http://'+host+'/api/index.php/tagchannels');
    return res.query();
  }

  return Config;

}]);



services.factory('UpdateConfig', ['$resource', 'loginCredentials', function($resource, loginCredentials) {
  var UpdateConfig = {};

  UpdateConfig.mounts = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/mounts'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.features = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/features'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.cards = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/cards'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.clients = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/clients'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.channels = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/channels'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.connections = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/connections'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.profiles = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/profiles'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.serialports = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/serialports'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.storagelocation = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/storagelocation'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.credentials = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/credentials'+'?user='+record.login);
    return res.save(data);
  }

  UpdateConfig.eco = function(host, data) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update.php/eco'+'?user='+record.login);
    return res.save(data);
  }

  return UpdateConfig;

}]);


services.factory('updatexml', ['$resource', 'loginCredentials', function($resource, loginCredentials) {
  var updatexml = {};

  updatexml.updateserver = function(host, data, file) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/api/update_xml.php/'+file+'?user='+record.login);
    return res.save(data);
  }

  return updatexml;

}]);


services.factory('loginCredentials', ['$http', function($http) {
  var loginCredentials = {};

  var loginStatus = false;
  var host;
  var credentials = {"credentials": [{"login": "admin", "password": "admin", "role": "admin"}]};
  var savedpath = '/';
  var savedCredentials = {};

  loginCredentials.init = function(dest) { 
    host = dest;
    this.load(host).then(function(d) {
      if(Object.keys(d).length > 0) {
        credentials = d;
      }
    });
  };

  loginCredentials.login = function(login, password, record) {
    var rc = false;
    if(login == undefined || password == undefined) {
      rc = false;
    }
    else {
      if(Object.keys(credentials).length > 0) {
        for(var i = 0; i < credentials.credentials.length; i++) {
          if(credentials.credentials[i]["login"] == login) {
            if(credentials.credentials[i]["password"] == password) {
              rc = true;
              loginStatus = true;
              record.login = credentials.credentials[i].login;
              record.password = credentials.credentials[i].password;
              record.role = credentials.credentials[i].role;
              savedCredentials.login = credentials.credentials[i].login;
              savedCredentials.password = credentials.credentials[i].password;
              savedCredentials.role = credentials.credentials[i].role;
              break;
            }
          }
        }
      }
    }
    return rc;
  };

  loginCredentials.load = function(host) {
    var promise = $http.get('http://'+host+'/api/index.php/credentials').then(function(response) {
      return response.data;
    });
    return promise;
  };

  loginCredentials.getLoginStatus = function(path) {
    savedpath = path;
    return loginStatus;
  };

  loginCredentials.getLoginRecord = function() {
    return savedCredentials;
  };

  loginCredentials.getpath = function() {
    return savedpath;
  };

  loginCredentials.getCredentials = function() {
    this.load(host).then(function(d) {
      credentials = d;
    });
    return credentials;
  };

  loginCredentials.saveCredentials = function(data) {
    $http.put('http://'+host+'/api/update.php/credentials', data);
  };

  return loginCredentials;

}]);


services.factory('Media', ['$resource', 'loginCredentials', function($resource, loginCredentials) {
  var Media = {};

  Media.getportinfo = function(host, port, path) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/mclient.py?command=getportinfo&port='+port+
                '&path='+path+'&user='+record.login);
    return res.get();
  }

  Media.sendcommand = function(host, port, command, option) {
    var record = loginCredentials.getLoginRecord();
    if(arguments.length == 4) {
      var res = $resource('http://'+host+'/cgi-bin/mclient.py?command='+command+'&option='+option+
            '&port='+port+'&path=None'+'&user='+record.login);
    }
    else {
      var res = $resource('http://'+host+'/cgi-bin/mclient.py?command='+command+'&port='+port+'&path=None'+'&user='+record.login);
    }
    return res.get();
  }

  Media.getmetadata = function(host, path, filename, use_subdir) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/mclient.py?command=getmetadata&path='+path+
        '&port=0&filename='+filename+'&use_subdir='+use_subdir+'&user='+record.login);
    return res.get();
  }

  Media.checkexists = function(host, path, filename, use_subdir) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/mclient.py?command=checkexists&path='+path+
        '&port=0&filename='+filename+'&use_subdir='+use_subdir+'&user='+record.login);
    return res.get();
  }

  Media.getplaylists = function(host) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/playlist.py?command=getplaylists&user='+record.login);
    return res.get();
  }

  Media.getplaylist = function(host, playlist) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/playlist.py?command=getplaylist&user='+record.login+
          '&playlist='+playlist);
    return res.get();
  }

  Media.saveplaylist = function(host, name, playlist) {
    var record = loginCredentials.getLoginRecord();
    var newobj = {}
    newobj['playlistname'] = name;
    newobj['playlist'] = playlist;
    var res = $resource('http://'+host+'/cgi-bin/updateplaylist.py?command=saveplaylist&user='+record.login)
    return res.save(JSON.stringify(newobj));
  }

  Media.execplaylist = function(host, port, playlist) {
    var record = loginCredentials.getLoginRecord();
    var newobj = {};
    newobj['port'] = port;
    newobj['command'] = "execplaylist";
    newobj['playlist'] = playlist;
    var res = $resource('http://'+host+'/cgi-bin/execplaylist.py?command=execplaylist&user='+record.login)
    return res.save(JSON.stringify(newobj));
  }

  Media.getloopinfo = function(host, port) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/mclient.py?command=getloopinfo&port='+port+'&path=None&user='+record.login)
    return res.get();
  }

  Media.makemxf = function(host, port, filename, sday, eday, start, dur) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/mclient.py?command=makemxf&port='+port+'&path='+filename+
			'&startday='+sday+'&endday='+eday+
			'&start='+start+'&duration='+dur+'&user='+record.login)
    return res.get();
  }

  Media.getecolist = function(host, server, path) {
    var record = loginCredentials.getLoginRecord();
    var res = $resource('http://'+host+'/cgi-bin/mclient.py?command=getecolist&user='+record.login+
          '&path='+path+'&port=None&server='+server);
    return res.get();
  }

  return Media;

}]);


services.factory('WebSock', ['$q', '$rootScope', '$location', function($q, $rootScope, $location) {
  var WebSock = {};
  var callbacks = {};
  var currentCallbackId = 0;
  var port = "8888";
  var uri = "ws";
  var state = "IDLE";

  var ws = new WebSocket("ws://" + location.host + ":" + port + "/" + uri);

  ws.onopen = function() {
    console.log("Socket has been opened");
    state = "OPENED";
  };
  
  ws.onmessage = function(message) {
    //console.log(message);
    processmsg(message);
  };

  ws.onclose = function(event) {
    console.log("Socket closed", event);
    state = "CLOSED";
  };

  function sendrequest(request) {
    var defer = $q.defer();
    var callbackId = request.callbackId;
    callbacks[callbackId] = {
      time: new Date(),
      cb: defer
    };
    ws.send(JSON.stringify(request));
    return defer.promise;
  }

  function processmsg(message) {
    var msg = JSON.parse(message.data);
    if(callbacks.hasOwnProperty(msg.callbackId)) {
      $rootScope.$apply(callbacks[msg.callbackId].cb.notify(msg));
      //delete callbacks[msg.callbackId];
    }
  }

  WebSock.getCallbackId = function() {
    currentCallbackId += 1;
    if(currentCallbackId > 9999) {
      currentCallbackId = 0;
    }
    return currentCallbackId;
  }

  WebSock.push = function(request) {
    if(state != "OPENED") {
      return null;
    }
    var promise = sendrequest(request);
    return promise;
  }

  WebSock.unpush = function(request) {
    if(state != "OPENED") {
      return null;
    }
    var callbackId = request.callbackId;
    ws.send(JSON.stringify(request));
    if(callbacks.hasOwnProperty(callbackId)) {
      delete callbacks[callbackId];
    }
  }


  return WebSock;

}]);



services.service('modalService', ['$modal', function($modal) {


  var modalDefaults = {
      backdrop: true,
      keyboard: true,
      modalFade: true,
      templateUrl: '/partials/genmodal.html'
  };

  var modalOptions = {
    modalheader: 'Header',
    modalbody: 'Body',
    modalfooter: 'Footer'
  };

  this.showModal = function (customModalDefaults, customModalOptions, timeout) {
      if(typeof timeout == "undefined")
        timeout = true;
      if (!customModalDefaults) customModalDefaults = {};
      customModalDefaults.backdrop = 'static';
      return this.show(customModalDefaults, customModalOptions, timeout);
  };

  this.show = function (customModalDefaults, customModalOptions, timeout) {
      //Create temp objects to work with since we're in a singleton service
      var tempModalDefaults = customModalDefaults;
      var tempModalOptions = {};

      //Map angular-ui modal custom defaults to modal defaults defined in service
      angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

      //Map modal.html $scope custom properties to defaults defined in service
      angular.extend(tempModalOptions, modalOptions, customModalOptions);

      if (!tempModalDefaults.controller) {
          tempModalDefaults.controller = function ($scope, $modalInstance) {
              $scope.modalOptions = tempModalOptions;
              $scope.modalOptions.ok = function (result) {
                  $modalInstance.close(result);
              };
              $scope.modalOptions.close = function (result) {
                  $modalInstance.dismiss('cancel');
              };
              if(timeout) {
                setTimeout(function() {
                  $modalInstance.dismiss();
                }, 2000);
              }
          }
      }

      return $modal.open(tempModalDefaults).result;
  };


}]);