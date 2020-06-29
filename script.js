/*
tutorial
https://www.youtube.com/watch?v=c2JjxqgsbJ4&list=PLGXZC1nQpK7dvkAdl9PR04UobAGFa_j8e
*/

// https://searchengineland.com/script-automates-adding-adwords-data-google-spreadsheet-277724 //
// https://developers.google.com/google-ads/scripts/docs/solutions/account-summary  //
/* 
 Valid values of daterange: TODAY, YESTERDAY, LAST_7_DAYS, THIS_WEEK_SUN_TODAY, THIS_WEEK_MON_TODAY, LAST_WEEK, LAST_14_DAYS, 
 LAST_30_DAYS, LAST_WEEK, LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, THIS_MONTH, LAST_MONTH
*/

/*
https://developers.google.com/google-ads/scripts/docs/solutions
*/

/**
*
* The budget tracker plots spend against budget and outputs to a Google Sheet
* We recommend running the script daily
*
* Version: 1.0
*
**/
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//Options
//Specify the sheet url
SHEETURL = ‘PLEASE ENTER YOUR SPREADSHEET URL HERE’
//Specify the email for notifications
EMAIL = 'PLEASE ENTER YOUR EMAIL ADDRESS HERE'
//Specify the email's subject line
EMAILSUBJECT = 'PLEASE ENTER THE EMAIL SUBJECT OF YOUR CHOICE HERE'
//Specify which campaigns to include by selecting a word campaign names should contain. Leave blank ('') to include everything.
CAMPAIGNCONTAINS = ''
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function getReport()
{
if(CAMPAIGNCONTAINS != '')
{
var query = "SELECT Date, Cost from CAMPAIGN_PERFORMANCE_REPORT WHERE CampaignName CONTAINS " + CAMPAIGNCONTAINS +" DURING THIS_MONTH"
}
else
{
var query = "SELECT Date, Cost from CAMPAIGN_PERFORMANCE_REPORT DURING THIS_MONTH"
}
var rows = AdWordsApp.report(query).rows()
return rows
}
function parseNumber(num)
{
num = num.replace(",","").toString()
return parseFloat(num)
}
function prepareRows(rows)
{
var days = {}
var today = Utilities.formatDate(new Date(), 'GMT', 'YYYY-MM-dd')
while(rows.hasNext())
{
var row = rows.next()
var existingDays = Object.keys(days)
var day = row['Date']
var cost = parseNumber(row['Cost'])
if(day == today)
{continue}
day = day.slice(8,10)
if(day.slice(0,1) == '0')
{day = day.slice(1,2)}
if(existingDays.indexOf(day) == -1)
{
days[day] = cost
}
else
{
days[day] = days[day] + cost
}
}
return days
}
function daysInMonth (month, year) {
return new Date(year, month, 0).getDate();
}
function writeToSheet(days)
{
var today = new Date()
var m = Utilities.formatDate(today, 'GMT', 'MM')
var y = Utilities.formatDate(today, 'GMT', 'yyyy')
var numOfDays = daysInMonth(m,y)
var sheet = SpreadsheetApp.openByUrl(SHEETURL).getActiveSheet()
var rangeFull = "D3:F33"
var rangeString = "D3:F" + (numOfDays + 2).toFixed(0)
var range = sheet.getRange(rangeString)
var clientBudget = sheet.getRange("B5:B5").getValue()
var rows = []
var firstEntry = false
sheet.getRange(rangeFull).clear()
for(var i = 1; i < numOfDays + 1; i++)
{
var cells = []
var cost = 0
if(days[i] == undefined)
{cells.push(i,clientBudget,'')
rows.push(cells)
continue
}
for(var j = 1; j<= i; j ++)
{
cost = cost + days[j]
}
if(!firstEntry)
{
if(days[i+1] == undefined)
{var maxSpend = cost
firstEntry = true}
}
cells.push(i,clientBudget,cost.toFixed(2))
rows.push(cells)
}
range.setValues(rows)
var spendLineString = "G3:G" + (numOfDays + 2).toFixed(0)
var spendLineRange = sheet.getRange(spendLineString)
spendLineRange.clear()
spendLineRange.setFormula('E:E/'+numOfDays.toFixed(0)+'*D:D')
return [maxSpend,clientBudget]
}
function main()
{
var rows = getReport()
var days = prepareRows(rows)
var data = writeToSheet(days)
var maxSpend = data[0]
var budget = data[1]
var budgetSpent = ((maxSpend/budget)*100).toFixed(0)
var accountName = AdWordsApp.currentAccount().getName()
var body = 'Your account '+ accountName + ' spent '+ budgetSpent + '% of the budget until yesterday'
MailApp.sendEmail(EMAIL, '', EMAILSUBJECT, body)
}

