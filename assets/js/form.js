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

  // Init jquery references --
  var headerIcon = $('#form-panel .panel-heading i');
  var headerDiv = $('#form-panel .panel-heading');
  var datepickers = $('.datepicker');

  // Set the header icon --
  headerIcon.addClass(action.edit ? 'fa fa-pencil' : 'fa fa-plus');

  // Init datepicker --
  datepickers.datepicker({
    format: 'dd/mm/yyyy',
    language: options.lang
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
        var select = $('#generated-form [name=' + ref.name + ']');

        // Create each option --
        for(var itemId in data[ref.data]) {
          var option = data[ref.data][itemId];

          // Label to display --
          var label = [];
          if(ref.property_to_display) {

            // Parse properties to display --
            for(var propNb in ref.property_to_display) {
              var prop = ref.property_to_display[propNb];
              label.push(option[prop]);
            }
          }
          else {
            label.push(option.rid);
          }
          select.append('<option value="'+ option.rid +'">'+ label.join(' - ') +'</option>');
        }

        // Refresh select --
        if(item) {
          select.val(item[ref.name]);
        }
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