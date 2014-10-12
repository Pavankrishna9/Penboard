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
				/**
				var holidaylist = app.holidaylist = new clsDionGrid();
				holidaylist.setParentDivElement($(".holigrid").get(0));
				holidaylist.initialize(
								"myholigrid",
								{
									rows : 20,
									cols : 6,
									data : data4,
									showContextMenu : true,
									showScrollBar : true,
									isCustomContextMenu : true,
									defaultCellHeight : 22,
									defaultCellWidth : 90,
									height : 396,
									width : 504,
									hasAutoWidth : true,
									hasAutoHeight : true,
									defaultEditableCellStyle : "gridCellBorder focus",
									defaultOddEditableCellStyle : "oddGridCellBorder focus",
									defaultEvenEditableCellStyle : "evenGridCellBorder focus",
									defaultNonEditableCellStyle : "gridCellBorder centerText nonEditable",
									defaultRowGap : 2,
									defaultColGap : 2,
									isMouseWheel : true,
									defaultTextAlign : "center",
									defaultGridDivStyle : "gridDiv "
								});
				app.set_title("HOLIDAY LIST");
				
				function generateList(sortedList) {
			 for ( var i=0;i<sortedList.length; i++) {
						var $countryDiv = $('<div class="country first_li"></div>');
						var $fl = $('<span class="fl"  ></span>');
						var $checkbox = $('<input type="checkbox" id="'+sortedList[i]+'" name ="_check_'+i+'"  value="" checked="checked" />');
						$fl.append($checkbox);
						var $flText = $('<span class="fl text" id ="'+sortedList[i]+'" name = "_span_'+i+'"></span>');
						$flText.html( sortedList[i]+ '<span class="cb"></span>');
						var $hoverEvent = $('<span id ="'+sortedList[i]+'" name ="_hover_'+i+'" class="hover_event"></span>');
						$countryDiv[0].hoverEvent = $hoverEvent;
						$flText.append($hoverEvent);
						var $ul = $('<ul id ="'+sortedList[i]+'" name = "_ul_'+i+' "class="week_list_select hd_shadow doNotHideOnClick"></ul>');
						$countryDiv.append($fl, $flText, $ul);
						$countryDiv[0].weeklyList = $ul;
						$ul.append(weekList());
						
						$countryDiv.mouseenter(function(event) {
									var $week_list = $('<span class="open_list"></span>');
									var $cross = $('<span class="cross" id="cross_ "  style="top:8px;"></span>');
									
									$cross.click(function(){
										//alert("Are you sure you want to delete the calendar?");
										var parseName = $cross.parent().parent().html();
										var name = parseName.split('<span');
										app.holidaylist.deleteCol(workbook.getCellRowColByName(name[0]).col);
										$(this).parent().parent().parent().remove();
										
									});
									
									this.hoverEvent.append($week_list, $cross);
									$week_list[0].weeklyList = this.weeklyList;
									
									$week_list.click(function(event) {
										var name = $($(this).parent()).attr('id');
										$('ul[name^="_ul_"]').each(function(){
											if($(this).is(':visible'))
												$(this).hide();
											
										});
										$('ul[id^="'+name+'"]').toggle();
										$('.hd_shadow .slimScrollDiv').css({
											width : '260px'
										});
										preventPropagation(event);
									});
								});
						$countryDiv.mouseleave(function() {
							this.hoverEvent.empty();
						});
						
						$(".hd_list").append($countryDiv);
						}//end of for loop generate list
			        
				}
				
				$('#createnewlist').click(function() { // button for createnew list
					app.holidaylist.insertCol(1);
					app.holidaylist.setData(1,1,"Untitled",{value : "Untitled"},"input");
					var currDate = new Date();
					var date = currDate.getDate() + 1;
					var month = currDate.getMonth() + 1;
					var year = currDate.getFullYear();
					var today = date + ' ' + month + ' ' + year;
					for(var i=2;i<15;i++)
					{
						app.holidaylist.setData(i,1,today,{value:today},"date");
					}

				});
				
				$('#savebutton').click(function(){ 
					//get the column of index 0 and get its name store it in name variable  
					//var k =1;
							var value ;
							var k=0;
							while(true){
								app.holidaylist.refreshCell(1,k+1);
								value = app.holidaylist.getData(1,k+1);
								index = workbook.nameMap.findIt(value);
								if(index !== -1)
									break;
								else if(value.toUpperCase() === "UNTITLED"){
									alert("please provide a name to " + k+1 + "th Column");
									break;
									}
								k++;
							}	
							
							var prevRowsCount = sortedList.length();
							for(;k>0;k--){
								value = app.holidaylist.getData(1,k);
								sortedList.push(value);
								var $countryDiv = $('<div class="country first_li"></div>');
								var $fl = $('<span class="fl" ></span>');
								var $checkbox = $('<input type="checkbox" id="'+value+'" name ="_check_I"  value=""checked="checked" />');
								$fl.append($checkbox);
								var $flText = $('<span class="fl text" id="'+value+'" name = "_span_I"></span>');
								$flText.html( value + '<span class="cb"></span>');
								var $hoverEvent = $('<span id ="hover_event" class="hover_event"></span>');
								$countryDiv[0].hoverEvent = $hoverEvent;
								$flText.append($hoverEvent);
								var $ul = $('<ul class="week_list_select hd_shadow doNotHideOnClick"></ul>');
								$countryDiv.append($fl, $flText, $ul);
								$countryDiv[0].weeklyList = $ul;
								$ul.append(weekList());
								var $obj,pos;
								$('span[name^=_span_]').each(function(){
									if($(this).attr('id') > value)
										return (false);
									pos  =1;
									$obj = $(this).parent();
									
								});
								
								if(pos == 0)
									$countryDiv.insertAfter(jQuery('.holirow'));
								else
									$countryDiv.insertAfter($obj);
								
								$countryDiv.mouseenter(function(event) {
									var $week_list = $('<span class="open_list"></span>');
									var $cross = $('<span class="cross" id="cross_ "  style="top:8px;"></span>');
									
									$cross.click(function(){
										//alert("Are you sure you want to delete the calendar?");
										var parseName = $cross.parent().parent().html();
										var name = parseName.split('<span');
										app.holidaylist.deleteCol(workbook.getCellRowColByName(name[0]).col);
										$(this).parent().parent().parent().remove();
									});
									
									this.hoverEvent.append($week_list, $cross);
									$week_list[0].weeklyList = this.weeklyList;
									
									$week_list.click(function(event) {
										var name = $($(this).parent()).attr('id');
										$('ul[name^="_ul_"]').each(function(){
											if($(this).is(':visible'))
												$(this).hide();
											
										});
										$('ul[id^="'+name+'"]').toggle();
										$('.hd_shadow .slimScrollDiv').css({
											width : '260px'
										});
										preventPropagation(event);
									});
								});
						$countryDiv.mouseleave(function() {
							this.hoverEvent.empty();
						});
								
								dummyholidaylist[value] = {};
								dummyholidaylist[value]["countryid"] = value;
								dummyholidaylist[value]["holidays"] = [];
								dummyholidaylist[value]["weekends"] = [];
								for(var j = 2;j<app.holidaylist.XLSRowCount;j++){
									app.holidaylist.refreshCell(j,k);
									var cellData = app.holidaylist.getData(j,k);
									dummyholidaylist[value]["holidays"].push(cellData);
								}
								dummyholidaylist[value]['holidays'].sort();
							}//end of starting for loop of save button
							
							
							
							sortedList.sort();
							var addCols = sortedList.length - prevRowsCount; 
							for(var m = prevRowsCount;m < addCols;m++){
							tempData[m + 1] = [];
							}
							for(var k=0;k<sortedList.length;k++){
								
								if(originalData.hasOwnProperty(sortedList[k])){
									tempData[k + 1] = originalData[sortedList[k]];
								}
								
								else{
									for(var j = 1;j<=app.holidaylist.XLSRowCount;j++){
										tempData[j][k].type = "date";
										var data = app.holidaylist.getData(k+1,j);
										tempData[j][k].value = data;
										
									
									}
								}
							}
							
							app.holidaylist.resetData(tempData);
					});
					
				// end of save button.
				
				$('.buttonholiday').click(function(){   // when we click the ok button .
					
					$('input[name^=_check_]').each(function(){
						if(!$(this).is(':checked')){
								var name = $(this).attr('id');
								var col = workbook.getCellRowColByName(name).col;
								app.holidaylist.setColumnWidth(parseInt(col),0);
								app.holidaylist.setColGap(parseInt(col),0);
								;}
						else{
							var name = $(this).attr('id');
							var col = workbook.getCellRowColByName(name).col;
							col = parseInt(col);
							
							var width = app.holidaylist.XLSColArray[col].width;
							if( width === 0){
								app.holidaylist.XLSColArray[col].width = app.holidaylist.defaultCellWidth;
							}
							var gap = app.holidaylist.XLSColArray[col].gap;	
							if(gap === 0){
								app.holidaylist.XLSColArray[col].gap = app.holidaylist.defaultColGap;
							}
							
						}
					});	
				});
				
			};
			
			var weekList = function() {
				var html = '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input type="checkbox" name="option1" value="" class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick">Mon</span></li>';
				html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input type="checkbox" name="option1" value="" class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick">Tue</span></li>';
				html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input type="checkbox" name="option1" value="" class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick">Wed</span></li>';
				html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input type="checkbox" name="option1" value="" class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick">Thu</span></li>';
				html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input type="checkbox" name="option1" value="" class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick">Fri</span></li>';
				html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input type="checkbox" name="option1" checked="checked" class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick">Sat</span></li>';
				html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input type="checkbox" name="option1" checked="checked" class="doNotHideOnClick"/></span><span class="fl text doNotHideOnClick">Sun</span></li>';
				html += '<li class="doNotHideOnClick"><span class="fl doNotHideOnClick"><input name="input4" type="button" class="buttonholiday" value="Apply" /></li>';
				return html;
			};

			function preventPropagation(event) {
				if (event) {
					if (event.preventDefault) {
						event.preventDefault();
						event.cancelBubble = true;
						event.returnValue = false;
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
						event.returnValue = false;
						event.stopPropagation();
						return false;
					}
				}
			}
			/*$('body').click(
			function(event) {
				if (event.target.parentNode.className
						.indexOf("doNotHideOnClick") == -1)
					$('.week_list_select').hide(
							$('.hd_shadow .slimScrollDiv').css({
								width : '130px'
							}));
				// $('.hd_shadow .slimScrollDiv').css({width: '130px'});
			});*/
				
			

		});


