// -- jQueryMobile
$(document).bind('mobileinit', function(){
	$.mobile.loader.prototype.options.text = 'Chargement ...';
	$.extend(	$.mobile , {
		pageLoadErrorMessage: 'Erreur !'
	});
});
var skLoaded = false;
$(document).bind('pagechange', function( e, data ) {
	console.log('script', 'bind pagechange', document.location.href);
	//history
	if (skLoaded == false) {
		skLoaded = true;
		$('[role="navigation"] li').css('width','33.333%');
		$('#historyback').hide();
		$('[role="navigation"] li#tohome').hide();
	} else {
		//history
		setTimeout(function(){
			//console.log('script', 'bind pagechange', 'history setTimeout', history.state, document.location.href);
			console.log('script', 'bind pagechange', 'location ->', document.location);
			API.insertIndexedDb('skhf', 'm_lastpage', {id: 0, url: document.location.href});
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