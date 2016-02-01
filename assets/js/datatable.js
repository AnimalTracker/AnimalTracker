/*global pageOptions, datatableOptions*/

$(document).ready(function() {
  var options = datatableOptions;

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

  $('#datatable').dataTable(options);
});