//relating data 


var dummyholidaylist = {
		"lon":{	"centreid":"Abu Dhabi",
				"holidays":["20120101","20120102","20120103","20120104","20120105","20120106","20120107","20120108"],
				"weekends":[0,0,0,0,0,1,1]
					},
		"dubai":{"centreid":"Abu Dhabi",
				 "holidays":["20120201","20120202","20120203","20120204","20120205","20120206","20120207","20120208"],
				 "weekends":[0,0,0,0,0,1,1]
					},
		"mont":{"centreid":"Abu Dhabi",
				"holidays":["20120301","20120302","20120303","20120304","20120305","20120306","20120307","20120308"],
				"weekends":[0,0,0,0,0,1,1]
					},
		"usa":{"centreid":"Abu Dhabi",
			   "holidays":["20120401","20120402","20120403","20120404","20120405","20120406","20120407","20120408"],
			   "weekends":[0,0,0,0,0,1,1]
					},
		"barc":{"centreid":"Abu Dhabi",
				"holidays":["20120501","20120502","20120503","20120504","20120505","20120506","20120507","20120508"],
				"weekends":[0,0,0,0,0,1,1]
					},
		"ind":{"centreid":"Abu Dhabi",
			   "holidays":["20120601","20120602","20120603","20120604","20120605","20120606","20120607","20120608"],
			   "weekends":[0,0,0,0,0,1,1]
		}			

};
var data5 = [];
var tempData = [];
var maxRowCount = 0;
var index = 0,curLength;
var sortedList = [];
var originalSortedList = [];
var originalData = {};
var maxRowCount = 0;
for(var i in dummyholidaylist){
	sortedList.push(i);
	if(dummyholidaylist[i]['holidays'].length > maxRowCount)
		maxRowCount = dummyholidaylist[i]["holidays"].length;
	
}
sortedList.sort();

