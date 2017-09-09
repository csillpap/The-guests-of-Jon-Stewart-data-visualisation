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


   //Calculate metrics
   var yearGroup = yearDim.group();


   selectField = dc.selectMenu('#menu-select')
       .dimension(yearDim)
       .group(yearGroup);


   dc.renderAll();
}