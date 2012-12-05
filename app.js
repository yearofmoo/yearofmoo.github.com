window.addEvent('domready',function() {

  Cufon.replace('#navigation ul a', {
    fontFamily: 'Nevis',
    color : '#eeeeee',
    hover : {
      color : '#ffffff'
    }
  });
  Cufon.replace('h3', { fontFamily: 'Nevis' }); 
  Cufon.replace('.btn-inner', { fontFamily: 'Nevis' }); 
  Cufon.replace('#respond,#comments,h2,th', {
    fontFamily: 'Nevis',
  }); 
  Cufon.now();

  setTimeout(function() {
    Cufon.now();
  },2000);

});
