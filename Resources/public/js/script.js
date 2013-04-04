// -- jQueryMobile
$(document).bind('mobileinit', function(){
  $.mobile.loader.prototype.options.text = 'Chargement ...';
  $.extend(  $.mobile , {
    pageLoadErrorMessage: 'Erreur !'
  });
});

$(document).bind('pagechange', function( e, data ) {
  console.log('script', 'bind pagechange', document.location.href);
  //history
  if (document.location.href.match(/\/m\/route/gi) ||
      !document.location.href.match(/\/m\/[\w]+/gi)) { //on n'initialize pas sur route
    console.log('script', 'bind pagechange', 'home');
    $('[role="navigation"] li').css('width','33.333%');
    $('#historyback').hide();
    $('[role="navigation"] li#tohome').hide();
  } else {
    console.log('script', 'bind pagechange', 'history');
    //history
    setTimeout(function(){
      //console.log('script', 'bind pagechange', 'history setTimeout', history.state, document.location.href);
      console.log('script', 'bind pagechange', 'location ->', document.location);
      //API.insertIndexedDb('skhf', 'm_lastpage', {id: 0, url: document.location.href});
/*
      if (history.state &&
          (history.state.initialHref == document.location.href ||
           history.state.initialHref == document.location.href + '/')) {
        console.log('pageshow', history.state.initialHref, document.location.href);
        //console.log('pageshow', 'hide #historyback', $('#historyback'));
      }
*/

      $('[role="navigation"] li').css('width','25%');
      $('body a#historyback').show();
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
$(document).on('click', '.modal-close', function(){
  $('.modal').modal('hide');
})

// -- PAGEs
$(document).on('click', '#route-www', function(e){
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
$(document).on('click', '#route-m', function(e){
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

$(document).on('click', '#historyback', function(){
  history.go(-1);
  return false;
})
$(document).on('click', '.fav', function(){
  UI.togglePlaylist($(this));
  return false;
})
$(document).on('click', '.signin', function(){
  console.log('script', '.signin trigger', Skhf.session.datas);
  if (!Skhf.session.datas.email) {
    UI.auth(API.config.v3_root + '/m/notifs');
  } else {
    $.mobile.changePage(API.config.v3_root + '/m/notifs');
  }
  return false;
});
$(document).on('click', '.signout', function(){
  Skhf.session.signout(function(){
    console.log('script', '.signout trigger', 'callback');
    UI.loadUser();
    $.mobile.changePage(API.config.v3_root + '/m')
  });
  return false;
})