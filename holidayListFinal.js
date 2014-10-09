/* Copyright (c) 2014 Vivek Nalla <vivek.candid@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or  * without modification, are permitted provided that the  
 * redistributions of source
 * code must retain the above copyright notice
 */


select_namespace(
		"dff.settings.d2t.holidaylist",
		function(namespace) {

			namespace.getHolidayListData = function() {
				return {
					"vendor" : {
						"271" : {
							"centerName" : "Adelaide",
							"isChecked" : "false",
							"weekends" : [ "false", "true", "true", "true",
									"true", "true", "false" ],
							"eventDate" : [ "2 Jan 2012", "26 Jan 2012",
									"12 Mar 2012", "6 Apr 2012", "7 Apr 2012",
									"9 Apr 2012", "25 Apr 2012", "11 Jun 2012",
									"1 Oct 2012", "25 Dec 2012", "26 Dec 2012",
									"1 Jan 2013", "28 Jan 2013", "11 Mar 2013",
									"29 Mar 2013" ]
						},