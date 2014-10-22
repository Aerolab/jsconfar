/**
 * Ticket Sales
 */

$('.button-get-tickets').click(function(event){
  event.preventDefault();
  $('.modal-holder').show();
});

$('.modal-close').click(function(event){
  event.preventDefault();
  if( $('#payment-form').hasClass('loading') ) {
    // Don't close
    alert("Hold on, we're setting up the payment. Wait 30 seconds and refresh the page if it's still loading.");
  } else {
    $('#modal-holder').hide();
  }
});


// Prevent closing the tab if the payment form is processing
window.onbeforeunload = function (event) {
    var event = event || window.event;

    if( $('#payment-form').hasClass('loading') ) {
      return "If you close the tab while processing the payment you'll have to start again.";
    }
};


;(function(){

  $('#payment-form').submit(function(event){
    event.preventDefault();

    if( $(this).hasClass('loading') ) {
      return false;
    }

    $(this).addClass('loading');

    $.ajax({
      'method': 'POST',
      'url': '/tickets/authorization',
      'data': { 
        'email': $('#payment-email').val(),
        'cardtype': $('#payment-cardtype').val(),
        'paymenttype': $('#payment-paymenttype').val(),
      },
      'success': function(data){

        if( typeof data.salesError !== 'undefined' ) {
          // Something went wrong (there are no tickets available or the sale hasn't started yet)
          alert( data.salesError );

          $('#payment-form').removeClass('loading');
          return;
        }
        
        initPayment(data);

      },
      'error': function(data){
        alert("There are some connectivity issues and we can't get started with your payment. Try again in 30 seconds!");
        $('#payment-form').removeClass('loading');
      }
    });
  });

  function initPayment(data) {
    JsConfPayments({
      'api_key': 'public_test_wsl91zxbk055ao3d', 
      'authorization_uid': data.uid
    }, function(error){

      if(error) {
        //handle error
        alert("We had an issue while setting up your payment. Try again!");
        $('#payment-form').removeClass('loading');
        return;
      }

      // Hide the input modal and show the Checkout one
      $('#modal-holder').hide();

      this.charge(confirmPayment);
    });
  }

  function confirmPayment(error, data) {
    $('#modal-holder').show();

    if(error) {
      // Todo: handle error
      alert("There was an issue when processing your payment. Your card has not been charged. We'll contact you to sort out the details, but feel free to try again with another card.");
      $('#payment-form').removeClass('loading');
      return;
    }

    $.ajax({
      'method': 'POST',
      'url': '/tickets/confirm',
      'data': { 'charge_uid': data.charge_uid },
      'success': function(res) {
        if(res === 'ok') {
          // Todo: success
          alert("Awesome! You'll receive an email with your ticket.");
        } else {
          // error
          alert("There was an issue when processing your payment. Your card has not been charged. We'll contact you to sort out the details, but feel free to try again with another card.");
        }

        $('#payment-form').removeClass('loading');
        $('#modal-holder').hide();
      },
      'error': function() {
        alert("There are some connectivity issues and we can't verify if your payment was made. Contact us at support@jsconfar.com.");
        $('#payment-form').removeClass('loading');
        $('#modal-holder').show();
      }
    });
  }

})();
