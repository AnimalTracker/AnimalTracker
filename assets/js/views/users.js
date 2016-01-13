$(document).ready(function() {
    var users = $('#users').dataTable( {
        lengthChange: false,
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.10.10/i18n/French.json'
        },
        ajax: {
            url: 'http://localhost:3000/api/v1/users',
            dataSrc: "users"
        },  columnDefs: [ {
            targets: 'first_name',
            data: 'first_name'

        }, {
            targets: 'last_name',
            data: 'last_name'
        }, {
            targets: 'username',
            data: 'username'
        }
        ]
    });
});