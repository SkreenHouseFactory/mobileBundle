// -- UI
var UI;
UI = {
  user: '',
  signinCallback: null,
  playlist: null,
  badge_notification: '<span class="badge">%count%</span>',
  loader: '<div class="progress progress-striped active"><div class="bar" style="width:0%"></div></div>',
  init: function(callback) {
    var self = this;

    //callback
    if (typeof callback != 'undefined') {
      callback();
    }
  },
  //toggle favorite
  togglePlaylist: function(trigger){
    var self = this;
    var value = trigger.data('id');
    var remove = trigger.data('theme') == 'b' ? true : false;
    trigger.data('theme', trigger.data('theme') == 'b' ? 'c' : 'b');
    console.log('UI.togglePlaylistProgram', trigger, Skhf);
    if (Skhf.session != null && 
        Skhf.session.datas.email) {
      API.togglePreference('like', value, function(value){
        console.log('UI.togglePlaylistProgram', 'callback', value, trigger);
      });
    } else {
      self.signin(function(){
        self.togglePlaylistProgram(trigger);
        $.mobile.changePage(API.config.v3_root + '/m/program/'+trigger.data('id'))
      });
    }
  },
  //toggle btn
  loadPlaylistTriggers: function(parameter, ids, elmt) {
    console.log('UI.loadPlaylistTriggers', ids);
		for (k in ids) {
      $('.fav[data-id="' + ids[k] + '"]:not(.flagged)', elmt).addClass('flagged')
                                                             .find('.ui-btn-text')
                                                             .html('<i class="icon-ok-sign icon-white"></i> Dans vos playlists');

		}
  },
  unloadPlaylistTriggers: function(parameter, ids, elmt) {
    console.log('UI.unloadPlaylistTriggers', ids);
		for (k in ids) {
      $('.fav.flagged[data-id="' + ids[k] + '"]', elmt).removeClass('flagged')
                                                       .find('.ui-btn-text')
                                                       .html('<i class="icon-plus-sign"></i> Ajouter à vos playlists');
		}
  },
  //user infos
  loadUser: function() {
    console.log('UI.loadUser', Skhf.session.datas.email, this.user);
    if (this.user) {
      if (this.user == Skhf.session.datas.email) {
        console.warn('UI.loadUser', 'already loaded');
        return;
      } else {
        //TODO : unload user !
      }
    }

    this.user = Skhf.session.datas.email;
    if (this.user) {
      console.log('UI.loadUser', 'notifications', Skhf.session.datas.notifications.length);
      this.loadUserPrograms();
      $('#tomatv .notifications').html(' (' + Skhf.session.datas.notifications.length + ')');
    } else {
      $('#tomatv .notifications').empty();
    }

    $('.user-off, .user-on').toggleClass('hide');
  },
  //toggle btn
  loadUserPrograms: function(ids, elmt) {
    var ids  = typeof ids  != 'undefined' ? ids  : Skhf.session.datas.queue;
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    //console.log('UI.loadUserPrograms', ids, elmt);
    this.loadPlaylistTriggers('like', ids, elmt);
  },
  unloadUserPrograms: function(ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    //console.log('UI.unloadUserPrograms', ids, elmt);
		this.unloadPlaylistTriggers('like', ids, elmt);
  },
  // -- insert loader
  appendLoader: function(elmt, timer) {
    $('.progress', elmt).remove();
    elmt.append(this.loader);
    $('.progress .bar', elmt).animate({'width': '100%'}, typeof timer != 'undefined' ? timer : 5000);
  },
  // -- remove loader
  removeLoader: function(elmt) {
    elmt.find('.progress').remove();
  },
  // -- ad manager
  ad: function() {
    var cookie = API.cookie('ad');
    console.log('UI.ad', 'cookie:' + cookie);
  },
  error: function(){
  },
  signin: function(callback) { // signin
    $.mobile.changePage(API.config.v3_root + '/m/signin?url=' + escape(document.location))
    //document.location = API.config.v3_root + '/m/signin?url='+escape(document.location);
    this.signinCallback = callback;
  },
  loadSignin: function(callback) {
    var self = this;
    var easyXDMsocket = new easyXDM.Socket({
        remote: API.config.popin + 'signin?fromWebsite=mobile&createIframe=1&parcours=anonyme_favoris&session_uid=' + Skhf.session.uid,
        container: 'popin',
        props: {
            frameborder: "no",
            scrolling: "no",
            width: '100%',
            height: '100%',
            allowTransparency: 'true'
        },
        lazy: false,
        onMessage: function(message, origin) {
            message = $.parseJSON(message);
            console.log('easyXDMsocket.onMessage', message);
            var args = {'with_offers':1,'player':'hls'};
            if (message[0] == "close") {
              Skhf.session.sync(function() {
                if (self.signinCallback != null) {
                  self.signinCallback();
                } else {
                  $.mobile.changePage(API.config.v3_root + '/m/notifs')
                }
              },{
				        with_notifications: 1,
				        //with_friends: 1,
				        //with_friends_playlists: 1
				      });
    
            //paywall
            } else if (message[0] == "play") {
              alert('easyXdm play');
    
            //login/signup
            } else if (message[0] == "success") {
              //document.location = destination;
            } else if (message[0] == "signout") {
              Skhf.session.signout();
              //document.location = destination;
            } else if (message[0] == "successFacebook") {
              var datas = message[1];
              var args = {
                fbuid: datas.fbuid,
                session_uid: datas.session_uid
              };
              
              API.query('POST', 'user', args, function (error, resp) {
                if(error)
                  return false;
              });
            }
        }
    });
  },
  loadCinemas: function(url){
    console.log('UI.loadCinemas');
    API.geolocation(function(position){
      $.mobile.changePage( url+'?latlng=' + position);
    },function(msg, code){
      console.log('UI.loadCinemas', 'error_code:', code);
      $('#dialog').html('<p class="alert alert-error">' + msg + '</p>');
    });
  },
  navbar: function(active){
    $('#navbar a').removeClass('ui-btn-active');
    $('#navbar #' + active + ' a').addClass('ui-btn-active');
  }
}