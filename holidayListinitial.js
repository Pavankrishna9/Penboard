/* Copyright (c) 2014 Vivek Nalla <vivek.candid@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or  * without modification, are permitted provided that the 
 * redistributions of source code must retain the above
 * copyright notice
 */

select_namespace("dff.settings.d2t.holidaylist", function(namespace) {

	namespace.init = function(app) {
		var node = app.get_node();
		var page = app.get_page();
	};

});

select_namespace("dff.settings.d2t.holidaylist",function(namespace) {

			namespace.init = function(app) {
				var node = app.get_node();
				var page = app.get_page();
				var gridNo = app.holidaylist;
				var data4= [];
				for(var i=0;i<13;i++){
					data4[i] = [];
					for(var j=0;j<6;j++){
						data4[i][j] = new dataObj();
					}
				}