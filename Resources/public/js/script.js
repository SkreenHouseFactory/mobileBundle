// -- jQueryMobile
$(document).bind('mobileinit', function(){
  $.mobile.loader.prototype.options.text = 'Chargement ...';
  $.extend(  $.mobile , {
    pageLoadErrorMessage: 'Erreur !'
  });
});
var skLoaded = false;
$(document).bind('pagechange', function( e, data ) {
  console.log('script', 'bind pagechange', document.location.href);
  //history
  if (skLoaded == false) { //on n'initialize pas sur route
    skLoaded = true;
    $('[role="navigation"] li').css('width','33.333%');
    $('#historyback').hide();
    $('[role="navigation"] li#tohome').hide();
  } else {
    //history
    setTimeout(function(){
      //console.log('script', 'bind pagechange', 'history setTimeout', history.state, document.location.href);
      console.log('script', 'bind pagechange', 'location ->', document.location);
      //API.insertIndexedDb('skhf', 'm_lastpage', {id: 0, url: document.location.href});
      if (history.state &&
          (history.state.initialHref == document.location.href ||
           history.state.initialHref == document.location.href + '/')) {
        console.log('pageshow', history.state.initialHref, document.location.href);
        $('[role="navigation"] li').css('width','33.333%');
        $('[role="navigation"] li#tohome').hide();
        $('body a#historyback').hide();
        //console.log('pageshow', 'hide #historyback', $('#historyback'));
      } else {
        $('[role="navigation"] li').css('width','25%');
        $('body a#historyback').show();
      }
    }, 500);
  }
  //flagged
  if (Skhf.session.user) {
    UI.loadUserPrograms();
  }
});

UiView.init();

// -- API
API.init(function(){
  console.log('API.init', 'callback');

  // session
  Skhf.session = new BaseSession(function(){}, { 
    'with_notifications': 1
  });
});

//modal
$('.modal-close').live('click', function(){
  $('.modal').modal('hide');
})

// -- PAGEs
$('#route-www').live('click', function(e){
	//alert('#route-www');
	e.preventDefault();
	//API.cookie('mobile', 'deny');
	//alert('mobile=deny:' + (document.referrer ? document.referrer : 'http://www.myskreen.com'));
  var denyurl = document.referrer ? document.referrer : 'http://www.myskreen.com';
  if ($(this).hasClass('deny')) {
    denyurl += '?setDenyMobile';
  }
	document.location = denyurl;
	return false;
})
$('#route-m').live('click', function(e){
	//alert('#route-m');
	e.preventDefault();
	//API.cookie('mobile', 'allow');
	var match = document.referrer.match(/\/(film|serie|documentaire|emission|court-metrage|concert|spectacle|theatre)\/[\w|-]+\/[\d]+/gi);
	if (match) {
		console.log('match', match);
		var ids = match[match.length - 1].match(/\/[\d]+/gi);
		console.log('ids', ids);
		var id = ids[ids.length - 1];
    $.mobile.changePage(API.config.v3_root + '/m/program' + id);
	} else {
    $.mobile.changePage(API.config.v3_root + '/m');
	}
	return false;
})

$('#historyback').live('click', function(){
  if (document.location.href.indexOf('latlng=') != -1) {
    history.go(-2);
  } else {
    history.back();
  } 
  return false;
})
$('.fav').live('click', function(){
  UI.togglePlaylist($(this));
  return false;
})
$('.signin').live('click', function(){
  console.log('script', '.signin trigger', Skhf.session.datas);
  if (!Skhf.session.datas.email) {
    UI.auth(API.config.v3_root + '/m/notifs');
  } else {
    $.mobile.changePage(API.config.v3_root + '/m/notifs');
  }
  return false;
});
$('.signout').live('click', function(){
  Skhf.session.signout(function(){
    console.log('script', '.signout trigger', 'callback');
    UI.loadUser();
    $.mobile.changePage(API.config.v3_root + '/m')
  });
  return false;
})