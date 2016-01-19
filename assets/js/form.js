/*global pageOptions*/

// Form system --

var getFormInputValues = function() {
  var inputs = $('#generated-form :input');
  var values = {};

  inputs.each(function() {
    values[this.name] = $(this).val();
  });

  return values;
};
var initForm = function() {
  // Check for a generated form --
  var form = $('#generated-form');
  if(!form)
    return;

  // Get data --
  var options = pageOptions;
  if(!options) {
    console.error('Error: missing pageOptions var.');
    return
  }
  console.log(form);

  // Submit button --
  $('#generated-submit').click(function() {
    $.ajax({
        type: 'POST',
        url: options.target,
        data: getFormInputValues(),
        beforeSend: function( xhr ) {
          // xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        }
      })
      .done(function( data ) {
        console.log( "Sample of data:", data );
      });
  });
};

//

$(document).ready(function() {
  initForm();
});