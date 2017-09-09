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


   //Calculate metrics
   var yearGroup = yearDim.group();
   var occupationGroup = occupationGroupDim.group();


   // Charts
   var occupationGroupChart = dc.pieChart("#occupation-group-chart");


   selectField = dc.selectMenu('#menu-select')
       .dimension(yearDim)
       .group(yearGroup);


   occupationGroupChart
       .height(350)
       .radius(130)
       .innerRadius(20)
       .transitionDuration(1500)
       .dimension(occupationGroupDim)
       .group(occupationGroup);


   dc.renderAll();
}