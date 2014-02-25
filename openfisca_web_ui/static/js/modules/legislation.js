define(['jquery', 'x-editable'], function ($) {

	function init (config) {

		//turn to inline mode
		$.fn.editable.defaults.mode = 'inline';

		// editable
		$('.editable').editable({
			escape: true,
			type: 'text',
			url: config.legislationUrl,
			pk: 1,
			title: 'Nouvelle valeur',
			success: function(response, newValue) {
				if (response.status == 'error') {
					//msg will be shown in editable form
					return response.msg;
				}
			}
		});

		$('.collapse-node-toggle').on('click', function(evt) {
			evt.preventDefault();
		});

		$('.btn-expand-all').on('click', function(evt) {
			$('.collapse-node-toggle.collapsed').removeClass('collapsed');
			$('.collapse-node.collapse').addClass('in').removeClass('collapse').css({height: ''});
		});

		$('.btn-collapse-all').on('click', function(evt) {
			$('.collapse-node-toggle').addClass('collapsed');
			$('.collapse-node').addClass('collapse').removeClass('in');
		});
	}

	return {init: init};

});