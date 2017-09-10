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


   //Calculate metrics
   var yearGroup = yearDim.group();
   var occupationGroup = occupationGroupDim.group();
   var specificOccupations = specificOccupationDim.group();
   var guestGroup = guestDim.group();


   // Charts
   var occupationGroupChart = dc.pieChart("#occupation-group-chart");
   var specificOccupationChart = dc.rowChart("#specific-occupation-chart");


   selectField = dc.selectMenu('#menu-select')
       .dimension(yearDim)
       .group(yearGroup);

   selectField = dc.selectMenu('#guest-select')
       .dimension(guestDim)
       .group(guestGroup);


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
       .dimension(specificOccupationDim)
       .group(specificOccupations)
       .xAxis().ticks(4);


   dc.renderAll();
}