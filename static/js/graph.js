/**
 * Created by csill on 09/09/2017.
 */


queue()
   .defer(d3.json, "/DailyShow/guests_data")
   .await(makeGraphs);

function makeGraphs(error, projectsJson) {

   //Clean projectsJson data
   var DailyShowGuests_data = projectsJson;


   //Create a Crossfilter instance
   var ndx = crossfilter(DailyShowGuests_data);


   //Define Dimensions
   var yearDim = ndx.dimension(function (d) {
       return d["YEAR"];
   });
   var occupationGroupDim = ndx.dimension(function (d) {
       return d["Group"];
   });
   var specificOccupationDim = ndx.dimension(function (d) {
       return d["GoogleKnowlege_Occupation"];
   });
   var guestDim = ndx.dimension(function (d) {
       return d["Raw_Guest_List"];
   });
   var guestDim2 = ndx.dimension(function (d) {
       return d["Raw_Guest_List"];
   });
   var showDim = ndx.dimension(function (d) {
       return d["Show"];
   });
   var showDim2 = ndx.dimension(function (d) {
       return d["Show"];
   });
   var occupationGroupWithYearDim = ndx.dimension(function(d) {
			return [d["YEAR"],d["Group"]];
	});


   //Calculate metrics
   var yearGroup = yearDim.group();
   var occupationGroup = occupationGroupDim.group();
   var specificOccupations = specificOccupationDim.group();
   var guestGroup = guestDim.group();
   var showGroup = showDim.group();
   var occupationGroupByYear = occupationGroupWithYearDim.group();

   var resultGroupByYear = occupationGroupByYear.all();

   var GroupYearValue = [];
   var j = 0;
   for (var i in resultGroupByYear) {
		if (resultGroupByYear[i].key[1]==="Acting" || resultGroupByYear[i].key[1]==="Media" || resultGroupByYear[i].key[1]==="Politician") {
			GroupYearValue[j] = {year: resultGroupByYear[i].key[0], group: resultGroupByYear[i].key[1], value: resultGroupByYear[i].value };
			j++;
		}
	}

    var	addT = function(p, d){ return p + d.value;};
	var remT = function(p, d){ return p - d.value;};
	var ini = function(){ return 0;};
	var cf = crossfilter(GroupYearValue);
	var time_field = cf.dimension(function(d) { return [d.year, d.group];});
	var time_fields = time_field.group().reduce( 	addT, remT, ini );
	var extent = d3.extent(GroupYearValue, function(d){return d.year;});

   // Charts
   var occupationGroupChart = dc.pieChart("#occupation-group-chart");
   var specificOccupationChart = dc.rowChart("#specific-occupation-chart");
   var topOccupationGroupsChart = dc.seriesChart("#top-occupation-groups-chart");
   guest_datatable = dc.dataTable('#guest-datatable');
   show_datatable = dc.dataTable("#show-datatable");


   selectField = dc.selectMenu('#menu-select')
       .dimension(yearDim)
       .group(yearGroup);

   selectField = dc.selectMenu('#guest-select')
       .dimension(guestDim)
       .group(guestGroup);

   selectField = dc.selectMenu("#show-select")
       .dimension(showDim)
       .group(showGroup);


   occupationGroupChart
       .height(350)
       .radius(130)
       .innerRadius(20)
       .transitionDuration(1500)
       .dimension(occupationGroupDim)
       .group(occupationGroup);


   specificOccupationChart
       .width(500)
       .height(350)
       .rowsCap(10)
       .othersGrouper(false)
       .elasticX(true)
       .dimension(specificOccupationDim)
       .group(specificOccupations)
       .xAxis().ticks(4);

   topOccupationGroupsChart
		.width(1000)
		.height(400)
		.x(d3.scale.linear().domain(extent))
		.brushOn(false)
		.xAxisLabel("Years")
		.yAxisLabel("Count")
		.clipPadding(10)
		.elasticY(true)
		.dimension(time_field)
		.group(time_fields)
		.seriesAccessor(function(d) { return  d.key[1]; })
		.keyAccessor(function(d) {return d.key[0];})
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.legend(dc.legend().x(0.35*600).y(260).itemHeight(13).gap(15));

   guest_datatable
       .dimension(guestDim2)
       .group(function(d) {return d["Raw_Guest_List"];})
       .columns([
           {
               label: "Show",
               format: function(d) {return d["Show"]}
           },
           {
               label: "Occupation",
               format: function(d) {return d["GoogleKnowlege_Occupation"]}
           }
       ])
       .size(DailyShowGuests_data.length);

   show_datatable
       .dimension(showDim2)
       .group(function(d) {return d["Show"];})
       .columns([
           {
               label: "Guest",
               format: function(d) {return d["Raw_Guest_List"]}
           },
           {
               label: "Occupation",
               format: function(d) {return d["GoogleKnowlege_Occupation"]}
           }
       ])
       .size(DailyShowGuests_data.length);

   dc.renderAll();
}