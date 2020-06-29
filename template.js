function main () {

  var agi = AdWordsApp.adGroups().get();
  
  while (agi.hasNext()) {
  
    var ag = agi.next();
    
    Logger.log("AdGroup: " + ag.getName());
  }
  
};


function main () {
  
  var r = AdWordsApp.report("SELECT Clicks, Impressions FROM ACCOUNT_PERFORMANCE_REPORT DURING THIS_MONTH");
  
  var rows = r.rows();
  
  while (rows.hasNext()) {
    var data = rows.next();

    Logger.log(data["Impression"]);
  
  }
  
};
