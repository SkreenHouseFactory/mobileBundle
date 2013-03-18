// -- UI
var UI;
UI = {
  user: '',
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
      console.log('UI.loadUser', 'notifications', Skhf.session.datas.notifications);
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
  signin: function(url) { // signin
    console.log('UI.signin', url);
		Skhf.session.callbackSignin = function() {
			$.mobile.changePage(url);
		}
		this.loadSignin();
  },
  loadSignin: function(callback) {
    var self = this;
    API.quickLaunchModal('signup', function(){
    	console.log('UI.loadSignin', 'callback', Skhf.session.datas);
			$('.modal').trigger('create');
			$('.modal ul.alert').addClass('ui-body ui-body-e');
			$('.modal ul.ui-controlgroup li a').bind('click', function(){
				$('.modal ul.ui-controlgroup li a').removeClass('ui-btn-active');
				var trigger = $(this);
				setTimeout(function(){
					trigger.addClass('ui-btn-active');
	    		console.log('UI.loadSignin', 'ui-controlgroup click');
				}, 500);
			});
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
  //paywall
  paywall: function(id, callback) {
    var self = this;
    console.log('UI.paywall', id);
    API.quickLaunchModal('signin', function() {
			$('.modal').trigger('create');
      if (!Skhf.session.datas.email) {
        self.paywall(id, callback);
      }
    },{parcours: 'anonyme_favoris', occurrence_id: id});
  },
  play: function(id, args) {
    console.log('UI.play', id, args);
    Player.playOccurrence(id, function(){}, args);
  },
  navbar: function(active){
    $('#navbar a').removeClass('ui-btn-active');
    $('#navbar #' + active + ' a').addClass('ui-btn-active');
  }
}