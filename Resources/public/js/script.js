// -- jQueryMobile
$(document).bind("mobileinit", function(){
  $.mobile.loader.prototype.options.text = "Chargement ...";
  $.extend(  $.mobile , {
    pageLoadErrorMessage: 'Erreur !'
  });
});
var skLoaded = false;
$(document).bind( "pagechange", function( e, data ) {
  //history
  if (skLoaded == false) {
    skLoaded = true;
    $('[role="navigation"] li').css('width','50%');
    $('[role="navigation"] li #historyback').parent().hide();
  } else {
    console.log("pageshow", history.state.initialHref, document.location.href);
    //history
    setTimeout(function(){
      if (history.state.initialHref == document.location.href) {
        $('[role="navigation"] li').css('width','50%');
        $('[role="navigation"] li #historyback').parent().hide();
      } else {
        $('[role="navigation"] li #historyback').parent().show();
        $('[role="navigation"] li').css('width','33.333%');
      }
    }, 500);
  }
  //flagged
  if (Skhf.session.user) {
    UI.loadUserPrograms();
  }
});


// -- API
API.init(function(){
  console.log('API.init', 'callback');
  
  // session
  Skhf.session = new BaseSession(function(){}, { 
    'with_notifications': 1
  });
});

// -- PAGEs
$('#historyback').live('click', function(){
  if (document.location.href.indexOf('latlng=') != -1) {
    history.go(-2);
  } else {
    history.back();
  } 
  return false;
})
$('.fav').live('click', function(){
  UI.togglePlaylistProgram($(this));
  return false;
})
$('.signout').live('click', function(){
  Skhf.session.signout(function(){
    UI.loadUser();
    $.mobile.changePage('/app_dev.php/m')
  });
  return false;
})