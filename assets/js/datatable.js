/*global pageOptions, datatableOptions, toastr*/

$(document).ready(function() {
  var options = datatableOptions;

  // Process toggle buttons --
  var rawSource = options.ajax.url;
  var getSource = function() {
    var result = rawSource;
    options.toggle.forEach(function(toggle) {
      result += $('#toggle-' + toggle.name).prop('checked') ? toggle.on : toggle.off;
    });
    return result;
  };

  options.toggle.forEach(function(toggle) {
    $('#toggle-' + toggle.name).bootstrapToggle({
      on: pageOptions.t[toggle.labelPath + '_on'],
      off: pageOptions.t[toggle.labelPath + '_off']
    });
  });

  options.ajax.url = getSource();

  // Process the render functions as strings
  options.columnDefs.forEach(function(col) {
    if(col.type === 'reference')
      col.render = function (data, type, row) {
        // Transform the row in usable data --
        var result = eval(col.transform)(row);

        // Display it --
        return result ? '<a class="confirm" href="' + result.href +'"> ' + result.label + '</a>' : '';
      };
  });

  // Add the Edit column --
  options.columnDefs.push({
    targets: 'edit',
    sortable: false,
    render : function (data, type, row) {
      return '<a class="confirm" href="' + pageOptions.viewRoute + row.rid+'"><i class="fa fa-pencil"></i> ' + pageOptions.editLabel + '</a>';
    }
  });

  // Change the layout --
  options.fnInitComplete = function() {
    $('#toggle-row').prependTo('#datatable_length');
  };

  // Add the error callback --
  options.ajax.error = function(err) {
    var data = err.responseJSON;
    toastr.error(data.message, data.title);
  };

  var table = $('#datatable').DataTable(options);


  // Toggle updates --
  options.toggle.forEach(function(toggle) {
    $('#toggle-' + toggle.name).change(function() {
      table.ajax.url(getSource()).load();
    });
  });
});