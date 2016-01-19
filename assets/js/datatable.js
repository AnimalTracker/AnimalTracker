/*global pageOptions, datatableOptions*/

$(document).ready(function() {
  var options = datatableOptions;

  options.columnDefs.push({
    targets: 'edit',
    sortable: false,
    render : function (data, type, row) {
      return '<a class="confirm" href="' + pageOptions.viewRoute + row.rid+'"><i class="fa fa-pencil"></i> ' + pageOptions.editLabel + '</a>';
    }
  });

  $('#datatable').dataTable(options);
});