for(var i=0; i < maxRowCount;i++ )
{
	data5[i] = [];
	tempData[i] = [];
	var colNo = 1;
	for(var j in dummyholidaylist){
		data5[i][colNo] = new dataObj();
		tempData[i][colNo] = new dataObj();
		data5[i][colNo].type =  "date";
		tempData[j][colNo].type = "date";
		data5[i][colNo].value = "";
		tempData[i][colNo].value = "";
		data5[i][colNo].options = {value : ""};
		tempData[i][colNo].options = {value : ""};
		colNo++;
	}
}

//creating data from dummyholidaylist 
var rowNo = 1;
var monthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
for(var i=0;i<sortedList.length;i++){
	var  currList = dummyholidaylist[sortedList[i]]['holidays'];
	currList.sort();
	for(var j=1; j <= currList.length + 1;j++)
	{
		if (j == 1){
			data5[j][rowNo].type =  "none";
			data5[j][rowNo].value = sortedList[i];
			data5[j][rowNo].name = sortedList[i];
			data5[j][rowNo].options = {value : sortedList[i]};
			originalData[sortedList[i]] = [];
		}
		else {
			data5[j][rowNo].type =  "none";
			var year = currList[j-2].slice(0,4);
			var month = currList[j-2].slice(4,6);
			month = monthArray[parseInt(month)];
			var day =currList[j-2].slice(6);
			var givenDate = day + " " + month + " " + year;
			data5[j][rowNo].value = givenDate;
			data5[j][rowNo].options = {value : givenDate};
			originalData[sortedList[i]][j] = givenDate ;
		}
		
		
	}
	
	rowNo++;
}


generateList(sortedList);
app.holidaylist.resetData(data5);
