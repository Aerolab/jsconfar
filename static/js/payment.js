/**
 * Ticket Sales
 * Powered by Mango
 */

$('.button-get-tickets').click(function(event){
  event.preventDefault();
  $('.modal-holder').show();
});

$('.modal-close').click(function(event){
  event.preventDefault();
  $('#modal-holder').hide();
});


;(function(){

  $('#payment-form').submit(function(event){
    event.preventDefault();

    if( $(this).hasClass('loading') ) {
      return false;
    }

    $(this).addClass('loading');

    $.ajax({
      'method': 'POST',
      'url': '/mango/authorization',
      'data': { 
        'email': $('#payment-email').val(),
        'cardtype': $('#payment-cardtype').val()
      },
      'success': function(data){

        if( typeof data.salesError !== 'undefined' ) {
          // Something went wrong (there are no tickets available or the sale hasn't started yet)
          if( data.salesError == "SUCH HACKER. MUCH SECURITY. WOW." ) {
            alert("Ticket sales are not yet open. Sales start on October 24 @ 13:00hs (Argentina Time [GMT-3])");
          } else {
            alert( data.salesError );
          }

          $('#payment-form').removeClass('loading');
          return;
        }
        
        initPayment(data);

      },
      'error': function(data){
        alert("We had an issue while setting up your payment. Try again!");
        $('#payment-form').removeClass('loading');
      }
    });
  });

  function initPayment(data) {
    Mango({
      'api_key': 'public_test_wsl91zxbk055ao3d', 
      'authorization_uid': data.uid
    }, function(error){

      if(error) {
        //handle error
        alert("We had an issue while setting up your payment. Try again!");
        $('#payment-form').removeClass('loading');
        return;
      }

      // Hide the input modal and show the Mango one
      $('#payment-form').removeClass('loading');
      $('#modal-holder').hide();

      this.charge(confirmPayment);
    });
  }

  function confirmPayment(error, data) {
    if(error) {
      // Todo: handle error
      alert("There was an issue when processing your payment. We'll contact you to sort out the details, but feel free to try again with another card.");
      $('#payment-form').removeClass('loading');
      return;
    }

    $.ajax({
      'method': 'POST',
      'url': '/mango/confirm',
      'data': { 'charge_uid': data.charge_uid },
      'success': function(res) {
        if(res === 'ok') {
          // Todo: success
          alert("Awesome! You'll receive an email with your ticket.");
        } else {
          // error
          alert("There was an issue when processing your payment. We'll contact you to sort out the details.");
        }
      } 
    });
  }

})();
