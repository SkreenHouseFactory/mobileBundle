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
  togglePlaylistProgram: function(trigger){
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
        $.mobile.changePage(API.config.v3_root + 'm/program/'+trigger.data('id'))
      });
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
      $('#tomatv .notifications').html(' ('+Skhf.session.datas.notifications.length+')');
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
    for (key in ids) {
      //console.log('UI.loadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.fav[data-id="' + ids[key] + '"]:not(.flagged)', elmt).addClass('flagged')
                                                               .find('.ui-btn-text')
                                                               .html('<i class="icon-ok-sign icon-white"></i> Dans vos playlist');
    }
  },
  unloadUserPrograms: function(ids, elmt) {
    var elmt = typeof elmt != 'undefined' ? elmt : $('body');
    //console.log('UI.unloadUserPrograms', ids, elmt);
    for (key in ids) {
      //console.log('UI.unloadUserPrograms', ids[key], '.actions[data-id="' + ids[key] + '"] a.fav:not(.btn-primary)');
      $('.fav.flagged[data-id="' + ids[key] + '"]', elmt).removeClass('flagged')
                                                         .find('.ui-btn-text')
                                                         .html('<i class="icon-plus-sign"></i> Ajouter à votre télé');
    }
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
    $.mobile.changePage(API.config.v3_root + 'm/signin?url='+escape(document.location))
    //document.location = API.config.v3_root + 'm/signin?url='+escape(document.location);
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
                  $.mobile.changePage(API.config.v3_root + 'm/notifs')
                }
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

    if (navigator.geolocation) {
      function successCallback(position){
        var date = new Date();
        date.setTime(date.getTime() + (30 * 60 * 1000));
        API.cookie('latlng', position.coords.latitude + ',' + position.coords.longitude, date);
        console.log('geoloc successCallback', "Latitude : " + position.coords.latitude + ", longitude : " + position.coords.longitude);
      
        $.mobile.changePage( url+'?latlng='+position.coords.latitude+','+position.coords.longitude );
      }
      function errorCallback(error){
        console.log('UI.loadCinemas', 'error', error);
        switch(error.code){
          case error.PERMISSION_DENIED:
            $('#dialog').html('<p class="alert alert-error">Vous n\'avez pas autorisé l\'accès à votre position géographique.</p>');
            break;      
          case error.POSITION_UNAVAILABLE:
            $('#dialog').html('<p class="alert alert-error">Votre emplacement géographique n\'a pas pu être déterminé.</p>');
            break;
          case error.TIMEOUT:
            $('#dialog').html('<p class="alert alert-error">Le service n\'a pas répondu à temps.</p>');
            break;
        }
      }
      watchId = navigator.geolocation.watchPosition(successCallback, 
                                                    errorCallback, 
                                                    {enableHighAccuracy:true});
      console.log('UI.loadCinemas', 'watchPosition', watchId)
    } else {
      //$('#dialog').html('<p class="alert alert-error">Votre navigateur ne prend pas en compte la géolocalisation.</p>');
    }
  },
  navbar: function(active){
    $('#navbar a').removeClass('ui-btn-active');
    $('#navbar #' + active + ' a').addClass('ui-btn-active');
  }
}