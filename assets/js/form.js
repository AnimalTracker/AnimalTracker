/*global pageOptions, toastr, swal, apitoken, moment*/

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
  if(! options) {
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
        headers: { 'Authorization': 'JWT ' + apitoken }
      })
      .done(function( data ) {
        for(var propId in data) {
          if(data.hasOwnProperty(propId) && propId != 'rid') {
            var prop = $('#generated-form [name=' + propId + ']');
            prop.val(data[propId]);
            prop.change();
          }
        }

        item = data;
      });
  }

  // Load references --
  for(var refId in options.references) {
    var ref = options.references[refId];

    $.ajax({
        type: 'GET',
        url: ref.target,
        headers: { 'Authorization': 'JWT ' + apitoken }
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
        headers: { 'Authorization': 'JWT ' + apitoken },
        data: getFormInputValues()
      })
      .done(function( data ) {
        if(data.rid) {
          var rid = Array.isArray(data.rid) ? data.rid[0] : data.rid;
          // Update variables --
          options.target += rid;
          action = transformActionIntoBooleans('edit');

          // Update the header --
          headerDiv.html('<i class="fa fa-pencil"></i> ' + options.header_alt);
          $('#nb_to_add').remove();
        }

        if(!data.error) {
          // Display an info message --
          toastr.success(data.message, "Success");
        }
      });
  });


  // Delete button --
  $('#generated-delete').click(function() {
    swal({
          title: "Êtes vous sûr ?",
          text: "La suppression est définitive",
          type: "warning",
          showCancelButton: true,
          cancelButtonText: "Annuler",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Supprimer",
          closeOnConfirm: false
        },
        function(){
          $.ajax({
            type: 'DELETE',
            url: options.target,
            headers: { 'Authorization': 'JWT ' + apitoken }
          })
          .done(function() {
            swal("Supprimé", "La donnée a bien été supprimée", "success");
          });
        });
  });
};

// -- Disable fields --

var initDisableFields = function() {
  pageOptions.displayOnly.forEach(function(element) {
    $('[name=' + element.condition.id + ']').change(function() {
      disableFields(element);
    });
    disableFields(element);
  });
};

var disableFields = function(element) {
  $('[name=' + element.name + ']').prop('disabled', $('[name=' + element.condition.id + ']').val() !== element.condition.value);
};

// -- "Apply" operation --

var signedOperation = function(context, value, valueType) {
  if(value === '') {
    context.abort = true;
    return;
  }

  // Process the value
  if(valueType === 'date') {
    value = moment(value, 'DD/MM/YYYY');
  }
  else if(valueType === 'number') {
    value = parseInt(value);
  }

  // Process the sign
  if(context.lastSign === '+') { // Add operation
    if(context.type === 'date' && valueType === 'number')
      context.value.add(value, context.unit);
    else
      context.value += value;
  }
  else if(context.lastSign == '-') { // Remove operation
    if(context.type === 'date' && valueType === 'number') {
      context.value.subtract(value, context.unit);
    }
    else if(context.type === 'date' && valueType === 'date') {
      context.value = context.value.diff(value, context.unit);
      context.type = 'number';
    }
    else {
      context.value -= value;
    }
  }
  else { // Replace operation
    context.type = valueType;
    context.value = value;
  }
};

var initApplySubOperation = function(element, target) {
  // Initialise the proper selector (input or .datepicker)
  target.selector = $('[name=' + target.on + ']');
  if(target.type === 'date')
    target.dateSelector = target.selector.parent();

  // Build the function list
  target.operations = [];
  target.value.split(' ').forEach(function(op) {
    // Sign operations
    if(op === '-' || op === '+') {
      target.operations.push(function(context) {
        context.lastSign = op;
      });
      return;
    }

    // Value operations
    var info = op.split(':');
    var type = info[0];
    var ref = info[1];
    target.operations.push(function(context) {
      if(context.abort)
        return;

      signedOperation(context, $('[name=' + ref + ']').val(), type);

      if(context.lastSign)
        context.lastSign = null;
    });
  });
};

var initApplyOperation = function() {
  pageOptions.applyOperations.forEach(function(element) {
    element.selector = $('[name=' + element.name + ']');
    element.apply.forEach(function(target) { initApplySubOperation(element, target); });
    element.selector.change(function() { applyOperation(element); });
  });
};

var applyMutex = false;

var applyOperation = function(element) {
  if(applyMutex)
    return;
  else
    applyMutex = true;


  element.apply.forEach(function(target){
    var context = { value: null, type: null, lastSign: null, unit: target.unit };

    target.operations.forEach(function(op) {
      op(context);
    });

    // Apply its value:
    if(context.value != null && !context.abort) {
      if(target.type === 'date' && context.type === 'date') {
        target.dateSelector.datepicker('setDate', context.value.format('DD/MM/YYYY'));
      }
      else
        target.selector.val(context.value);
    }
  });

  applyMutex = false;
};

$(document).ready(function() {
  initForm();
  initDisableFields();
  initApplyOperation();
});
