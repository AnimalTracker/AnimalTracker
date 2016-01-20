/*global pageOptions*/

var item = {};
var action = {};

// Form system --

var transformActionIntoBooleans = function(string) {
  return {
    edit: string === 'edit',
    create: string != 'edit'
  };
};

var getFormInputValues = function() {
  var values = {};

  $('#generated-form :input').each(function() {
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

  action = transformActionIntoBooleans(options.action);

  // Load if edit --
  if(action.edit) {
    $.ajax({
        type: 'GET',
        url: options.target,
        beforeSend: function( xhr ) {
          // xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        }
      })
      .done(function( data ) {
        for(var propId in data) {
          if(data.hasOwnProperty(propId) && propId != 'rid')
            $('#generated-form [name=' + propId + ']').val(data[propId]);
        }
        item = data;
      });
  }

  // Submit button --
  $('#generated-submit').click(function() {
    $.ajax({
        type: action.edit ? 'PUT' : 'POST',
        url: options.target,
        data: getFormInputValues(),
        beforeSend: function( xhr ) {
          // xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        }
      })
      .done(function( data ) {
        console.log(data);

        if(data.rid) {
          options.target += '/' + data.rid;
          action = transformActionIntoBooleans('edit');
        }
      });
  });


  // Delete button --
  $('#generated-delete').click(function() {
    $.ajax({
        type: 'DELETE',
        url: options.target,
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