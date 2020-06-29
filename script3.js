function main () {

  var agi = AdWordsApp.adGroups().get();
  
  while (agi.hasNext()) {
  
    var ag = agi.next();
    
    Logger.log("AdGroup: " + ag.getName());
  }
  
};
