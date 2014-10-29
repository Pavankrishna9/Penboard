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
													"isChecked" : "true",
						}
					},
/**					"user" :{
						"272" : {
							"centerName" : "India",
							"isChecked" : "true",
							"weekends" : [ "false", "true", "true", "true",
									"true", "true", "false" ],
							"eventDate" : [ "2 Jan 2012", "26 Jan 2012",
									"12 Mar 2012", "6 Apr 2012", "7 Apr 2012",
									"9 Apr 2012", "25 Apr 2012", "11 Jun 2012",
																		"29 Mar 2013" ]
						},
						"999" : {
							"centerName" : "Pakistan",
							"isChecked" : "true",
							"weekends" : [ "true", "true", "true", "true",
									"true", "false", "false" ],
													}
					}
				};
			}

			namespace.init = function(app) {
				if (!app.data)
					app.data = {};
				
				var spinner = null;
				var $spinnerDiv = $(document.body);
				if($spinnerDiv) {
					spinner = bigpipe.miniloader.show($spinnerDiv);
				}
				
				$.ajax({
				       url  : "hlistall",
				       type : "GET",
				       dataType : "html",
				       contentType: 'application/json',
				       data : {uitoken : window.uitoken},
				       async : true,
				       success: function(msg){
				    	    bigpipe.miniloader.stop(spinner);
						   	var holidayListData = app.data.holidayList = jQuery.parseJSON(msg);
							var centerList = app.data.centerList = namespace
									.getSortedHolidayList(holidayListData);
							var visibleList = app.data.visibleList = namespace
									.getVisibleList(centerList, holidayListData);
							namespace.initHolidayListGrid(app, holidayListData, visibleList);
							namespace.initSideBar(app, centerList, visibleList, holidayListData);
							
							$("body").delegate(".userHolidayList", "change", function(e){
								var centerId = this.id;
								var value = this.value;
								var col = workbook.getCellRowColByName(centerId).col
								var userMap = holidayListData.user;
								var vendorMap = holidayListData.vendor;
								
								var exists = false;
								for (var i in userMap){
									if (userMap[i].centerName == value) exists = true;
								}
								for (var i in vendorMap){
									if (vendorMap[i].centerName == value) exists = true;
								}
								if (!exists){
									app.holidaylist.setData(1, col, value, {value : value});
									holidayListData.user[centerId].centerName = [value];
								}
								else {
									alert("Duplicate Name");
								}
							});
				       },
				       error: function(msg){
				    	    bigpipe.miniloader.stop(spinner);
				       }
				});
				
				$('#savebutton').click(function(){
					var spinner = null;
					var $spinnerDiv = app.get_node();
					if($spinnerDiv) {
						spinner = bigpipe.miniloader.show($spinnerDiv);
					}
					namespace.updateDataFromGrid(app, app.data.holidayList);
					var visibleListNames = [];
					var visibleList = app.data.visibleList;
					for (var i in visibleList){
						var isUser = app.data.holidayList.vendor[visibleList[i]] == null;
						if (isUser) visibleListNames[visibleListNames.length]=(app.data.holidayList.user[visibleList[i]].id);
						else visibleListNames[visibleListNames.length]=(app.data.holidayList.vendor[visibleList[i]].slaName);
					}
					$.ajax({
					       url  : "savehlist",
					       type : "POST",
					       data : {uitoken : window.uitoken, holidayData : JSON.stringify(app.data.holidayList.user), visibleList : JSON.stringify(visibleListNames)},
					       async : true,
					       success: function(msg){
					    	   bigpipe.miniloader.stop(spinner);
							   alert("Saved Holiday List");
					       },
					       error : function (msg){
					    	   bigpipe.miniloader.stop(spinner);
					    	   alert("Error in Saving Holiday List" + msg.statusText);
					       },
					});
				});
			}

			namespace.getSortedHolidayList = function(holidayListData) {
				var checkedList = [];
				var uncheckedList = [];

				var vendorMap = holidayListData.vendor;
				var userMap = holidayListData.user;

				for ( var i in vendorMap) {
					if (vendorMap[i].isChecked.toString() == "true")
						checkedList[checkedList.length] = i;
					else uncheckedList[uncheckedList.length] = i;
				}
				for ( var i in userMap) {
					if (userMap[i].isChecked.toString() == "true")
						checkedList[checkedList.length] = i;
					else uncheckedList[uncheckedList.length] = i;
				}

				var sortFunction = function(a, b) {
					
					a = (holidayListData.vendor[a] == null) ? holidayListData.user[a].centerName : holidayListData.vendor[a].centerName;
					b = (holidayListData.vendor[b] == null) ? holidayListData.user[b].centerName : holidayListData.vendor[b].centerName;
					
					if (a.toUpperCase() > b.toUpperCase())
						return 1;
					else if (a.toUpperCase() < b.toUpperCase())
						return -1;
					return 0;
				}
				
				checkedList.sort(sortFunction);
				uncheckedList.sort(sortFunction);
				return checkedList.concat(uncheckedList);
			}
			
			namespace.getVisibleList = function(centerList, holidayListData) {
				var visibleList = [];
				var vendorMap = holidayListData.vendor;
				var userMap = holidayListData.user;
				for ( var index in centerList) {
					var isUser = (vendorMap[centerList[index]] == null);
					var center = (isUser)? userMap[centerList[index]] : vendorMap[centerList[index]];
					if (center.isChecked.toString().toLowerCase() == "true") {
						visibleList[visibleList.length] = centerList[index]
					}
				}
				if (visibleList.length == 0 && centerList.length > 0){
					visibleList[0] == centerList[0];
				}
				return visibleList;
			}
			
			namespace.createGridData = function (app, holidayListData, centerList){
				var gridData = [];

				for ( var i = 0; i <= 1; i++) {
					gridData[i] = [];
					for ( var j = 0; j <= 1; j++) {
						gridData[i][j] = new dataObj();
						gridData[i][j].type = "none";
						gridData[i][j].isVisible = false;
					}
				}

				var vendorMap = holidayListData.vendor;
				var userMap = holidayListData.user;
				var i = 1;
				
				var rowCount = 1;
				var colCount = 1;
				
				for (var index in centerList) {
					var isUser = vendorMap[centerList[index]] == null;
					var centerName = (isUser) ? userMap[centerList[index]].centerName : vendorMap[centerList[index]].centerName;
					var dateList = (isUser) ? userMap[centerList[index]].eventDate :vendorMap[centerList[index]].eventDate;

					
					for ( var row = 0; row <= rowCount; row++) {
						gridData[row][i] = new dataObj();
						gridData[row][i].type = (isUser)? "date" : "none";
					}

					if (dateList.length >= rowCount){
						for (var row = rowCount + 1; row <= dateList.length+1; row++){
							gridData[row] = [];
							gridData[row][0] = new dataObj();
							for (var col = 1; col <= colCount; col++ ){
								gridData[row][col] = new dataObj();
								gridData[row][col].type = (vendorMap[centerList[col-1]] == null)? "date" : "none";
							}
						}
						rowCount = dateList.length+1;
					}
					
					gridData[1][i].type = (isUser) ? "input" : "none";
					gridData[1][i].value = centerName;
					gridData[1][i].name = centerList[index];
					gridData[1][i].cssClass = "gridCellBorderHeader headerMedium nonEditable "; 

					for ( var j in dateList) {
						var k = (j - 0) + 2;
						var value;
						if (isUser){
							value = date_str_to_time(dateList[j]);
						}
						else {
							var dateArray = dateList[j].toString().split("/");
							value = dateArray[1] + " " + getNameOfMonth(dateArray[0]) + " "
							+ dateArray[2];
						}
						gridData[k][i].value = value;
						gridData[k][i].options = {
							value : value
						};
					}
					
					i++;
					colCount++;
				}
				return gridData;
			}
			
			namespace.updateDataFromGrid = function(app, holidayListData){
				var sortFunction = function(a, b) {
					if (a > b)
						return 1;
					else if (a < b)
						return -1;
					return 0;
				}
				
				var grid = app.holidaylist;
				var userMap = holidayListData.user;
				for (var j = 1; j <= grid.XLSColCount; j++){
					var centerId = grid.getName(1,j);
					if (userMap[centerId]){
						var dateList = [];
						var dateMap = {};
						for (var i = 2; i <= grid.XLSRowCount; i++){
							var value = grid.getData(i,j);
							if (value && !grid.hasError(i,j)){
								dateMap[value] = value;
							}
						}
						for (var i in dateMap){
							dateList[dateList.length] = parseInt(i);
						}
						dateList.sort(sortFunction);
						var eventDate = [];
						for (var i in dateList){
							var text = date_to_str(dateList[i]);
							eventDate[eventDate.length] =  text;
						}
						userMap[centerId].eventDate = eventDate;
					}
				}
			}

			namespace.initHolidayListGrid = function(app, holidayListData,
					centerList) {
				
				var gridData = namespace.createGridData(app, holidayListData, centerList);
				var holidayListGrid = app.holidaylist = new clsDionGrid();
				holidayListGrid.setParentDivElement($(".holigrid").get(0));
				holidayListGrid
						.initialize(
								"myholigrid",
								{
									rows : 20,
									cols : 6,
									data : gridData,
									showContextMenu : true,
									isCustomContextMenu : true,
									defaultCellHeight : 22,
									defaultCellWidth : 95,
									height : 396,
									width : 504,
									defaultEditableCellStyle : "gridCellBorder focus",
									defaultOddEditableCellStyle : "oddGridCellBorder centerText focus",
									defaultEvenEditableCellStyle : "evenGridCellBorder centerText focus",
									defaultNonEditableCellStyle : "gridCellBorder centerText nonEditable",
									defaultOddNonEditableCellStyle : "nonEditOddGridCellBorder centerText nonEditable",
									defaultEvenNonEditableCellStyle : "nonEditEvenGridCellBorder centerText nonEditable",
									defaultRowGap : 2,
									defaultColGap : 2,
									defaultTextAlign : "center",
									defaultGridDivStyle : "gridDiv "
								});

				holidayListGrid.goToCell(2, 1);
				holidayListGrid.onCellChanged.subscribe(function(e, cell, grid){
					if (cell.row == 1){
						var name = holidayListGrid.getName(1, cell.cell);
						if (name != null){
							var value = holidayListGrid.getData(1, cell.cell);
							var userMap = holidayListData.user;
							var vendorMap = holidayListData.vendor;
							var exists = false;
							for (var i in userMap){
								if (userMap[i].centerName == value) exists = true;
							}
							for (var i in vendorMap){
								if (vendorMap[i].centerName == value) exists = true;
							}
							if (!exists){
								$("#" + name).val(value);
								holidayListData.user[name].centerName = value;
							}
							else holidayListGrid.setError(cell.row, cell.cell, "Duplicate Value");
						}
					}
				});
				
				var contextMenuFn = function(GRID, row, col, contextMenuDiv){
			    	var APP = app;
			    	if (row == 1) row = 2;
			    	addInsertMultipleRows(contextMenuDiv, GRID, row, "Insert Date(s)");
			    	addCopyRange(contextMenuDiv, GRID, "Copy");
			    	if (workbook.copiedCellArray.length != 0) addPasteRange(contextMenuDiv, GRID, row, col, "Paste");
				}
				
				holidayListGrid.setContextMenuFn(contextMenuFn);
			}
			namespace.resetHolidayListGrid = function (app, holidayListData, visibleCenterList){
				var gridData = namespace.createGridData(app, holidayListData, visibleCenterList);
				var holidayListGrid = app.holidaylist;
				holidayListGrid.resetData(gridData);
			}

			namespace.initSideBar = function(app, centerList, visibleList, holidayListData) {
				$('#createnewlist').click(function() { // button for createnew list
					app.holidaylist.insertCol(1);
					app.holidaylist.setData(1,1,"Untitled",{value : "Untitled"},"input");
					for(var i=2;i<=app.holidaylist.XLSRowCount;i++)
					{
						app.holidaylist.setData(i,1,"",{value:""},"date");
					}
					var newCenterId = "" + window.uitoken + new Date().getTime();
					visibleList[visibleList.length] = newCenterId;
					centerList[centerList.length] = newCenterId;
					var $countryDiv = createCenterDiv("Untitled", newCenterId, true, visibleList);
					$(".hd_list").prepend($countryDiv);
					app.holidaylist.nameCell(1,1,newCenterId);
					holidayListData.user[newCenterId] = {
							"centerName" : "Untitled",
							"isChecked" : "true",
							"weekends" : [ "false", "true", "true", "true",
									"true", "true", "false" ],
							"eventDate" : [],
							"id" : newCenterId,
							"slaName" : newCenterId,
							"self" : "edit",
							"child" : "hide",
							
					}
				});
				
				$('.buttonholiday').click(function(){
					var vendorMap = holidayListData.vendor;
					var userMap = holidayListData.user;
					
					var newVisibleList = [];
					$('input[name^=_check_]').each(function(){

						var center = $(this).attr("center");
						var centerId = $(this).val();
						var isUser = vendorMap[centerId] == null;
						var centerObj = isUser ? userMap[centerId] : vendorMap[centerId];
						
						if($(this).is(':checked')){ 
							centerObj.isChecked = "true";
							newVisibleList[newVisibleList.length] = centerId;
						} 
						else centerObj.isChecked = "false";
						
					});
					app.data.visibleList = newVisibleList;
					namespace.updateDataFromGrid(app, holidayListData);
					namespace.resetHolidayListGrid(app, holidayListData, newVisibleList);
					
					
				});
				
				var nonEditableWeekList = function(centerId) {
					var html ='<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_sun" type="checkbox" name="option1" value="0" checked="checked" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick ">Sun</span><span id= "sun" ></span></li>'; 
					html +=	'<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_mon" type="checkbox" name="option1" value="1" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick ">Mon</span><span id ="mon" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_tue" type="checkbox" name="option1" value="2" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Tue</span><span id = "tue" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_wed" type="checkbox" name="option1" value="3" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick ">Wed</span><span id = "wed" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_thu" type="checkbox" name="option1" value="4" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Thu</span><span id ="thu" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_fri" type="checkbox" name="option1" value="5" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Fri</span><span id="fri"></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_sat" type="checkbox" name="option1" value="6" checked="checked" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Sat</span><span id="sat"></span></li>';
					return html;
				};
				
				
				var weekList = function(centerId) {
					var html ='<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_sun" type="checkbox" name="option1" value="0" checked="checked" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick ">Sun</span><span id= "sun" ></span></li>'; 
					html +=	'<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_mon" type="checkbox" name="option1" value="1" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick ">Mon</span><span id ="mon" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_tue" type="checkbox" name="option1" value="2" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Tue</span><span id = "tue" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_wed" type="checkbox" name="option1" value="3" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick ">Wed</span><span id = "wed" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_thu" type="checkbox" name="option1" value="4" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Thu</span><span id ="thu" ></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_fri" type="checkbox" name="option1" value="5" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Fri</span><span id="fri"></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input id = "_s_sat" type="checkbox" name="option1" value="6" checked="checked" class="doNotHideOnClick" centerId="'+centerId+'"/></span><span class="fl text doNotHideOnClick">Sat</span><span id="sat"></span></li>';
					html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick applyButtonDiv"><input id = "applybutton" name="input4" type="button" class="buttonholiday applyHoliday" value="Apply" /></li>';
					return html;
				};
				
				var createWeekList = function(center, centerId){
					var $week_list = $('<span class="open_list" centerId="'+ centerId +'" center="'+ center +'"></span>');
					$('.weekendclose').click(function(event) {
						$(".week_list_select").hide();
					});
					$week_list.click(function(event) {
						$(".week_list_select").hide();
						var centerId = $(this).attr('centerId');
						var center = $(this).attr('center');
						var $weekListPopup = $("#ul" + centerId + "weekList");
						$weekListPopup.toggle();
						$('.slimScrollDiv').css({width: '260px'});
						
						$("input[id^='_s_']", $weekListPopup).each(function(){
							var index = this.value;
							if (holidayListData.user[centerId].weekends[index].toString() == "true") $(this).attr('checked',false);
							else $(this).attr('checked',true);
						});
						
						var $applyButton = $(".applyButtonDiv", $weekListPopup);
					
						$applyButton.click(function(event){
							$(".week_list_select").hide();
							$('.slimScrollDiv').css({width: '127px'});
							$("input[id^='_s_']", $weekListPopup).each(function(){
								  if($(this).is(':checked')){ 
									  var ctr = $(this).attr('centerId');
									  var index = this.value;
									  holidayListData.user[ctr].weekends[index] = "false";
								  }
								  else{ 
									  var ctr = $(this).attr('centerId');
									  var index = this.value;
									  holidayListData.user[ctr].weekends[index] = "true";
								  }
								  $(".week_list_select").hide();
								  $('.slimScrollDiv').css({width: '127px'});
							});
							preventPropagation(event);
						})
						preventPropagation(event);
						document.body.onmousedown = function(){
							$(".week_list_select").hide();
							$('.slimScrollDiv').css({width: '127px'});
						}
						document.onmousedown = function(){
							$(".week_list_select").hide();
							$('.slimScrollDiv').css({width: '127px'});
						}
					});
					return $week_list;
				}
				
				var createNonEditableWeekList = function(center, centerId){
					var $week_list = $('<span class="open_list" centerId="'+ centerId +'" center="'+ center +'"></span>');
					$('.weekendclose').click(function(event) {
						$(".week_list_select").hide();
					});
					$week_list.click(function(event) {
						$(".week_list_select").hide();
						var centerId = $(this).attr('centerId');
						var center = $(this).attr('center');
						var $weekListPopup = $("#ul" + centerId + "weekList");
						$weekListPopup.toggle();
						$('.slimScrollDiv').css({width: '260px'});
						
						$("input[id^='_s_']", $weekListPopup).each(function(){
							var index = this.value;
							if (holidayListData.vendor[centerId].weekends[index].toString() == "true") $(this).attr('checked',false);
							else $(this).attr('checked',true);
						});
						
						preventPropagation(event);
						document.body.onmousedown = function(){
							$(".week_list_select").hide();
							$('.slimScrollDiv').css({width: '127px'});
						}
						document.onmousedown = function(){
							$(".week_list_select").hide();
							$('.slimScrollDiv').css({width: '127px'});
						}
					});
					return $week_list;
				}

				var createCenterDiv = function(center, centerId, isUser, visibleList){
					var $countryDiv = $('<div class="country first_li" centerId="' + centerId + '" center="' + center + '" id="' + centerId + 'countryDiv"></div>');
					
					
					var $checkbox = $('<input type="checkbox" name ="_check_" value="'+ centerId +'" center="' + center + '"/>');
					var $title = $('<div class="weekendboxtitle"><div class="titlefont">Weekend</div><div class="weekendclose"></div></div>');
					var $fl = $('<span class="fl"  ></span>');
					$fl.append($checkbox);

					var $flText 
					if (isUser){
						$flText = $flText = $('<span class="fl text"></span>');
						$flInput = $('<input class="fl userHolidayList" id="'+centerId+'"></input>');
						$flText.append($flInput);
						$flText.append($('<span class="cb"></span>'));
						$flInput.val(center);
					}
					else {
						$flText = $('<span class="fl text"></span>');
						$flText.html(center + '<span class="cb"></span>');
					}

					var $hoverEvent = $('<span class="hover_event"></span>');
					$countryDiv[0].hoverEvent = $hoverEvent;
					$flText.append($hoverEvent);
					
					if (indexOfElement(visibleList, centerId) != -1){
						 $checkbox.attr('checked',true);
					}

					var $ul = $('<ul id ="ul' + centerId + 'weekList' + '" class="week_list_select hd_shadow doNotHideOnClick"></ul>');
					$countryDiv.append($fl, $flText, $ul);
					$countryDiv[0].weeklyList = $ul;
					
					
					$ul.mousedown(function (event){
						preventPropagation(event);
					});

					$countryDiv.mouseleave(function() {
						this.hoverEvent.empty();
					});
					
					if (isUser){
						var weeksList = weekList(centerId);
						$ul.append($title, weeksList);
						
						$countryDiv.mouseenter(function(event) {
							var centerId = $(this).attr('centerId');
							var center = $(this).attr('center');
							var $week_list = createWeekList(center, centerId);
							var $cross = $('<span class="cross" centerId="'+ centerId +'" style="top:8px;"></span>');
							this.hoverEvent.append($week_list);
							if(indexOfElement(visibleList, centerId) != -1){
								this.hoverEvent.append( $cross);
							}
	
							$cross.click(function(event){
								$(".week_list_select").hide();
								var centerId = $(this).attr('centerId');
								var result = confirm("Are you sure you want to delete?");
								var centerName = ""; 
								if (result){
									app.holidaylist.deleteCol(workbook.getCellRowColByName(centerId).col);
									delete holidayListData.vendor[centerId];
									var centerIndex = indexOfElement(centerList, centerId);
									var visibleIndex = indexOfElement(visibleList, centerId);
									centerList.splice(centerIndex,1);
									visibleList.splice(visibleIndex,1);
									$("#" + centerId + "countryDiv").remove();
								}
							});
						});
					}
					else {
						var weeksList = nonEditableWeekList(centerId);
						$ul.append($title, weeksList);
						$countryDiv.mouseenter(function(event) {
							var centerId = $(this).attr('centerId');
							var center = $(this).attr('center');
							var $week_list = createNonEditableWeekList(center, centerId);
							this.hoverEvent.append($week_list);
						});
					}
					return $countryDiv;
				}
			

/*
 * var visibleList = userDefinedList['visibleCountries']; userSortedList =
 * visibleList.split(","); var sortedWeekends =
 * userDefinedList['sortedWeekends']; var sortedWeekList =
 * sortedWeekends.split(":"); } else{// if the user list is empty then display
 * default countries. displayList = defaultDisplayCountries;//
 * defaultDisplayCountries // array is defined at // the bottom. } // NO OF
 * COLUMNS FOR GRID HAS NOTHING TO DO WITH SORTEDLIST BUT ONLY // WITH
 * USERSORTEDLIST // DATA5 OBJECT IS RELATED WITH DISPLAY LIST ONLY. DISPLAY
 * LIST IS // INTIALIZED BEFORE. var map = {}; for(var j=0;j<userSortedList.length;j++){
 * 
 * map[userSortedList[j]] = sortedWeekList[j]; } displayList = ["Abu
 * Dhabi","Adelaide","London","Pago Pago","Vienna"]; for(var j=1;j <=
 * maxRowCount + 1;j++){ data5[j] = []; for(var i=1;i <=
 * displayList.length;i++){
 * 
 * data5[j][i] = new dataObj(); } } // dump data into data5 for grid // THE
 * FOLLOWING CODE DUMPS DATA INTO DATA5 FOR // DISPLAYING THE GRID. var
 * monthArray = ["
 * ","Jan","Feb","Mar","Apr","May","Jun","Jul",'Aug',"Sep","Oct","Nov","Dec"];
 * for(var i=1;i < displayList.length + 1;i++){ var currList;
 * if(window.resp['user'].hasOwnProperty(displayList[i])) currList
 * =window.resp['user'][displayList[i-1]]['EventDate']; else currList =
 * window.resp['vendor'][displayList[i-1]]['EventDate']; for(var j=1; j <
 * currList.length + 1;j++) { if (j == 1){
 * 
 * data5[j][i].type = "none"; data5[j][i].value = displayList[i-1];
 * data5[j][i].name = displayList[i-1]; data5[j][i].options = {value :
 * displayList[i-1]}; } else { data5[j][i].type = "none";
 * 
 * givenDate = currList[j-1]; data5[j][i].value = givenDate; data5[j][i].options =
 * {value : givenDate};
 * window.resp['vendor'][displayList[i-1]]['EventDate'][j-1] = givenDate; //
 * formatted // date // is // stored // back // in // the // window.resp } } } //
 * NOW DATA5 IS INTIALIZED AND IT WILL DISPLAY THE COUNTRIES // ACCORDINGLY.
 * 
 * var holidaylist = app.holidaylist = new clsDionGrid();
 * holidaylist.setParentDivElement($(".holigrid").get(0));
 * holidaylist.initialize( "myholigrid", { rows : 20, cols : 6, data : data4,
 * showContextMenu : true, showScrollBar : true, isCustomContextMenu : true,
 * defaultCellHeight : 22, defaultCellWidth : 90, height : 396, width : 504,
 * hasAutoWidth : true, hasAutoHeight : true, defaultEditableCellStyle :
 * "gridCellBorder focus", defaultOddEditableCellStyle : "oddGridCellBorder
 * focus", defaultEvenEditableCellStyle : "evenGridCellBorder focus",
 * defaultNonEditableCellStyle : "gridCellBorder centerText nonEditable",
 * defaultRowGap : 2, defaultColGap : 2, isMouseWheel : true, defaultTextAlign :
 * "center", defaultGridDivStyle : "gridDiv " }); app.set_title("HOLIDAY LIST"); //
 * GENERATE LEFT SIDE MENU BAR OF COUNTRIES. function generateList(sortedList) {
 * for ( var i=0;i < sortedList.length ; i++) { var $countryDiv = $('<div
 * class="country first_li"></div>'); var $fl = $('<span class="fl" ></span>');
 * var $checkbox = $('<input type="checkbox" id="'+sortedList[i]+'" name
 * ="_check_'+i+'" value="" />'); for(var j=0;j<displayList.length;j++){
 * 
 * if(sortedList[i] == displayList[j]){
 * 
 * $checkbox.attr('checked',true); } }
 * 
 * $fl.append($checkbox); var $flText = $('<span class="fl text" id
 * ="'+sortedList[i]+'" name = "_span_'+i+'"></span>'); $flText.html(
 * sortedList[i]+ '<span class="cb"></span>'); var $hoverEvent = $('<span id
 * ="'+sortedList[i]+'" name ="_hover_'+i+'" class="hover_event"></span>');
 * $countryDiv[0].hoverEvent = $hoverEvent; $flText.append($hoverEvent); var $ul =
 * $('<ul id ="'+sortedList[i]+'" name = "_ul_'+i+' "class="week_list_select hd_shadow doNotHideOnClick"></ul>');
 * $countryDiv.append($fl, $flText, $ul); $countryDiv[0].weeklyList = $ul;
 * $ul.append(weekList());
 * 
 * $countryDiv.mouseenter(function(event) { var $week_list = $('<span
 * class="open_list"></span>'); var $cross = $('<span class="cross" id="cross_ "
 * style="top:8px;"></span>');
 * 
 * $cross.click(function(){ // alert("Are you sure you want to delete the //
 * calendar?"); var parseName = $cross.parent().parent().html(); var name =
 * parseName.split('<span'); var present = false; for(var j=0;j<displayList.length;j++){
 * 
 * if(displayList[j] == name[0]){
 * 
 * present = true; break; } } if(present == true){
 * app.holidaylist.deleteCol(workbook.getCellRowColByName(name[0]).col);
 * displayList.splice(j,1); } $(this).parent().parent().parent().remove(); //
 * ADDING TO THE DELETED LIST SO THAT IT CAN BE // DELETED ON THE DATABASE AND
 * IN THE JSON ON THE // SERVER SIDE var deleteList =
 * window.resp['user']['toBeDeleted']; deleteList = "" + deleteList + ',' +
 * name[0]; window.resp["user"]["toBeDeleted"] = deleteList;
 * 
 * 
 * });
 * 
 * this.hoverEvent.append($week_list);
 * if(window.resp['user'].hasOwnProperty(sortedList[i])) this.hoverEvent.append(
 * $cross); $week_list[0].weeklyList = this.weeklyList; // WEEK LIST WILL BE
 * HANDLED LATER
 * 
 * $week_list.click(function(event) { // var name =
 * $($(this).parent()).attr('id'); // var parseName = //
 * $week_list.parent().parent().html(); // var name = parseName.split('<span');
 * var name = $(this).parent().attr('id'); var status = 0;
 * if($('ul[id="'+name+'"]').is(':visible')){ status = 0; } else{ status = 1; }
 * 
 * $('ul[name^="_ul_"]').each(function(){ if($(this).is(':visible'))
 * $(this).hide();
 * 
 * }); if(status == 1) $('ul[id="'+name+'"]').show(); var weekDays = map[name];
 * var weekList2 = weekDays.split(","); var count = 0;
 * $('ul[id="'+name+'"]').children().each(function(){ if(weekList2[count] ==
 * false) $(this).addClass('tick'); count++; }); // $('ul[id^="''"]')
 * $('.hd_shadow .slimScrollDiv').css({ width : '260px' });
 * preventPropagation(event); }); }); $countryDiv.mouseleave(function() {
 * this.hoverEvent.empty(); });
 * 
 * $(".hd_list").append($countryDiv); }// end of for loop generate list }
 * generateList(userSortedList); app.holidaylist.resetData(data5);
 * $('#createnewlist').click(function() { // button for createnew list
 * app.holidaylist.insertCol(1); app.holidaylist.setData(1,1,"Untitled",{value :
 * "Untitled"},"input"); for(var i=2;i<=app.holidaylist.XLSRowCount;i++) {
 * app.holidaylist.setData(i,1,"",{value:""},"date"); } });
 * 
 * $('#savebutton').click(function(){
 * 
 * var value,index ; var k=0; var flag = 0; var prevColsCount =
 * displayList.length; while( k < prevColsCount){
 * app.holidaylist.refreshCell(1,k+1); value = app.holidaylist.getData(1,k+1);
 * index = workbook.nameMap.findIt(value); if(index !== -1) break; else
 * if(value.toUpperCase() === "UNTITLED"){ alert("please provide a name to " +
 * k+1 + "th Column"); flag = 1; break; } k++; } if(!flag && k >0 ){
 * 
 * for(;k>0;k--){ value = app.holidaylist.getData(1,k);
 * userSortedList.push(value); displayList.push(value); var $countryDiv = $('<div
 * class="country first_li"></div>'); var $fl = $('<span class="fl" ></span>');
 * var $checkbox = $('<input type="checkbox" id="'+value+'" name ="_check_I"
 * value=""checked="checked" />'); $fl.append($checkbox); var $flText = $('<span
 * class="fl text" id="'+value+'" name = "_span_I"></span>'); $flText.html(
 * value + '<span class="cb"></span>'); var $hoverEvent = $('<span id
 * ="'+value+'" class="hover_event"></span>'); $countryDiv[0].hoverEvent =
 * $hoverEvent; $flText.append($hoverEvent); var $ul = $('<ul class="week_list_select hd_shadow doNotHideOnClick"></ul>');
 * $countryDiv.append($fl, $flText, $ul); $countryDiv[0].weeklyList = $ul;
 * $ul.append(weekList()); var $obj,pos=0;
 * $('span[name^=_span_]').each(function(){ if($(this).attr('id').toLowerCase() >
 * value.toLowerCase()) return (false); pos = 1; $obj = $(this).parent();
 * 
 * });
 * 
 * if(pos == 0) $countryDiv.insertAfter($('.holirow')); else
 * $countryDiv.insertAfter($obj);
 * 
 * $countryDiv.mouseenter(function(event) { var $week_list = $('<span
 * class="open_list"></span>'); var $cross = $('<span class="cross" id="cross_ "
 * style="top:8px;"></span>');
 * 
 * $cross.click(function(){ // alert("Are you sure you want to delete the //
 * calendar?"); var parseName = $cross.parent().parent().html(); var name =
 * parseName.split('<span'); var present = false;
 * 
 * for(var h=0;h<displayList.length;h++){ if(displayList[h] == name[0]){
 * present = true; break; } }
 * 
 * if(present == true){
 * app.holidaylist.deleteCol(workbook.getCellRowColByName(name[0]).col);
 * displayList.splice(h,1); } $(this).parent().parent().parent().remove();
 * userSortedList.splice(n-1,1); var deleteList =
 * window.resp['user']['toBeDeleted']; deleteList = deleteList + "," + name[0];
 * });
 * 
 * this.hoverEvent.append($week_list, $cross); $week_list[0].weeklyList =
 * this.weeklyList;
 * 
 * $week_list.click(function(event) { var name = $($(this).parent()).attr('id');
 * var status = 0; if($('ul[id="'+name+'"]').is(':visible')){ status = 0; }
 * else{ status = 1; }
 * 
 * $('ul[name^="_ul_"]').each(function(){ if($(this).is(':visible'))
 * $(this).hide();
 * 
 * }); if(status == 1) $('ul[id="'+name+'"]').show(); var country =
 * $(this).parent().attr('id'); var weekList2 =
 * window.resp['vendor'][country]['weekends']; var count = 0;
 * $('ul[id="'+name+'"]').children().each(function(){ if(weekList2[count] ==
 * false) $(this).addClass('tick'); count++;
 * 
 * });
 * 
 * $('.hd_shadow .slimScrollDiv').css({ width : '260px' });
 * preventPropagation(event); }); }); $countryDiv.mouseleave(function() {
 * this.hoverEvent.empty(); });
 * 
 * 
 * $('#applybutton').click(function(){ $("input[id^='_s_']").each(function(){
 * 
 * if($(this).is(':checked')){ userDefinedList[value]['weekends'].push(false); }
 * else{ userDefinedList[value]['weekends'].push(true); }
 * 
 * }); }); // Object for sending the data through ajax calls
 * window.resp['user'][value] = {};
 * window.resp['user'][value]["FinancialCentre"] = value;
 * window.resp['user'][value]["CenterID"] = "U" + userListCount;
 * window.resp['user'][value]["UserID"] = "user@dion" + userListCount;
 * window.resp['user'][value]["EventDate"] = [];
 * window.resp['user'][value]["weekends"] = [];
 * window.resp['user'][value]['isUserDef'] = 1; userListCount++;
 * 
 * for(var j = 2;j <= maxRowCount + 1;j++){ app.holidaylist.refreshCell(j,k);
 * var cellData = app.holidaylist.getData(j,k); if(parseInt(cellData) != 0 &&
 * cellData !="" &&cellData != undefined){ var fmtData = new Date(cellData); var
 * day = fmtData.getDate(); var month = fmtData.getMonth(); month =
 * parseInt(month); month += 1; var year = fmtData.getFullYear(); cellData = day +
 * "/" + month + "/" + year ;
 * window.resp['user'][value]['EventDate'].push(cellData); } else
 * window.resp["user"][value]['EventDate'].push(-1); } //
 * window.resp[value]['EvenDate'].sort(); } // end of starting for loop of save
 * button
 * 
 * displayList.sort(function(a,b){ if(a.toUpperCase > b.toUpperCase) return 1;
 * else if(a.toUpperCase < b.toUpperCase) return -1; return 0; });
 * 
 * 
 * var sendObject = {}; var toBeUpdated = {}; var name; for(var k=1;k <=
 * displayList.length ;k++){ var sortIt = true; var toBeSortedData = []; name =
 * app.holidaylist.getData(1,k);// change later name = displayList[k];
 * if(window.resp['user'].hasOwnProperty(name)){ for(var j = 2;j <= maxRowCount +
 * 1;j++){ app.holidaylist.refreshCell(j,k); var cellData =
 * app.holidaylist.getData(j,k); if(cellData !="" && cellData != undefined &&
 * cellData !=0){ if(window.resp['user'][name]['EventDate'][j-2] != cellData){
 * sortIt = true; }
 * toBeSortedData.push(window.resp['user'][name]['EventDate'][j-2]); } }
 * if(sortIt == true){ // It goes in only for user defined // object
 * sendObject[name] = {}; sendObject[name]['UserID'] =
 * window.resp['user'][name]['UserID']; sendObject[name]['CenterID'] =
 * window.resp['user'][name]['CenterID']; sendObject[name]['FinancialCentre'] =
 * window.resp['user'][name]['FinancialCentre']; sendObject[name]['CenterID'] =
 * window.resp['user'][name]['CenterID']; var string = ""; for(var h=0;h<toBeSortedData.length;h++){
 * 
 * string.concat(toBeSortedData[h] + ","); } string =
 * string.substr(1,string.length-1); sendObject[name]['EventDate'] = string;
 * toBeUpdated[name] = {}; sendObject[name]['weekends'] =
 * window.resp['user'][name]['weekends']; sendObject[name]['isUserDef'] =
 * window.resp['user'][name]['isUserDef']; } } }
 * 
 * callingSavefunction = function(resp){
 * 
 * var tempData = []; for(var j=1;j <= maxRowCount + 1;j++){ tempData[j] = [];
 * for(var i=1;i <= displayList.length;i++){ tempData[j][i] = new dataObj(); } }
 * var inc =0; for(var k=0;k<displayList.length;k++){
 * 
 * for(var j = 1;j <= maxRowCount + 1;j++){ if(j == 1){ var noOfRows ;
 * tempData[j][k+1].type = "none"; tempData[j][k+1].value = displayList[k];
 * tempData[j][k+1].valueOptions = {value : displayList[k]};
 * workbook.nameMap.put(displayList[k],app.holidaylist.gridName + "."+
 * (String.fromCharCode(65+inc)) + "1");inc++;
 * if(window.resp.hasOwnProperty(displayList[k])) noOfRows =
 * window.resp['vendor']['EventDate'].length; else noOfRows
 * =window.resp['user'][displayList[k]]['EventDate'].split(',').length + 1; var
 * currList; if(window.resp['vendor'].hasOwnProperty(displayList[k])) currList =
 * window.resp['vendor']['EvenDate']; else{ currList =
 * window.resp['user'][displayList[k]]['EventDate'];// resp // parameter // is //
 * used // here. currList = currList.split(','); } } else{
 * 
 * app.holidaylist.refreshCell(j,k);
 * if(window.resp['vendor'].hasOwnProperty(displayList[k])){ var cellData = "";
 * if(j <= noOfRows + 1){ cellData = currList[j-2]; tempData[j][k+1].type =
 * "none"; var givenDate = cellData; tempData[j][k+1].value = givenDate;
 * tempData[j][k+1].valueOptions = {value : givenDate }; } else{
 * tempData[j][k+1].type = "none"; tempData[j][k+1].value = "";
 * tempData[j][k+1].valueOptions = {value : ""}; } } else{
 * 
 * var cellData = ""; if(j <= noOfRows + 1){ cellData = currList[j-2];
 * tempData[j][k+1].type = "date"; var givenDate = cellData;
 * tempData[j][k+1].value = givenDate; tempData[j][k+1].valueOptions = {value :
 * givenDate }; } else{ tempData[j][k+1].type = "date"; tempData[j][k+1].value =
 * ""; tempData[j][k+1].valueOptions = {value : ""}; } } } } }
 * app.holidaylist.resetData(tempData); } // sendObject['displayList'] =
 * displayList; $.ajax({ url : "save_holidaylist", type : "POST", dataType :
 * "html", // global: false, data :{ updateObject : JSON.stringify(sendObject)} , //
 * data :( {"displayCountries" : "ooo"} ), // payload : JSON.stringify(data), //
 * context: document.body, // contentType: 'application/json', // cache: true, //
 * async : true, success: function(msg){ var save_resp = jQuery.parseJSON(msg); //
 * window.resp // contains // two // fields // vendor // and user // .
 * 
 * callingSavefunction(save_resp); }
 * 
 * 
 * }); } }); // end of save button.
 * 
 * $('.buttonholiday').click(function(){ // when we click the ok // button . var
 * count = displayList.length; displayList.splice(0,displayList.length); var
 * alreadyPresent = {}; for(var i=0;i<displayList.length;i++){
 * alreadyPresent[displayList[i]] = " "; } displayList.splice(0,count); var
 * displayString = ""; $('input[name^=_check_]').each(function(){
 * 
 * 
 * if($(this).is(':checked')){ var name = $(this).attr('id');
 * displayList.push(name); if(!alreadyPresent.hasOwnProperty(name)){
 * displayString = displayString.concat(name + ",");} } // NO NEED TO SET THE
 * COLUMN WIDTH TO ZERO AS THE WHOLE LIST // HAS TO BE PRESENTED IN SORTED ORDER
 * BASED ON THE SELECTED // ORDER. });
 * 
 * displayList.sort(function(a,b){ if(a.toLowerCase > b.toLowerCase()) return 1;
 * else if (a.toLowerCase < b.toLowerCase) return -1; return 0;
 * 
 * });
 * 
 * displayString = displayString.substr(0,displayString.length - 1); var
 * tempData = []; for(var j=1;j <= maxRowCount + 1;j++){ tempData[j] = [];
 * for(var i=1;i <= displayList.length;i++){ tempData[j][i] = new dataObj(); } }
 * 
 * callingOkfunction = function(resp){
 * 
 * var inc =0; var cellData =""; for(var k=0;k<displayList.length;k++){
 * 
 * for(var j = 1;j <= maxRowCount + 1;j++){ if(j == 1){ tempData[j][k+1].type =
 * "none"; tempData[j][k+1].value = displayList[k];
 * tempData[j][k+1].valueOptions = {value : displayList[k]}; // CLEAR THE WHOLE
 * WORKBOOK HERE AND INCLUDE THE // CLEAR FUNCTION IN THE GRID MAP API
 * workbook.nameMap.put(displayList[k],app.holidaylist.gridName + "."+
 * (String.fromCharCode(65+inc)) + "1");inc++;
 * if(alreadyPresent.hasOwnProperty(displayList[k])){ currList =
 * window.resp['vendor'][displayList[k]]['EventDate']; len =
 * window.resp['vendor'][displayList[k]]['EventDate'].length; } else{ currList =
 * resp[displayList[k]]['EventDate']; len =
 * resp[displayList[k]]['EventDate'].length; } } else{ if(j-2 < len){ cellData =
 * currList[j-2]; if(resp['isuserdef']) tempData[j][k+1].type = "date"; else
 * tempData[j][k+1].type = "none";
 * 
 * var givenDate = cellData; tempData[j][k+1].value = givenDate;
 * tempData[j][k+1].valueOptions = {value : givenDate }; } else{
 * tempData[j][k+1].type = "none" tempData[j][k+1].value = "";
 * tempData[j][k+1].valueOptions = {value : "" }; } } } }
 * 
 * for(var j in resp){ if(resp[j]['isUserDef']){ window.resp['user'][j] = {};
 * window.resp['user'][j]['EventDate'] = resp[j]['EventDate']; } else{
 * window.resp['vendor'][j] = {}; window.resp['vendor']['EventDate'] =
 * resp[j]['EventDate']; } }
 * 
 * app.holidaylist.resetData(tempData); }
 * 
 * $.ajax({ url : "ok_holidaylist", type : "POST", dataType : "html", // global:
 * false, data :{d : displayString, oc : "something"}, // data :(
 * {"displayCountries" : "ooo"} ), // payload : JSON.stringify(data), //
 * context: document.body, // contentType: 'application/json', cache: true,
 * async : true, success: function(msg){ var resp = jQuery.parseJSON(msg); //
 * window.resp // contains // two // fields // vendor // and user // .
 * callingOkfunction(resp); } }); }); }; }
 * 
 * var weekList = function() { var html ='<li class="doNotHideOnClick"><span
 * class="fl doNotHideOnClick"><input id = "_s_sun" type="checkbox"
 * name="option1" checked="checked" class="doNotHideOnClick"/></span><span
 * class="fl text doNotHideOnClick ">Sun</span><span id= "sun" ></span></li>';
 * html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input
 * id = "_s_mon" type="checkbox" name="option1" value=""
 * class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick
 * ">Mon</span><span id ="mon" ></span></li>'; html += '<li class="doNotHideOnClick"><span
 * class="fl doNotHideOnClick"><input id = "_s_tue" type="checkbox"
 * name="option1" value="" class="doNotHideOnClick"/></span><span class="fl
 * text doNotHideOnClick">Tue</span><span id = "tue" ></span></li>'; html += '<li class="doNotHideOnClick"><span
 * class="fl doNotHideOnClick"><input id = "_s_wed" type="checkbox"
 * name="option1" value="" class="doNotHideOnClick"/></span><span class="fl
 * text doNotHideOnClick ">Wed</span><span id = "wed" ></span></li>'; html += '<li class="doNotHideOnClick"><span
 * class="fl doNotHideOnClick"><input id = "_s_thu" type="checkbox"
 * name="option1" value="" class="doNotHideOnClick"/></span><span class="fl
 * text doNotHideOnClick">Thu</span><span id ="thu" ></span></li>'; html += '<li class="doNotHideOnClick"><span
 * class="fl doNotHideOnClick"><input id = "_s_fri" type="checkbox"
 * name="option1" value="" class="doNotHideOnClick"/></span><span class="fl
 * text doNotHideOnClick">Fri</span><span id="fri"></span></li>'; html += '<li class="doNotHideOnClick"><span
 * class="fl doNotHideOnClick"><input id = "_s_sat" type="checkbox"
 * name="option1" checked="checked" class="doNotHideOnClick"/></span><span
 * class="fl text doNotHideOnClick">Sat</span><span id="sat"></span></li>';
 * 
 * html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input
 * id = "applybutton" name="input4" type="button" class="buttonholiday"
 * value="Apply" /></li>'; return html; };
 * 
 * function preventPropagation(event) { if (event) { if (event.preventDefault) {
 * event.preventDefault(); event.cancelBubble = true; event.returnValue = false;
 * event.stopPropagation(); } else { event.cancelBubble = true;
 * event.returnValue = false; event.stopPropagation(); return false; } } } });
 * 
 * 
 */
