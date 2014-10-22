/**
 * Ticket Sales
 * Powered by Mango
 */

;(function(){

  $('#payment-button').click(function(){
    $.ajax({
      'method': 'POST',
      'url': '/mango/authorization',
      'data': { 
        'cardtype': $('#cardtype').val(), 
        'email': $('#email').val() 
      },
      'success': function(data){

        if( typeof data.salesError !== 'undefined' ) {
          // Something went wrong (there are no tickets available or the sale hasn't started yet)
        } else {
          initPayment(data);
        }

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
        return;
      }

      this.charge(confirmPayment);
    });
  }

  function confirmPayment(error, data) {
    if(error) {
      // handle error
      return;
    }

    $.ajax({
      'method': 'POST',
      'url': '/mango/confirm',
      'data': { 'charge_uid': data.charge_uid },
      'success': function(res) {
        if(res === 'ok') {
          // success
        } else {
          // error
        }
      } 
    });
  }

})();
