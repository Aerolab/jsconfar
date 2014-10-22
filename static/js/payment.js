/**
 * Ticket Sales
 */
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
          showError( data.salesError );

          $('#payment-form').removeClass('loading');
          return;
        }
        
        initPayment(data);

      },
      'error': function(data){
        showError("There are some connectivity issues and we can't get started with your payment.<br/>Try again in 30 seconds!");
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
        showError("We had an issue while setting up your payment. Try again!");
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
      showError("There was an issue when processing your payment. Your card has not been charged. We'll contact you to sort out the details, but feel free to try again with another card.");
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
          showSuccess("Awesome! You'll receive an email with your ticket.");
        } else {
          // error
          showError("There was an issue when processing your payment. Your card has not been charged. We'll contact you to sort out the details, but feel free to try again with another card.");
        }

        $('#payment-form').removeClass('loading');
        $('#modal-holder').hide();
      },
      'error': function() {
        showError("There are some connectivity issues and we can't verify if your payment was made. Contact us at <a href=\"mailto:support@jsconfar.com\">support@jsconfar.com</a>.");
        $('#payment-form').removeClass('loading');
        $('#modal-holder').show();
      }
    });
  }



  function showSuccess(message) {
    $('#payment-form').removeClass('loading');
    $('#modal-holder > .modal').hide();

    $('#modal-holder > .modal-success h2').html(message);
    $('#modal-holder > .modal-success').show();
  }


  function showError(message) {
    $('#payment-form').removeClass('loading');
    $('#modal-holder > .modal').hide();

    $('#modal-holder > .modal-error h2').html(message);
    $('#modal-holder > .modal-error').show();
  }



  $('.button-get-tickets').click(function(event){
    event.preventDefault();
    $('#modal-holder > .modal').hide();
    $('#modal-holder > .modal-payment').show();
    $('.modal-holder').fadeIn(200);
  });

  $('.modal-close').click(function(event){
    event.preventDefault();
    if( $('#payment-form').hasClass('loading') ) {
      // Don't close
      alert("Hold on, we're setting up the payment. Wait 30 seconds and refresh the page if it's still loading.");
    } else {
      $('#modal-holder > .modal').hide();
      $('#modal-holder > .modal-payment').show();
      $('#modal-holder').hide();
    }
  });

  $('.modal-success button, .modal-error button').click(function(event){
    $('.modal-close').trigger('click');
  });


  // Prevent closing the tab if the payment form is processing
  window.onbeforeunload = function (event) {
      var event = event || window.event;

      if( $('#payment-form').hasClass('loading') ) {
        return "If you close the tab while processing the payment you'll have to start again.";
      }
  };



})();
