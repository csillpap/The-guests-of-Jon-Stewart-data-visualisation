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


   //Calculate metrics
   var yearGroup = yearDim.group();
   var occupationGroup = occupationGroupDim.group();
   var specificOccupations = specificOccupationDim.group();
   var guestGroup = guestDim.group();
   var showGroup = showDim.group();
   var guests_by_year = yearDim.group().reduceCount(function (d) {
       return d["Raw_Guest_List"];
   });

   // filter DailyShowGuests_data for Acting, Media, Politician
	var DailyShowGuests_data_filtered = [];
	var j = 0;
	for (var k in DailyShowGuests_data) {
		if (DailyShowGuests_data[k].Group==="Acting" || DailyShowGuests_data[k].Group==="Media" || DailyShowGuests_data[k].Group==="Politician") {
			DailyShowGuests_data_filtered[j] = {YEAR: DailyShowGuests_data[k].YEAR, Group: DailyShowGuests_data[k].Group };
			j++;
		}
	}
	// create a new crossfilter instance for the filtered data
	var cf = crossfilter(DailyShowGuests_data_filtered);

	// create dimension, group and values to be used in the series chart for Acting, Media, Politician
	var topOccupationByYearDim = cf.dimension(function(d) {
			return [d.YEAR,d.Group];
	});
	var topOccupationByYearGroup = topOccupationByYearDim.group();
	var extent = d3.extent(DailyShowGuests_data_filtered, function(d){return d.YEAR;});

	var extent2 = d3.extent(DailyShowGuests_data, function(d){return d.YEAR;});

	// Charts
   occupationGroupChart = dc.pieChart("#occupation-group-chart");
   specificOccupationChart = dc.rowChart("#specific-occupation-chart");
   topGuestsChart = dc.rowChart("#top-guests-chart");
   guestsByYearChart = dc.lineChart("#guests-by-year-chart");
   var topOccupationGroupsChart = dc.seriesChart("#top-occupation-groups-chart");
   var totalNumberOfGuestsND = dc.numberDisplay("#number-guests-nd");
   var totalNumberOfShowsND = dc.numberDisplay("#number-shows-nd");
   guest_datatable = dc.dataTable('#guest-datatable');
   show_datatable = dc.dataTable("#show-datatable");


   // function to remove data where there were no guests present in the show
    function remove_bins_without_guests(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    return d.key !== "(None)" && d.key !== "(no guest)"
                        && d.key !== "no guest" && d.key !== "none"
                        && d.key !== "No guest" && d.key !== "No Guest"
                        && d.key !== "None" && d.key !== "Greatest Millennium Special"
                        && d.key !== "Third Anniversary Special" && d.key !== "The Daily Show Summer Spectacular"
                        && d.key !== "Tales of Survival with Vance DeGeneres" && d.key !== "Fourth Anniversary Special"
                        && d.key !== "Campaign Trail to the Road to the White House Mo Rocca, Vance DeGeneres"
                        && d.key !== "Road to Washington Special" && d.key !== "Matt Walsh Goes To Hawaii"
                        && d.key !== "Who are the Daily Show? Special" && d.key !== "Looking Beyond The Show"
                        && d.key !== "Iraq - A Look Baq (or how we learned to stop reporting and love the war)"
                        && d.key !== "Again, A Look Back" && d.key !== "I'm a Correspondent, Please Don't Fire Me!"
                        && d.key !== "John Bambenek" && d.key !== "Indecision 2008 Live Election Night Special"
                        && d.key !== "Election Night: This Ends Now"
                        && d.key !== "Stephen Colbert as Al Sharpton (Sharpton had been the scheduled guest)"
                        /* remove Stephen Colbert as Al Sharpton from the guest bins, so the count_bins function does not add it to the number of guests, as
                            we already have Stephen Colbert and Al Sharpton seperately */
                });
            }
        };
    }

   // function to count bins in a specific group
    function count_bins(group) {
        return {
            value: function () {
                return group.all().filter(function (kv) {
                    return kv.value > 0;
                }).length;
            }
        };
    }


   selectYear = dc.selectMenu('#year-select')
       .dimension(yearDim)
       .group(yearGroup);

   selectGuest = dc.selectMenu('#guest-select')
       .dimension(guestDim)
       .group(guestGroup);

   selectShow = dc.selectMenu("#show-select")
       .dimension(showDim)
       .group(showGroup);

   totalNumberOfGuestsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(count_bins(remove_bins_without_guests(guestGroup))); // first remove unnecessary bins, then count the bins

   totalNumberOfShowsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(count_bins(showGroup));


   occupationGroupChart
       .height(350)
       .radius(130)
       .innerRadius(20)
       .transitionDuration(1500)
       .slicesCap(6)
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


   topGuestsChart
       .width(500)
       .height(350)
       .rowsCap(10)
       .othersGrouper(false)
       .elasticX(true)
       .dimension(guestDim)
       .group(guestGroup)
       .xAxis().ticks(4);

   guestsByYearChart
       .width(500)
       .height(350)
       .dimension(yearDim)
       .group(guests_by_year)
       .brushOn(true)
       .renderArea(true)
       .colors(["#EB773D"])
       .x(d3.scale.linear().domain(extent2))
       .y(d3.scale.linear().domain([100, 200]))
       .renderHorizontalGridLines(true)
       .renderVerticalGridLines(true)
       .yAxisLabel("Number of guests");

   topOccupationGroupsChart
		.width(970)
		.height(350)
		.x(d3.scale.linear().domain(extent))
		.brushOn(false)
		.xAxisLabel("Years")
		.yAxisLabel("Count")
		.clipPadding(10)
		.elasticY(true)
		.dimension(topOccupationByYearDim)
		.group(topOccupationByYearGroup)
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
               label: "Show featuring the guest",
               format: function(d) {return d["Show"]}
           },
           {
               label: "Occupation of the guest",
               format: function(d) {return d["GoogleKnowlege_Occupation"]}
           }
       ])
       .size(25);

   show_datatable
       .dimension(showDim2)
       .group(function(d) {return d["Show"];})
       .columns([
           {
               label: "Guest",
               format: function(d) {return d["Raw_Guest_List"]}
           },
           {
               label: "Occupation of the guest",
               format: function(d) {return d["GoogleKnowlege_Occupation"]}
           }
       ])
       .size(25);

   dc.renderAll();
}