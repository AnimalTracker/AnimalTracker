/*global pageOptions, toastr*/

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

var setHeaderIcon = function(action) {
  if(action.edit) {
    $('').text('')
  }
}

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

  // Init jquery references --
  var headerIcon = $('#form-panel .panel-heading i');
  var headerDiv = $('#form-panel .panel-heading');
  var datepickers = $('.datepicker');

  // Set the header icon --
  headerIcon.addClass(action.edit ? 'fa fa-pencil' : 'fa fa-plus');

  // Init datepicker --
  datepickers.datepicker({
  });

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
        console.log(data);
        item = data;
      });
  }

  // Load references --
  for(var refId in options.references) {
    var ref = options.references[refId];

    console.log(options);
    $.ajax({
        type: 'GET',
        url: ref.target,
        beforeSend: function( xhr ) {
          // xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        }
      })
      .done(function( data ) {
        var select = $('#' + ref.name);

        for(var itemId in data[ref.data]) {
          var item = data[ref.data][itemId];
          select.append('<option value="'+ item.rid +'">'+ item.rid +'</option>');
        }
        console.log(data);
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
        console.log(data)

        if(data.rid) {
          // Update variables --
          options.target += '/' + data.rid;
          action = transformActionIntoBooleans('edit');

          // Update the header --
          headerDiv.html('<i class="fa fa-pencil"></i> ' + options.header_alt);
        }

        if(!data.error) {
          // Display an info message --
          toastr.success(data.message, "Success");
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